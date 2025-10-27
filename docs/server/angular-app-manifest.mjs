
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
    'index.csr.html': {size: 60584, hash: '125275c47337f6bb4becf985f81a68bab8c7da7594a44c19117b8b755257db67', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17076, hash: '2f6cb9975116a630f0160962a15cc2fbf17de4a12d7b93f2aadadff3e066d762', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 108312, hash: '82978663aa0db9870768db83c6cc7920d410f64f74d613cf0aafdcbf9f861b94', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-7AVBGXRZ.css': {size: 85747, hash: 'w6PL3DQQpHE', text: () => import('./assets-chunks/styles-7AVBGXRZ_css.mjs').then(m => m.default)}
  },
};
