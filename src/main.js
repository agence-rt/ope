const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 880, minWidth: 1000, minHeight: 600,
    title: "AGOA OPE", backgroundColor: "#F4F5F7", autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

app.whenReady().then(() => {
  createWindow();
  // Mises à jour automatiques depuis les releases GitHub (agence-rt/ope)
  if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify().catch(() => {});
});
app.on("window-all-closed", () => app.quit());
