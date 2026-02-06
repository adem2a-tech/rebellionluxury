import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// #region agent log
function debugLog(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  const dir = path.join(__dirname, ".cursor");
  const logPath = path.join(dir, "debug.log");
  const line = JSON.stringify({ location, message, data, timestamp: Date.now(), sessionId: "debug-session", hypothesisId }) + "\n";
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(logPath, line);
  } catch (_) {}
}
debugLog("vite.config:load", "Vite config loaded", { cwd: __dirname }, "A");
// #endregion

// https://vitejs.dev/config/
// Port 5173 = défaut Vite. Après "npm run dev" → http://localhost:5173
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    {
      name: "debug-server-ready",
      configureServer(server) {
        // #region agent log
        debugLog("vite.config:configureServer", "configureServer called", {}, "A");
        // #endregion
        server.httpServer?.once("listening", () => {
          // #region agent log
          const addr = server.httpServer?.address();
          const port = typeof addr === "object" && addr && "port" in addr ? addr.port : 5173;
          debugLog("vite.config:server", "Vite dev server listening", { port, url: `http://localhost:${port}` }, "A");
          // #endregion
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
