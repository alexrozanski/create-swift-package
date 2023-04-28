const { yamlPlugin } = require('esbuild-plugin-yaml');

require('esbuild').build({
  entryPoints: ['index.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [yamlPlugin()],
  loader: {
    '.yaml': 'text',
    '.yml': 'text',
  },
  platform: 'node',
}).catch((e) => console.error(e.message));
