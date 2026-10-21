const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

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
