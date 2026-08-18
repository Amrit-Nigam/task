import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const API_PROXY_TARGET = process.env.VITE_API_PROXY ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    // In development the client talks to the local API through this proxy, so
    // no CORS handshake and no base URL to configure.
    proxy: { "/api": { target: API_PROXY_TARGET, changeOrigin: true } },
  },
});
