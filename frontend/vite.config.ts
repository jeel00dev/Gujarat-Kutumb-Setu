import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:8005", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:8005" },
    },
  },
  build: { target: "es2022", sourcemap: false },
});
