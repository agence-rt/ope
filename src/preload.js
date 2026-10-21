const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("agoa", {
  connections: () => ipcRenderer.invoke("agoa:connections"),
  ragic: (req) => ipcRenderer.invoke("agoa:ragic", req)
});
