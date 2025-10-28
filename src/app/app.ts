import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

interface Entry {
  id: string;
  type: 'outgoing' | 'incoming';
  bank?: string;
  description: string;
  amount: number;
  startMonth: string;
  reflection: number[];
  cycles: number;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('finance-tracker');
  
  entries: Entry[] = [];
  showModal = false;
  showFabMenu = false;
  editingEntry: Entry | null = null;
  currentEntry: Entry = this.getEmptyEntry();
  periods: string[] = [];
  bankGroups: any = {};
  incomingEntries: any = {};
  bankAdjustments: { [bank: string]: { [period: string]: number } } = {};
  cellAdjustments: { [entryId: string]: { [period: string]: number } } = {};
  editingCell: { entryId: string; period: string } | null = null;
  editingBankCell: { bank: string; period: string } | null = null;
  editingValue = '';

  constructor() {
    this.loadEntries();
    this.renderPivot();
  }

  private getEmptyEntry(): Entry {
    return {
      id: '',
      type: 'outgoing',
      bank: '',
      description: '',
      amount: 0,
      startMonth: '',
      reflection: [15],
      cycles: 0
    };
  }

  private safeUUID(): string {
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private loadEntries(): void {
    if (typeof localStorage !== 'undefined') {
      this.entries = JSON.parse(localStorage.getItem('entries') || '[]');
      // Migrate old reflection format to array
      this.entries.forEach(entry => {
        if (typeof entry.reflection === 'number') {
          entry.reflection = [entry.reflection];
        }
      });
      this.bankAdjustments = JSON.parse(localStorage.getItem('bankAdjustments') || '{}');
      this.cellAdjustments = JSON.parse(localStorage.getItem('cellAdjustments') || '{}');
    }
  }

  private saveEntries(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('entries', JSON.stringify(this.entries));
      localStorage.setItem('bankAdjustments', JSON.stringify(this.bankAdjustments));
      localStorage.setItem('cellAdjustments', JSON.stringify(this.cellAdjustments));
    }
  }

  addEntry(type: 'outgoing' | 'incoming'): void {
    this.editingEntry = null;
    this.currentEntry = { ...this.getEmptyEntry(), type };
    this.showModal = true;
  }

  saveEntry(): void {
    if (this.editingEntry) {
      const index = this.entries.findIndex(e => e.id === this.editingEntry!.id);
      if (index !== -1) {
        this.entries[index] = { ...this.currentEntry };
        // Clear cell adjustments for periods not covered by new configuration
        this.clearInvalidCellAdjustments(this.editingEntry.id, this.currentEntry);
      }
    } else {
      this.currentEntry.id = this.safeUUID();
      this.entries.push({ ...this.currentEntry });
    }
    
    this.saveEntries();
    this.renderPivot();
    this.closeModal();
  }

  private clearInvalidCellAdjustments(entryId: string, entry: Entry): void {
    if (!this.cellAdjustments[entryId]) return;
    
    const months = this.generateMonths();
    const validPeriods = new Set<string>();
    
    // Calculate which periods are valid for this entry
    months.forEach(m => {
      ["15", "30"].forEach(day => {
        const monthDate = new Date(m + "-01");
        const startDate = new Date(entry.startMonth + "-01");
        const diffMonths = (monthDate.getFullYear() - startDate.getFullYear()) * 12 + (monthDate.getMonth() - startDate.getMonth());
        
        const dateLabel = new Date(m + "-01");
        const monthName = dateLabel.toLocaleString("default", {month: "long"});
        const periodKey = `${monthName} ${day}th`;
        
        if (diffMonths >= 0 && (entry.cycles === 0 || diffMonths < entry.cycles) && entry.reflection.includes(parseInt(day))) {
          validPeriods.add(periodKey);
        }
      });
    });
    
    // Remove adjustments for invalid periods
    Object.keys(this.cellAdjustments[entryId]).forEach(period => {
      if (!validPeriods.has(period)) {
        delete this.cellAdjustments[entryId][period];
      }
    });
    
    // Clean up empty adjustment objects
    if (Object.keys(this.cellAdjustments[entryId]).length === 0) {
      delete this.cellAdjustments[entryId];
    }
  }

  deleteEntry(): void {
    if (this.editingEntry) {
      this.entries = this.entries.filter(e => e.id !== this.editingEntry!.id);
      this.saveEntries();
      this.renderPivot();
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEntry = null;
    this.currentEntry = this.getEmptyEntry();
  }

  downloadData(): void {
    const blob = new Blob([JSON.stringify(this.entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  uploadData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.entries = JSON.parse(e.target?.result as string);
          this.saveEntries();
          this.renderPivot();
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(input.files[0]);
    }
  }

  private generateMonths(): string[] {
    const months = [];
    const today = new Date();
    today.setDate(1);
    for (let i = 0; i < 12; i++) {
      const m = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
      months.push(m.toISOString().slice(0, 7));
    }
    return months;
  }

  private renderPivot(): void {
    const months = this.generateMonths();
    this.periods = [];
    const today = new Date();
    
    months.forEach(m => {
      ["15", "30"].forEach(day => {
        const periodDate = new Date(m + "-" + day);
        if (periodDate > today) {
          const dateLabel = new Date(m + "-01");
          const monthName = dateLabel.toLocaleString("default", {month: "long"});
          this.periods.push(`${monthName} ${day}th`);
        }
      });
    });

    this.bankGroups = {};
    this.incomingEntries = {};
    
    this.entries.forEach(entry => {
      if (entry.type === 'incoming') {
        if (!this.incomingEntries[entry.description]) {
          this.incomingEntries[entry.description] = { entry, periods: {} };
        }
      } else {
        const bankKey = entry.bank || "No Bank";
        if (!this.bankGroups[bankKey]) {
          this.bankGroups[bankKey] = { outgoing: {} };
        }
        if (!this.bankGroups[bankKey].outgoing[entry.description]) {
          this.bankGroups[bankKey].outgoing[entry.description] = { entry, periods: {} };
        }
      }
      
      months.forEach(m => {
        ["15", "30"].forEach(day => {
          const monthDate = new Date(m + "-01");
          const startDate = new Date(entry.startMonth + "-01");
          const diffMonths = (monthDate.getFullYear() - startDate.getFullYear()) * 12 + (monthDate.getMonth() - startDate.getMonth());
          
          const dateLabel = new Date(m + "-01");
          const monthName = dateLabel.toLocaleString("default", {month: "long"});
          const periodKey = `${monthName} ${day}th`;
          
          if (diffMonths >= 0 && (entry.cycles === 0 || diffMonths < entry.cycles) && entry.reflection.includes(parseInt(day))) {
            if (entry.type === 'incoming') {
              this.incomingEntries[entry.description].periods[periodKey] = entry.amount;
            } else {
              const bankKey = entry.bank || "No Bank";
              this.bankGroups[bankKey].outgoing[entry.description].periods[periodKey] = entry.amount;
            }
          }
        });
      });
    });
  }

  getBankKeys(): string[] {
    return Object.keys(this.bankGroups);
  }

  getOutgoingDescriptions(bank: string): string[] {
    return this.bankGroups[bank] ? Object.keys(this.bankGroups[bank].outgoing) : [];
  }

  getIncomingDescriptions(): string[] {
    return Object.keys(this.incomingEntries);
  }

  getAmount(bank: string, description: string, period: string, type: 'outgoing' | 'incoming'): number {
    let baseAmount = 0;
    let entryId = '';
    
    if (type === 'incoming') {
      baseAmount = this.incomingEntries[description]?.periods[period] || 0;
      entryId = this.getIncomingEntryId(description);
    } else {
      baseAmount = this.bankGroups[bank]?.outgoing[description]?.periods[period] || 0;
      entryId = this.getEntryId(bank, description);
    }
    
    // Add cell-specific adjustment for this period
    const adjustment = this.cellAdjustments[entryId]?.[period] || 0;
    return baseAmount + adjustment;
  }

  getEntryId(bank: string, description: string): string {
    return this.bankGroups[bank]?.outgoing[description]?.entry?.id || '';
  }

  getIncomingEntryId(description: string): string {
    return this.incomingEntries[description]?.entry?.id || '';
  }

  editEntryById(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      this.editingEntry = entry;
      this.currentEntry = { ...entry };
      this.showModal = true;
    }
  }

  getTotalOutgoing(period: string): number {
    let total = 0;
    Object.keys(this.bankGroups).forEach(bank => {
      total += this.getBankTotal(bank, period);
    });
    return total;
  }

  getTotalIncoming(period: string): number {
    let total = 0;
    Object.keys(this.incomingEntries).forEach(desc => {
      total += this.getAmount('', desc, period, 'incoming');
    });
    return total;
  }

  getNet(period: string): number {
    return this.getTotalIncoming(period) - this.getTotalOutgoing(period);
  }

  getPreviousPeriodAdjustment(period: string): number {
    const currentIndex = this.periods.indexOf(period);
    if (currentIndex <= 0) return 0;
    
    let cumulativeBalance = 0;
    for (let i = 0; i < currentIndex; i++) {
      cumulativeBalance += this.getNet(this.periods[i]);
    }
    return cumulativeBalance;
  }

  getAdjustedBalance(period: string): number {
    return this.getNet(period) + this.getPreviousPeriodAdjustment(period);
  }

  getBankTotal(bank: string, period: string): number {
    let total = 0;
    if (this.bankGroups[bank]) {
      Object.keys(this.bankGroups[bank].outgoing).forEach(desc => {
        total += this.getAmount(bank, desc, period, 'outgoing');
      });
    }
    // Add bank-specific adjustment for this period
    const adjustment = this.bankAdjustments[bank]?.[period] || 0;
    return total + adjustment;
  }

  startBankCellEdit(bank: string, period: string): void {
    const currentTotal = this.getBankTotal(bank, period);
    this.editingBankCell = { bank, period };
    this.editingValue = currentTotal.toString();
  }

  saveBankCellEdit(): void {
    if (!this.editingBankCell) return;
    
    const { bank, period } = this.editingBankCell;
    const newTotal = parseFloat(this.editingValue) || 0;
    
    // Calculate current total from entries
    let entriesTotal = 0;
    if (this.bankGroups[bank]) {
      Object.keys(this.bankGroups[bank].outgoing).forEach(desc => {
        entriesTotal += this.bankGroups[bank].outgoing[desc].periods[period] || 0;
      });
    }
    
    // Calculate adjustment needed
    const adjustment = newTotal - entriesTotal;
    
    // Initialize bank adjustments if needed
    if (!this.bankAdjustments[bank]) {
      this.bankAdjustments[bank] = {};
    }
    
    // Store the adjustment
    this.bankAdjustments[bank][period] = adjustment;
    
    this.saveEntries();
    this.editingBankCell = null;
    this.editingValue = '';
  }

  cancelBankCellEdit(): void {
    this.editingBankCell = null;
    this.editingValue = '';
  }

  isBankEditing(bank: string, period: string): boolean {
    return this.editingBankCell?.bank === bank && this.editingBankCell?.period === period;
  }

  toggleFabMenu(): void {
    this.showFabMenu = !this.showFabMenu;
  }

  startCellEdit(entryId: string, period: string, currentValue: number): void {
    this.editingCell = { entryId, period };
    this.editingValue = currentValue.toString();
  }

  saveCellEdit(): void {
    if (!this.editingCell) return;
    
    const { entryId, period } = this.editingCell;
    const newValue = parseFloat(this.editingValue) || 0;
    
    // Get the original amount for this period from the entry
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) {
      // Calculate what the original amount would be for this period
      let originalAmount = 0;
      const months = this.generateMonths();
      
      months.forEach(m => {
        ["15", "30"].forEach(day => {
          const monthDate = new Date(m + "-01");
          const startDate = new Date(entry.startMonth + "-01");
          const diffMonths = (monthDate.getFullYear() - startDate.getFullYear()) * 12 + (monthDate.getMonth() - startDate.getMonth());
          
          const dateLabel = new Date(m + "-01");
          const monthName = dateLabel.toLocaleString("default", {month: "long"});
          const periodKey = `${monthName} ${day}th`;
          
          if (periodKey === period && diffMonths >= 0 && (entry.cycles === 0 || diffMonths < entry.cycles) && entry.reflection.includes(parseInt(day))) {
            originalAmount = entry.amount;
          }
        });
      });
      
      // Set the cell value directly (not as adjustment)
      const adjustment = newValue - originalAmount;
      
      // Initialize cell adjustments if needed
      if (!this.cellAdjustments[entryId]) {
        this.cellAdjustments[entryId] = {};
      }
      
      // Store the adjustment to achieve the desired value
      this.cellAdjustments[entryId][period] = adjustment;
      
      this.saveEntries();
    }
    
    this.editingCell = null;
    this.editingValue = '';
  }

  cancelCellEdit(): void {
    this.editingCell = null;
    this.editingValue = '';
  }

  isEditing(entryId: string, period: string): boolean {
    return this.editingCell?.entryId === entryId && this.editingCell?.period === period;
  }

  resetData(): void {
    if (confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      this.entries = [];
      this.bankAdjustments = {};
      this.cellAdjustments = {};
      this.saveEntries();
      this.renderPivot();
    }
  }
}