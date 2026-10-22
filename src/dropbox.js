// Dossiers locaux des opérations : <01-OPERATIONS>\(<lettre>)\<code opération>
const fs = require("fs");
const path = require("path");
const os = require("os");

function letterFolder(code) {
  const c = String(code || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? `(${c})` : "(0)";
}

function resolveOpFolder(root, code) {
  const clean = String(code || "").trim().replace(/[<>:"/\\|?*]/g, "");
  if (!root || !clean) return null;
  const p = path.join(root, letterFolder(clean), clean);
  return path.resolve(p).startsWith(path.resolve(root) + path.sep) ? p : null;
}

const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// Dossier existant de l'opération : chemin exact, sinon nom équivalent (accents, tirets, apostrophes, « / »)
function findOpFolder(root, code) {
  const exact = resolveOpFolder(root, code);
  if (!exact) return { dir: null, exists: false };
  if (fs.existsSync(exact)) return { dir: exact, exists: true };
  try {
    const parent = path.dirname(exact), want = norm(code);
    const hit = fs.readdirSync(parent, { withFileTypes: true }).find((d) => d.isDirectory() && norm(d.name) === want);
    if (hit) return { dir: path.join(parent, hit.name), exists: true };
  } catch (e) {}
  return { dir: exact, exists: false };
}

// Dropbox de l'utilisateur (info.json) → dossier des opérations, sinon null
function detectRoot() {
  const cands = [];
  for (const base of [process.env.APPDATA, process.env.LOCALAPPDATA]) {
    if (!base) continue;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(base, "Dropbox", "info.json"), "utf8"));
      for (const k of ["business", "personal"]) {
        const p = j[k] && j[k].path;
        if (p) cands.push(path.join(p, "Agence T&K", "01-OPERATIONS"), path.join(p, "01-OPERATIONS"));
      }
    } catch (e) {}
  }
  cands.push(path.join(os.homedir(), "T&K Dropbox", "Agence T&K", "01-OPERATIONS"));
  return cands.find((p) => { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } }) || null;
}

module.exports = { letterFolder, resolveOpFolder, findOpFolder, detectRoot };
