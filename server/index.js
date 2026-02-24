import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Admin credentials (same as frontend fallback; in production use env + hashed passwords)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@rebellionluxury.ch").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "huracan2025";
const JWT_SECRET = process.env.JWT_SECRET || "rebellion-luxury-jwt-secret-change-in-production";
const COOKIE_NAME = "rebellion_refresh";

const DATA_DIR = path.join(__dirname, "data");
const STORE_FILE = path.join(DATA_DIR, "refresh-tokens.json");
const ADMIN_VEHICLES_FILE = path.join(DATA_DIR, "admin-vehicles.json");

function loadRefreshStore() {
  const map = new Map();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf8");
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const { id, userId, expiresAt, createdAt } of arr) {
          if (id && userId && expiresAt) map.set(id, { userId, expiresAt, createdAt: createdAt || expiresAt });
        }
      }
    }
  } catch {
    // ignore
  }
  return map;
}

function saveRefreshStore(map) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const now = Date.now();
    const arr = [];
    for (const [id, entry] of map.entries()) {
      if (entry.expiresAt > now) arr.push({ id, userId: entry.userId, expiresAt: entry.expiresAt, createdAt: entry.createdAt });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(arr), "utf8");
  } catch (err) {
    console.error("Failed to save refresh tokens:", err);
  }
}

// Refresh token store (mémoire + fichier) : tokenId -> { userId, expiresAt, createdAt }
const refreshStore = loadRefreshStore();

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_DAYS_REMEMBER = 90;
const REFRESH_DAYS_SESSION = 1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === "production";
const frontOrigin = process.env.FRONT_ORIGIN || "http://localhost:5173";
// En dev (proxy Vite), le cookie est reçu par le client depuis la même origine ; Secure=false pour HTTP
const cookieSecure = isProd;

app.use(
  cors({
    origin: frontOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

function setRefreshCookie(res, token, rememberMe) {
  const maxAgeDays = rememberMe ? REFRESH_DAYS_REMEMBER : REFRESH_DAYS_SESSION;
  const maxAgeMs = maxAgeDays * MS_PER_DAY;
  const cookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: Math.floor(maxAgeMs / 1000),
    path: "/",
  };
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true, secure: cookieSecure, sameSite: "lax", maxAge: 0 });
}

function createAccessToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function createRefreshToken(userId, rememberMe) {
  const tokenId = uuidv4();
  const days = rememberMe ? REFRESH_DAYS_REMEMBER : REFRESH_DAYS_SESSION;
  const createdAt = Date.now();
  const expiresAt = createdAt + days * MS_PER_DAY;
  refreshStore.set(tokenId, { userId, expiresAt, createdAt });
  saveRefreshStore(refreshStore);
  return { tokenId, expiresAt };
}

function validateRefreshToken(tokenId) {
  const entry = refreshStore.get(tokenId);
  if (!entry || entry.expiresAt < Date.now()) {
    if (entry) {
      refreshStore.delete(tokenId);
      saveRefreshStore(refreshStore);
    }
    return null;
  }
  return entry;
}

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password, rememberMe } = req.body || {};
  const remember = rememberMe === true;
  const emailNorm = (email || "").trim().toLowerCase();
  if (emailNorm !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }
  const userId = "admin";
  const { tokenId } = createRefreshToken(userId, remember);
  const accessToken = createAccessToken(userId);
  setRefreshCookie(res, tokenId, remember);
  res.json({ accessToken });
});

// POST /api/auth/refresh — rotation: nouveau refresh token, invalider l'ancien
app.post("/api/auth/refresh", (req, res) => {
  const tokenId = req.cookies?.[COOKIE_NAME];
  if (!tokenId) return res.status(401).json({ error: "No refresh token" });
  const entry = validateRefreshToken(tokenId);
  if (!entry) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
  refreshStore.delete(tokenId);
  saveRefreshStore(refreshStore);
  const rememberMe = entry.expiresAt - entry.createdAt > MS_PER_DAY * 7;
  const { tokenId: newTokenId } = createRefreshToken(entry.userId, rememberMe);
  setRefreshCookie(res, newTokenId, rememberMe);
  const accessToken = createAccessToken(entry.userId);
  res.json({ accessToken });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  const tokenId = req.cookies?.[COOKIE_NAME];
  if (tokenId) {
    refreshStore.delete(tokenId);
    saveRefreshStore(refreshStore);
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
});

// POST /api/auth/logout-all — invalider tous les refresh tokens pour l'utilisateur
app.post("/api/auth/logout-all", (req, res) => {
  const tokenId = req.cookies?.[COOKIE_NAME];
  let userId = null;
  if (tokenId) {
    const entry = refreshStore.get(tokenId);
    if (entry) userId = entry.userId;
    refreshStore.delete(tokenId);
  }
  if (userId) {
    for (const [id, entry] of refreshStore.entries()) {
      if (entry.userId === userId) refreshStore.delete(id);
    }
  }
  saveRefreshStore(refreshStore);
  clearRefreshCookie(res);
  res.json({ ok: true });
});

// ——— Flotte admin (synchronisation IA / catalogue) ———
function loadAdminVehiclesFile() {
  try {
    if (fs.existsSync(ADMIN_VEHICLES_FILE)) {
      const raw = fs.readFileSync(ADMIN_VEHICLES_FILE, "utf8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveAdminVehiclesFile(vehicles) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADMIN_VEHICLES_FILE, JSON.stringify(vehicles), "utf8");
  } catch (err) {
    console.error("Failed to save admin vehicles:", err);
  }
}

// GET /api/admin-vehicles — liste publique pour l’IA et le catalogue (tous les visiteurs)
app.get("/api/admin-vehicles", (req, res) => {
  const vehicles = loadAdminVehiclesFile();
  res.json(vehicles);
});

// POST /api/admin-vehicles — enregistrer la flotte admin (appelé depuis Espace pro après ajout/édition/suppression)
app.post("/api/admin-vehicles", (req, res) => {
  const vehicles = req.body?.vehicles;
  if (!Array.isArray(vehicles)) {
    return res.status(400).json({ error: "Body must contain { vehicles: [] }" });
  }
  saveAdminVehiclesFile(vehicles);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Auth API running on http://localhost:${PORT}`);
});
