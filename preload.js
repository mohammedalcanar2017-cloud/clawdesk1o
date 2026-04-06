const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al frontend
contextBridge.exposeInMainWorld('clawdeskAPI', {
  // Screen control
  getScreenInfo: () => ipcRenderer.invoke('get-screen-info'),
  captureScreen: (options) => ipcRenderer.invoke('capture-screen', options),
  
  // Mouse control
  mouseClick: (x, y, button) => ipcRenderer.invoke('mouse-click', x, y, button),
  getMousePosition: () => ipcRenderer.invoke('get-mouse-position'),
  
  // Keyboard control
  keyboardType: (text) => ipcRenderer.invoke('keyboard-type', text),
  keyboardPress: (key) => ipcRenderer.invoke('keyboard-press', key),
  
  // UI dialogs
  showDialog: (options) => ipcRenderer.invoke('show-dialog', options),
  
  // Events
  on: (channel, callback) => {
    const validChannels = ['screen-captured', 'action-performed', 'error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});

// Exponer información del entorno
contextBridge.exposeInMainWorld('environment', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  version: process.env.npm_package_version || '1.0.0'
});