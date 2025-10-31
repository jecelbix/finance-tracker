
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/finance-tracker',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/finance-tracker"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 60584, hash: 'cfeb8995b11c8ad67c455168a394c0090c80cf9366c832edf3ad75be52b2e37c', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17076, hash: '5216f6b1b83f07bcd320d1861930f132786aefeadedf13ae19fc3f4c0367c616', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 110779, hash: '317f2405349c0283846033018818e3667832115fb50bd312baff9a5591bacb04', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-7AVBGXRZ.css': {size: 85747, hash: 'w6PL3DQQpHE', text: () => import('./assets-chunks/styles-7AVBGXRZ_css.mjs').then(m => m.default)}
  },
};
