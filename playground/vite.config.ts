import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: {
      "@antdv-next/happy-work-theme": resolve(__dirname, "../src/index.ts"),
    },
  },
});
