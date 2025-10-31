
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://jecelbix.github.io/finance-tracker/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/finance-tracker"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 60611, hash: 'c0a4437c8b66e881bccbe9f9b1a67f44ed6a30364bd0dbf96b5acc71513abdfc', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17103, hash: '10f56bebf83e9be63501598bf6ed416a0709fc44b7b1c9570e8ef9dac9120565', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 110806, hash: 'dd37ea9d5f6c95f41d76b7009897b4ccbb4ba49e59c7583f62196d88dc16007b', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-7AVBGXRZ.css': {size: 85747, hash: 'w6PL3DQQpHE', text: () => import('./assets-chunks/styles-7AVBGXRZ_css.mjs').then(m => m.default)}
  },
};
