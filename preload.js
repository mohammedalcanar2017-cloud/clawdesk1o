const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al frontend
contextBridge.exposeInMainWorld('clawdeskAPI', {
  // Screen control
  getScreenInfo: () => ipcRenderer.invoke('get-screen-info'),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  
  // Mouse control (simulado en desarrollo)
  mouseClick: (x, y, button) => ipcRenderer.invoke('mouse-click', x, y, button),
  getMousePosition: () => ipcRenderer.invoke('get-mouse-position'),
  
  // Keyboard control (simulado en desarrollo)
  keyboardType: (text) => ipcRenderer.invoke('keyboard-type', text),
  
  // UI dialogs
  showDialog: (options) => ipcRenderer.invoke('show-dialog', options)
});

// Exponer información del entorno
contextBridge.exposeInMainWorld('environment', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  version: process.env.npm_package_version || '1.0.0',
  isSimulated: true  // Indica que estamos en modo simulado
});