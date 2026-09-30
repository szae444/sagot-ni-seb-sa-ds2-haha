import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Everything (JS, CSS, fonts) is inlined into one HTML file,
// so the site opens offline by double-clicking it.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000, cssCodeSplit: false },
});
