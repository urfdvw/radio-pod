import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// iOS Safari refuses to execute inline <script type="module" crossorigin> —
// the crossorigin attribute triggers a CORS check even on inline content.
// Strip it after vite-plugin-singlefile has inlined scripts via generateBundle.
const removeInlineCrossorigin = {
  name: 'remove-inline-crossorigin',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'asset' && chunk.fileName.endsWith('.html')) {
        chunk.source = String(chunk.source).replace(
          /<script type="module" crossorigin>/g,
          '<script type="module">'
        );
      }
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), removeInlineCrossorigin],
  build: {
    outDir: 'docs',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
  },
})
