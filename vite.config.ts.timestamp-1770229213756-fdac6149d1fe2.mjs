// vite.config.ts
import { defineConfig } from "file:///C:/Users/sdiri/Videos/MIRA%20BOUTIQUE/btp-ui/rebellion-ai-concierge-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/sdiri/Videos/MIRA%20BOUTIQUE/btp-ui/rebellion-ai-concierge-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import fs from "fs";
var __vite_injected_original_dirname = "C:\\Users\\sdiri\\Videos\\MIRA BOUTIQUE\\btp-ui\\rebellion-ai-concierge-main";
function debugLog(location, message, data, hypothesisId) {
  const dir = path.join(__vite_injected_original_dirname, ".cursor");
  const logPath = path.join(dir, "debug.log");
  const line = JSON.stringify({ location, message, data, timestamp: Date.now(), sessionId: "debug-session", hypothesisId }) + "\n";
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(logPath, line);
  } catch (_) {
  }
}
debugLog("vite.config:load", "Vite config loaded", { cwd: __vite_injected_original_dirname }, "A");
var vite_config_default = defineConfig({
  server: {
    host: true,
    port: 5173,
    open: true,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    {
      name: "debug-server-ready",
      configureServer(server) {
        debugLog("vite.config:configureServer", "configureServer called", {}, "A");
        server.httpServer?.once("listening", () => {
          const addr = server.httpServer?.address();
          const port = typeof addr === "object" && addr && "port" in addr ? addr.port : 5173;
          debugLog("vite.config:server", "Vite dev server listening", { port, url: `http://localhost:${port}` }, "A");
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzZGlyaVxcXFxWaWRlb3NcXFxcTUlSQSBCT1VUSVFVRVxcXFxidHAtdWlcXFxccmViZWxsaW9uLWFpLWNvbmNpZXJnZS1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzZGlyaVxcXFxWaWRlb3NcXFxcTUlSQSBCT1VUSVFVRVxcXFxidHAtdWlcXFxccmViZWxsaW9uLWFpLWNvbmNpZXJnZS1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9zZGlyaS9WaWRlb3MvTUlSQSUyMEJPVVRJUVVFL2J0cC11aS9yZWJlbGxpb24tYWktY29uY2llcmdlLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5cbi8vICNyZWdpb24gYWdlbnQgbG9nXG5mdW5jdGlvbiBkZWJ1Z0xvZyhsb2NhdGlvbjogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBoeXBvdGhlc2lzSWQ6IHN0cmluZykge1xuICBjb25zdCBkaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi5jdXJzb3JcIik7XG4gIGNvbnN0IGxvZ1BhdGggPSBwYXRoLmpvaW4oZGlyLCBcImRlYnVnLmxvZ1wiKTtcbiAgY29uc3QgbGluZSA9IEpTT04uc3RyaW5naWZ5KHsgbG9jYXRpb24sIG1lc3NhZ2UsIGRhdGEsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSwgc2Vzc2lvbklkOiBcImRlYnVnLXNlc3Npb25cIiwgaHlwb3RoZXNpc0lkIH0pICsgXCJcXG5cIjtcbiAgdHJ5IHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgZnMuYXBwZW5kRmlsZVN5bmMobG9nUGF0aCwgbGluZSk7XG4gIH0gY2F0Y2ggKF8pIHt9XG59XG5kZWJ1Z0xvZyhcInZpdGUuY29uZmlnOmxvYWRcIiwgXCJWaXRlIGNvbmZpZyBsb2FkZWRcIiwgeyBjd2Q6IF9fZGlybmFtZSB9LCBcIkFcIik7XG4vLyAjZW5kcmVnaW9uXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG4vLyBQb3J0IDUxNzMgPSBkXHUwMEU5ZmF1dCBWaXRlLiBBcHJcdTAwRThzIFwibnBtIHJ1biBkZXZcIiBcdTIxOTIgaHR0cDovL2xvY2FsaG9zdDo1MTczXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6IFwiZGVidWctc2VydmVyLXJlYWR5XCIsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIC8vICNyZWdpb24gYWdlbnQgbG9nXG4gICAgICAgIGRlYnVnTG9nKFwidml0ZS5jb25maWc6Y29uZmlndXJlU2VydmVyXCIsIFwiY29uZmlndXJlU2VydmVyIGNhbGxlZFwiLCB7fSwgXCJBXCIpO1xuICAgICAgICAvLyAjZW5kcmVnaW9uXG4gICAgICAgIHNlcnZlci5odHRwU2VydmVyPy5vbmNlKFwibGlzdGVuaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAvLyAjcmVnaW9uIGFnZW50IGxvZ1xuICAgICAgICAgIGNvbnN0IGFkZHIgPSBzZXJ2ZXIuaHR0cFNlcnZlcj8uYWRkcmVzcygpO1xuICAgICAgICAgIGNvbnN0IHBvcnQgPSB0eXBlb2YgYWRkciA9PT0gXCJvYmplY3RcIiAmJiBhZGRyICYmIFwicG9ydFwiIGluIGFkZHIgPyBhZGRyLnBvcnQgOiA1MTczO1xuICAgICAgICAgIGRlYnVnTG9nKFwidml0ZS5jb25maWc6c2VydmVyXCIsIFwiVml0ZSBkZXYgc2VydmVyIGxpc3RlbmluZ1wiLCB7IHBvcnQsIHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWAgfSwgXCJBXCIpO1xuICAgICAgICAgIC8vICNlbmRyZWdpb25cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWixTQUFTLG9CQUFvQjtBQUNqYixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTtBQUhmLElBQU0sbUNBQW1DO0FBTXpDLFNBQVMsU0FBUyxVQUFrQixTQUFpQixNQUErQixjQUFzQjtBQUN4RyxRQUFNLE1BQU0sS0FBSyxLQUFLLGtDQUFXLFNBQVM7QUFDMUMsUUFBTSxVQUFVLEtBQUssS0FBSyxLQUFLLFdBQVc7QUFDMUMsUUFBTSxPQUFPLEtBQUssVUFBVSxFQUFFLFVBQVUsU0FBUyxNQUFNLFdBQVcsS0FBSyxJQUFJLEdBQUcsV0FBVyxpQkFBaUIsYUFBYSxDQUFDLElBQUk7QUFDNUgsTUFBSTtBQUNGLFFBQUksQ0FBQyxHQUFHLFdBQVcsR0FBRyxFQUFHLElBQUcsVUFBVSxLQUFLLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDOUQsT0FBRyxlQUFlLFNBQVMsSUFBSTtBQUFBLEVBQ2pDLFNBQVMsR0FBRztBQUFBLEVBQUM7QUFDZjtBQUNBLFNBQVMsb0JBQW9CLHNCQUFzQixFQUFFLEtBQUssaUNBQVUsR0FBRyxHQUFHO0FBSzFFLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ047QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBRXRCLGlCQUFTLCtCQUErQiwwQkFBMEIsQ0FBQyxHQUFHLEdBQUc7QUFFekUsZUFBTyxZQUFZLEtBQUssYUFBYSxNQUFNO0FBRXpDLGdCQUFNLE9BQU8sT0FBTyxZQUFZLFFBQVE7QUFDeEMsZ0JBQU0sT0FBTyxPQUFPLFNBQVMsWUFBWSxRQUFRLFVBQVUsT0FBTyxLQUFLLE9BQU87QUFDOUUsbUJBQVMsc0JBQXNCLDZCQUE2QixFQUFFLE1BQU0sS0FBSyxvQkFBb0IsSUFBSSxHQUFHLEdBQUcsR0FBRztBQUFBLFFBRTVHLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
