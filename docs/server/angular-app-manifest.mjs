
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/finance-tracker/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/finance-tracker"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 60585, hash: '46277621abc2db47926abcc585b632359a6042962046f513389fa5dcd93fa26c', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17077, hash: 'e9e556265d2a10f2a106e68eee5eacee444c4bf8a4bfcbd7a2c0615325644e38', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 108313, hash: '0f97300593d75e2f78325388dffc77ad3b36081f5faffe8ab1c488cd5c975269', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-7AVBGXRZ.css': {size: 85747, hash: 'w6PL3DQQpHE', text: () => import('./assets-chunks/styles-7AVBGXRZ_css.mjs').then(m => m.default)}
  },
};
