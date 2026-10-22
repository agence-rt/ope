const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("agoa", {
  connections: () => ipcRenderer.invoke("agoa:connections"),
  ragic: (req) => ipcRenderer.invoke("agoa:ragic", req),
  openFolder: (code) => ipcRenderer.invoke("agoa:openFolder", code),
  opsRoot: () => ipcRenderer.invoke("agoa:opsRoot"),
  chooseOpsRoot: () => ipcRenderer.invoke("agoa:chooseOpsRoot")
});
