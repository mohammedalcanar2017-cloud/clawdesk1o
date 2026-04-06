const { contextBridge } = require('electron');

// API mínima para testing
contextBridge.exposeInMainWorld('clawdeskAgent', {
  // Funciones simuladas básicas
  startAgent: async (goal) => {
    console.log('🎯 Agent started with goal:', goal);
    return { success: true, taskId: 'test-' + Date.now() };
  },
  
  stopAgent: async () => {
    console.log('⏹️ Agent stopped');
    return { success: true };
  },
  
  getAvailableActions: async () => {
    return [
      { name: 'click', description: 'Hacer clic' },
      { name: 'type', description: 'Escribir texto' },
      { name: 'open_app', description: 'Abrir aplicación' },
      { name: 'capture_screen', description: 'Capturar pantalla' }
    ];
  },
  
  getAgentState: async () => {
    return {
      isRunning: false,
      isMonitoring: false,
      screenOverlay: { show: false, guides: [], highlights: [] },
      logs: [
        { timestamp: new Date(), level: 'info', message: '✅ CLAWDESK MINIMAL funcionando' },
        { timestamp: new Date(), level: 'info', message: '🎯 Escribe un objetivo y haz clic en Ejecutar' }
      ],
      systemStatus: {
        cpuUsage: 15,
        memoryUsage: 45,
        networkStatus: 'online',
        apiConnected: false
      }
    };
  },
  
  getTaskHistory: async () => {
    return [];
  }
});

// Información del entorno
contextBridge.exposeInMainWorld('environment', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  version: '1.0.0-MINIMAL'
});

console.log('✅ preload-minimal.js loaded');