import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/vehicle-detail.css";

const LOG = () => {};

// #region agent log
LOG("main.tsx:entry", "main.tsx executing", { hasDocument: typeof document !== "undefined", hasRoot: !!document.getElementById("root") }, "C");
// #endregion

const rootEl = document.getElementById("root");
if (!rootEl) {
  // #region agent log
  LOG("main.tsx:noRoot", "root element missing", {}, "D");
  // #endregion
  document.body.innerHTML = "<p style='color:#e5e5e5;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;font-family:sans-serif;'>Erreur : élément #root introuvable.</p>";
} else {
  try {
    // #region agent log
    LOG("main.tsx:beforeRender", "calling createRoot and render", {}, "D");
    // #endregion
    createRoot(rootEl).render(<App />);
    // #region agent log
    LOG("main.tsx:afterRender", "createRoot.render completed", {}, "E");
    // #endregion
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // #region agent log
    LOG("main.tsx:catch", "render threw", { error: msg }, "D");
    // #endregion
    rootEl.innerHTML = `<div style="background:#000;color:#e5e5e5;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;text-align:center;">
      <h1 style="font-size:1.25rem;margin-bottom:8px;">Erreur au démarrage</h1>
      <p style="color:#a3a3a3;margin-bottom:16px;">${msg.replace(/</g, "&lt;")}</p>
      <button onclick="location.reload()" style="padding:10px 20px;background:#fff;color:#000;border:none;border-radius:8px;cursor:pointer;">Recharger</button>
    </div>`;
  }
}
