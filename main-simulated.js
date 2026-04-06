const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

console.log('🤖 CLAWDESK AGENT (Simulated Mode) starting...');

// Estado del agente (simulado)
let agentState = {
  isRunning: false,
  isMonitoring: false,
  currentTask: null,
  screenOverlay: {
    show: false,
    guides: [],
    highlights: []
  },
  logs: [],
  systemStatus: {
    cpuUsage: Math.floor(Math.random() * 30) + 10,
    memoryUsage: Math.floor(Math.random() * 40) + 20,
    networkStatus: 'online',
    apiConnected: false
  }
};

let taskHistory = [];
let monitoringInterval = null;

// Biblioteca de acciones SIMULADAS
const actionLibrary = {
  'click': {
    description: 'Hacer clic en coordenadas',
    execute: async (params) => {
      const { x, y } = params;
      logAction(`🖱️ Simulated click at (${x}, ${y})`);
      await simulateDelay(500);
      return { success: true, simulated: true, coordinates: { x, y } };
    }
  },
  
  'type': {
    description: 'Escribir texto',
    execute: async (params) => {
      const { text } = params;
      const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
      logAction(`⌨️ Simulated typing: "${preview}"`);
      await simulateDelay(text.length * 50);
      return { success: true, simulated: true, text };
    }
  },
  
  'open_app': {
    description: 'Abrir aplicación',
    execute: async (params) => {
      const { appName } = params;
      logAction(`🚀 Simulated: Opening ${appName}`);
      await simulateDelay(1000);
      return { success: true, simulated: true, appName };
    }
  },
  
  'browse_to': {
    description: 'Navegar a URL',
    execute: async (params) => {
      const { url } = params;
      logAction(`🌐 Simulated: Browsing to ${url}`);
      await simulateDelay(1500);
      return { success: true, simulated: true, url };
    }
  },
  
  'capture_screen': {
    description: 'Capturar pantalla',
    execute: async () => {
      logAction('📸 Simulated: Capturing screen');
      await simulateDelay(800);
      return { success: true, simulated: true, data: 'simulated-screenshot' };
    }
  },
  
  'find_element': {
    description: 'Buscar elemento en pantalla',
    execute: async (params) => {
      const { element } = params;
      logAction(`🔍 Simulated: Finding "${element}"`);
      await simulateDelay(600);
      return { 
        success: true, 
        simulated: true, 
        found: true, 
        coordinates: { x: 400 + Math.random() * 400, y: 300 + Math.random() * 300 }
      };
    }
  },
  
  'scroll': {
    description: 'Scroll en dirección',
    execute: async (params) => {
      const { direction, amount = 1 } = params;
      logAction(`🔄 Simulated: Scrolling ${direction} ${amount} times`);
      await simulateDelay(300 * amount);
      return { success: true, simulated: true };
    }
  },
  
  'wait': {
    description: 'Esperar N segundos',
    execute: async (params) => {
      const { seconds } = params;
      logAction(`⏳ Waiting ${seconds} seconds`);
      await simulateDelay(seconds * 1000);
      return { success: true };
    }
  }
};

// Funciones de utilidad
function logAction(message, level = 'action') {
  const logEntry = {
    timestamp: new Date(),
    level,
    message
  };
  
  agentState.logs.push(logEntry);
  if (agentState.logs.length > 100) {
    agentState.logs.shift();
  }
  
  console.log(`[${level.toUpperCase()}] ${message}`);
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Planificador SIMULADO (pero con IA real opcional)
async function planTask(goal) {
  logAction('🧠 Planning task...', 'info');
  
  // Plan simple simulado
  const simplePlan = [
    {
      action: 'capture_screen',
      params: {},
      description: 'Analizar estado actual de la pantalla',
      verification: 'Screenshot tomado'
    },
    {
      action: 'find_element',
      params: { element: 'Chrome icon' },
      description: 'Buscar Chrome en el Dock',
      verification: 'Chrome encontrado'
    },
    {
      action: 'click',
      params: { x: 100, y: 800 },
      description: 'Hacer clic en Chrome',
      verification: 'Chrome abierto'
    },
    {
      action: 'wait',
      params: { seconds: 2 },
      description: 'Esperar a que Chrome cargue',
      verification: 'Espera completada'
    },
    {
      action: 'type',
      params: { text: goal.includes('clima') ? 'clima en Madrid' : 'busqueda de prueba' },
      description: 'Escribir en la barra de búsqueda',
      verification: 'Texto escrito'
    },
    {
      action: 'wait',
      params: { seconds: 1 },
      description: 'Esperar resultados',
      verification: 'Espera completada'
    }
  ];
  
  return {
    success: true,
    plan: simplePlan.slice(0, goal.includes('Chrome') ? 6 : 3),
    metadata: {
      estimatedTime: '15',
      complexity: 'baja',
      simulated: true
    }
  };
}

// Ejecutar plan simulado
async function executePlan(plan, taskId, goal) {
  const task = {
    id: taskId,
    goal,
    status: 'executing',
    steps: plan.map((step, index) => ({
      id: `step-${index}`,
      action: step.description || step.action,
      status: 'pending',
      params: step.params
    })),
    createdAt: new Date()
  };

  agentState.currentTask = task;
  
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    const taskStep = task.steps[i];
    
    taskStep.status = 'executing';
    
    try {
      logAction(`⚡ Executing step ${i + 1}: ${step.description}`, 'action');
      
      // Mostrar guía visual simulada
      if (step.params?.x && step.params?.y) {
        showGuide(step.params.x, step.params.y, `Step ${i + 1}`);
      }
      
      // Ejecutar acción
      const action = actionLibrary[step.action];
      if (!action) {
        throw new Error(`Unknown action: ${step.action}`);
      }
      
      const result = await action.execute(step.params);
      
      taskStep.status = 'completed';
      taskStep.result = step.verification || 'Completed';
      
      if (result.coordinates) {
        taskStep.coordinates = result.coordinates;
      }
      
      logAction(`✅ Step ${i + 1} completed`, 'success');
      
      // Pequeña pausa entre pasos
      if (i < plan.length - 1) {
        await simulateDelay(500);
      }
      
    } catch (error) {
      taskStep.status = 'failed';
      taskStep.result = `Error: ${error.message}`;
      logAction(`❌ Step ${i + 1} failed: ${error.message}`, 'error');
      continue;
    }
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  taskHistory.push(task);
  
  logAction(`🏁 Task completed successfully!`, 'success');
  hideOverlay();
}

// Overlay visual (simulado)
function showGuide(x, y, label) {
  agentState.screenOverlay.show = true;
  agentState.screenOverlay.guides.push({
    x, y, label,
    color: '#3b82f6'
  });
  
  // Quitar después de 1 segundo
  setTimeout(() => {
    agentState.screenOverlay.guides = agentState.screenOverlay.guides.filter(g => g.label !== label);
    if (agentState.screenOverlay.guides.length === 0) {
      agentState.screenOverlay.show = false;
    }
  }, 1000);
}

function hideOverlay() {
  agentState.screenOverlay = {
    show: false,
    guides: [],
    highlights: []
  };
}

// ==================== IPC HANDLERS ====================

ipcMain.handle('startAgent', async (event, goal) => {
  if (agentState.isRunning) {
    return { success: false, error: 'Agent already running' };
  }
  
  agentState.isRunning = true;
  const taskId = `task-${Date.now()}`;
  
  logAction(`🎯 Starting agent with goal: "${goal}"`, 'info');
  
  // Ejecutar en background
  setTimeout(async () => {
    const planResult = await planTask(goal);
    
    if (planResult.success) {
      agentState.currentTask = {
        id: taskId,
        goal,
        status: 'planning',
        steps: [],
        createdAt: new Date()
      };
      
      // Ejecutar plan
      await executePlan(planResult.plan, taskId, goal);
    }
    
    agentState.isRunning = false;
  }, 100);
  
  return { success: true, taskId };
});

ipcMain.handle('stopAgent', async () => {
  agentState.isRunning = false;
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  hideOverlay();
  logAction('⏹️ Agent stopped', 'warning');
  return { success: true };
});

ipcMain.handle('startMonitoring', async (event, intervalMs = 2000) => {
  agentState.isMonitoring = true;
  
  monitoringInterval = setInterval(() => {
    if (!agentState.isRunning) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      agentState.isMonitoring = false;
      return;
    }
    
    logAction('👁️ Screen monitoring (simulated)', 'info');
  }, intervalMs);
  
  return { success: true };
});

ipcMain.handle('stopMonitoring', async () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  agentState.isMonitoring = false;
  return { success: true };
});

ipcMain.handle('getAgentState', async () => {
  return agentState;
});

ipcMain.handle('getTaskHistory', async () => {
  return taskHistory;
});

ipcMain.handle('getAvailableActions', async () => {
  return Object.entries(actionLibrary).map(([name, action]) => ({
    name,
    description: action.description
  }));
});

ipcMain.handle('executeAction', async (event, actionName, params) => {
  const action = actionLibrary[actionName];
  if (!action) {
    return { success: false, error: `Action ${actionName} not found` };
  }
  
  try {
    const result = await action.execute(params);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('showOverlay', async (event, guides, highlights) => {
  agentState.screenOverlay = {
    show: true,
    guides: guides || [],
    highlights: highlights || []
  };
  return { success: true };
});

ipcMain.handle('hideOverlay', hideOverlay);

ipcMain.handle('getScreenInfo', async () => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
      width: primaryDisplay.size.width,
      height: primaryDisplay.size.height,
      scaleFactor: primaryDisplay.scaleFactor,
      success: true
    };
  } catch (error) {
    return { width: 1440, height: 900, scaleFactor: 2, success: false };
  }
});

// ==================== APP SETUP ====================

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK AGENT (Simulated)',
    frame: true,
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Para debugging: mainWindow.webContents.openDevTools();
  });

  // Cargar app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL(`data:text/html,<h1>Please run: npm run build</h1>`);
    }
  }

  return mainWindow;
}

// ==================== MAIN ====================

let mainWindow;

app.whenReady().then(() => {
  console.log('🚀 CLAWDESK AGENT ready (Simulated Mode)');
  mainWindow = createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});