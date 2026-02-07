import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(process.cwd(), 'ClaudeGame'),
  build: {
    outDir: resolve(process.cwd(), 'ClaudeGame/dist'),
    emptyOutDir: true,
  },
});
