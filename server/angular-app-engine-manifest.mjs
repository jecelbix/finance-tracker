
export default {
  basePath: 'https://jecelbix.github.io/finance-tracker',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
