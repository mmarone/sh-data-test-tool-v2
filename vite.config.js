import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" ทำให้ build ออกมาเป็น relative path
// deploy ได้ทั้ง root domain และ sub-path (เช่น GitHub Pages) โดยไม่ต้องแก้ config
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false
  }
});
