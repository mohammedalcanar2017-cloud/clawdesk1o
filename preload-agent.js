const { contextBridge, ipcRenderer } = require('electron');

// Exponer API del Agente
contextBridge.exposeInMainWorld('clawdeskAgent', {
  // Control del agente
  startAgent: (goal) => ipcRenderer.invoke('startAgent', goal),
  stopAgent: () => ipcRenderer.invoke('stopAgent'),
  pauseAgent: () => ipcRenderer.invoke('pauseAgent'),
  resumeAgent: () => ipcRenderer.invoke('resumeAgent'),
  
  // Monitoreo
  startMonitoring: (intervalMs) => ipcRenderer.invoke('startMonitoring', intervalMs),
  stopMonitoring: () => ipcRenderer.invoke('stopMonitoring'),
  getCurrentScreen: () => ipcRenderer.invoke('getCurrentScreen'),
  
  // Overlay visual
  showOverlay: (guides, highlights) => ipcRenderer.invoke('showOverlay', guides, highlights),
  hideOverlay: () => ipcRenderer.invoke('hideOverlay'),
  flashElement: (x, y, duration) => ipcRenderer.invoke('flashElement', x, y, duration),
  
  // Biblioteca de acciones
  executeAction: (actionName, params) => ipcRenderer.invoke('executeAction', actionName, params),
  getAvailableActions: () => ipcRenderer.invoke('getAvailableActions'),
  
  // Estado
  getAgentState: () => ipcRenderer.invoke('getAgentState'),
  getTaskHistory: () => ipcRenderer.invoke('getTaskHistory'),
  
  // Configuración
  updateConfig: (config) => ipcRenderer.invoke('updateConfig', config),
  getConfig: () => ipcRenderer.invoke('getConfig')
});

// Información del entorno
contextBridge.exposeInMainWorld('environment', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  version: '1.0.0-AGENT'
});

// Escuchar hotkeys
ipcRenderer.on('agent-hotkey', (event, action) => {
  if (window.onAgentHotkey) {
    window.onAgentHotkey(action);
  }
});