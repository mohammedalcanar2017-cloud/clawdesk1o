const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Intentar cargar axios, pero no fallar si no está
let axios;
try {
  axios = require('axios');
  console.log('✅ axios loaded');
} catch (error) {
  console.log('⚠️ axios not available (simulated mode)');
  axios = {
    post: async () => ({ data: { choices: [{ message: { content: '{"response": "Simulated AI response", "actions": []}' } }] } })
  };
}

console.log('🤖 CLAWDESK AGENT starting...');

// Estado del agente
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

// Biblioteca de acciones SIMULADAS (sin dependencias)
const actionLibrary = {
  'click': {
    description: 'Hacer clic en coordenadas',
    execute: async (params) => {
      const { x, y } = params;
      logAction(`🖱️ Simulated click at (${x}, ${y})`);
      await delay(500);
      return { success: true, simulated: true, coordinates: { x, y } };
    }
  },
  
  'type': {
    description: 'Escribir texto',
    execute: async (params) => {
      const { text } = params;
      const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
      logAction(`⌨️ Simulated typing: "${preview}"`);
      await delay(text.length * 50);
      return { success: true, simulated: true, text };
    }
  },
  
  'open_app': {
    description: 'Abrir aplicación',
    execute: async (params) => {
      const { appName } = params;
      logAction(`🚀 Simulated: Opening ${appName}`);
      await delay(1000);
      return { success: true, simulated: true, appName };
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Planificador SIMULADO
async function planTask(goal) {
  logAction('🧠 Planning task (simulated)...', 'info');
  
  await delay(1000);
  
  return {
    success: true,
    plan: [
      {
        action: 'click',
        params: { x: 100, y: 800 },
        description: 'Hacer clic en Chrome',
        verification: 'Chrome abierto'
      },
      {
        action: 'type',
        params: { text: goal.includes('clima') ? 'clima en Madrid' : 'Hello World' },
        description: 'Escribir en la barra de búsqueda',
        verification: 'Texto escrito'
      },
      {
        action: 'open_app',
        params: { appName: 'Chrome' },
        description: 'Abrir navegador',
        verification: 'Navegador abierto'
      }
    ],
    metadata: {
      estimatedTime: '10',
      complexity: 'baja',
      simulated: true
    }
  };
}

// Ejecutar plan
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
      
      if (i < plan.length - 1) {
        await delay(500);
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
}

// ==================== IPC HANDLERS ====================

ipcMain.handle('startAgent', async (event, goal) => {
  if (agentState.isRunning) {
    return { success: false, error: 'Agent already running' };
  }
  
  agentState.isRunning = true;
  const taskId = `task-${Date.now()}`;
  
  logAction(`🎯 Starting agent with goal: "${goal}"`, 'info');
  
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
  logAction('⏹️ Agent stopped', 'warning');
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
      preload: path.join(__dirname, 'preload-minimal.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK AGENT',
    frame: true,
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Loading:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL(`data:text/html,<h1>Please run: npm run build</h1>`);
  }

  return mainWindow;
}

// ==================== MAIN ====================

let mainWindow;

app.whenReady().then(() => {
  console.log('🚀 CLAWDESK AGENT ready');
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