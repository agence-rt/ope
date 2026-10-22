const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { findOpFolder, detectRoot } = require("./dropbox");

// Connexions partagées du launcher : variables d'environnement, sinon fichier chiffré (DPAPI)
function agoaConnections() {
  const e = process.env;
  if (e.AGOA_RAGIC_KEY) {
    return { ragic: { key: e.AGOA_RAGIC_KEY, host: e.AGOA_RAGIC_HOST, apname: e.AGOA_RAGIC_APNAME } };
  }
  const f = "C:\\AGOA\\_connexions\\connexions.dat";
  if (process.platform !== "win32" || !fs.existsSync(f)) return {};
  const ps = `Add-Type -AssemblyName System.Security; [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes('${f}'),$null,'CurrentUser'))`;
  try {
    return JSON.parse(execFileSync("powershell", ["-NoProfile", "-Command", ps], { windowsHide: true }).toString());
  } catch (err) { return {}; }
}

ipcMain.handle("agoa:connections", () => agoaConnections());

// Appels Ragic faits ici (processus principal) : pas de blocage CORS, la clé ne transite pas par la page
ipcMain.handle("agoa:ragic", async (_e, req) => {
  const u = new URL(req.url);
  if (!/(^|\.)ragic\.com$/i.test(u.hostname)) return { ok: false, status: 400, json: {} };
  const r = await fetch(req.url, { method: req.method || "GET", headers: req.headers || {}, body: req.body });
  let json = {};
  try { json = await r.json(); } catch (err) {}
  return { ok: r.ok, status: r.status, json };
});


// ---- Dossier Dropbox des opérations (réglage mémorisé par poste) ----
const settingsFile = () => path.join(app.getPath("userData"), "settings.json");
function readSettings() { try { return JSON.parse(fs.readFileSync(settingsFile(), "utf8")); } catch (e) { return {}; } }
function writeSettings(o) { try { fs.writeFileSync(settingsFile(), JSON.stringify(o, null, 2)); } catch (e) {} }
function opsRoot() {
  const r = readSettings().opsRoot;
  if (r && fs.existsSync(r)) return r;
  return detectRoot();
}
async function chooseRoot(win) {
  const r = await dialog.showOpenDialog(win, { title: "Dossier 01-OPERATIONS de la Dropbox", properties: ["openDirectory"] });
  if (r.canceled || !r.filePaths[0]) return null;
  writeSettings({ ...readSettings(), opsRoot: r.filePaths[0] });
  return r.filePaths[0];
}
ipcMain.handle("agoa:opsRoot", () => opsRoot());
ipcMain.handle("agoa:chooseOpsRoot", (e) => chooseRoot(BrowserWindow.fromWebContents(e.sender)));
ipcMain.handle("agoa:openFolder", async (e, code) => {
  let root = opsRoot();
  if (!root) root = await chooseRoot(BrowserWindow.fromWebContents(e.sender));
  if (!root) return { ok: false, reason: "root" };
  const { dir, exists } = findOpFolder(root, code);
  if (!dir) return { ok: false, reason: "code" };
  if (!exists) return { ok: false, reason: "missing", path: dir };
  const err = await shell.openPath(dir);
  return err ? { ok: false, reason: "open", path: dir, error: err } : { ok: true, path: dir };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 880, minWidth: 1000, minHeight: 600,
    title: "AGOA OPE", backgroundColor: "#F3F2EE", autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, "preload.js") }
  });
  win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
