const { contextBridge, ipcRenderer } = require('electron');

// Exponer API REAL al frontend
contextBridge.exposeInMainWorld('clawdeskAPI', {
  // Captura REAL
  captureScreenReal: () => ipcRenderer.invoke('captureScreenReal'),
  
  // Control REAL
  mouseClickReal: (x, y) => ipcRenderer.invoke('mouseClickReal', x, y),
  mouseMoveReal: (x, y) => ipcRenderer.invoke('mouseMoveReal', x, y),
  keyboardTypeReal: (text) => ipcRenderer.invoke('keyboardTypeReal', text),
  keyboardPressReal: (key) => ipcRenderer.invoke('keyboardPressReal', key),
  
  // Sistema
  getScreenInfo: () => ipcRenderer.invoke('get-screen-info'),
  showDialog: (options) => ipcRenderer.invoke('show-dialog', options),
  
  // IA REAL
  callAIWithVision: (prompt, imageBase64, provider, apiKey) => 
    ipcRenderer.invoke('callAIWithVision', prompt, imageBase64, provider, apiKey)
});

// Información del entorno
contextBridge.exposeInMainWorld('environment', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  version: '1.0.0-REAL'
});