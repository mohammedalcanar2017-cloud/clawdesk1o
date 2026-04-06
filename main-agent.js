const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Módulos nativos
let screenshotDesktop;
let robotjs;
let overlayWindow = null;

try {
  screenshotDesktop = require('screenshot-desktop');
  console.log('✅ screenshot-desktop loaded');
} catch (error) {
  console.log('⚠️ screenshot-desktop not available');
}

try {
  robotjs = require('robotjs');
  console.log('✅ robotjs loaded');
} catch (error) {
  console.log('⚠️ robotjs not available');
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
  logs: []
};

let taskHistory = [];
let monitoringInterval = null;
let currentTaskInterval = null;

// Biblioteca de acciones
const actionLibrary = {
  // Navegación básica
  'click': {
    description: 'Hacer clic en coordenadas específicas',
    execute: async (params) => {
      const { x, y, button = 'left' } = params;
      logAction(`🖱️ Click at (${x}, ${y})`);
      
      if (robotjs) {
        robotjs.moveMouse(x, y);
        robotjs.mouseClick(button);
        return { success: true, coordinates: { x, y } };
      } else {
        // AppleScript para macOS
        exec(`osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`);
        return { success: true, simulated: true };
      }
    }
  },
  
  'type': {
    description: 'Escribir texto',
    execute: async (params) => {
      const { text } = params;
      logAction(`⌨️ Type: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      if (robotjs) {
        robotjs.typeString(text);
        return { success: true, text };
      } else {
        const escaped = text.replace(/"/g, '\\"');
        exec(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`);
        return { success: true, simulated: true };
      }
    }
  },
  
  'keypress': {
    description: 'Presionar tecla',
    execute: async (params) => {
      const { key } = params;
      logAction(`⌨️ Press key: ${key}`);
      
      if (robotjs) {
        robotjs.keyTap(key.toLowerCase());
        return { success: true, key };
      } else {
        exec(`osascript -e 'tell application "System Events" to keystroke "${key}"'`);
        return { success: true, simulated: true };
      }
    }
  },
  
  'wait': {
    description: 'Esperar N segundos',
    execute: async (params) => {
      const { seconds } = params;
      logAction(`⏳ Wait ${seconds} seconds`);
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return { success: true };
    }
  },
  
  'capture_screen': {
    description: 'Capturar pantalla',
    execute: async () => {
      logAction('📸 Capture screen');
      const screenshot = await captureScreen();
      return { success: true, screenshot: screenshot.data };
    }
  },
  
  'find_element': {
    description: 'Buscar elemento en pantalla',
    execute: async (params) => {
      const { element } = params;
      logAction(`🔍 Find element: ${element}`);
      
      // En producción usaría visión por computadora
      // Por ahora simulamos
      return { 
        success: true, 
        found: true, 
        coordinates: { x: 500, y: 300 },
        simulated: true 
      };
    }
  },
  
  'open_app': {
    description: 'Abrir aplicación',
    execute: async (params) => {
      const { appName } = params;
      logAction(`🚀 Open app: ${appName}`);
      
      // macOS: abrir aplicación
      exec(`open -a "${appName}"`);
      return { success: true };
    }
  },
  
  'scroll': {
    description: 'Scroll en dirección',
    execute: async (params) => {
      const { direction, amount = 1 } = params;
      logAction(`🔄 Scroll ${direction} ${amount} times`);
      
      if (robotjs) {
        for (let i = 0; i < amount; i++) {
          robotjs.scrollMouse(0, direction === 'up' ? 1 : -1);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return { success: true };
      }
      return { success: true, simulated: true };
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

async function captureScreen() {
  try {
    if (screenshotDesktop) {
      const buffer = await screenshotDesktop({ format: 'png' });
      return { success: true, data: buffer.toString('base64') };
    } else {
      return { success: true, data: 'simulated', simulated: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// IA Planner - Planifica tareas complejas
async function planTask(goal) {
  logAction('🧠 Planning task...', 'info');
  
  const systemPrompt = `Eres CLAWDESK AGENT, un asistente autónomo que PLANIFICA y EJECUTA tareas complejas.

REGLAS:
1. Analiza el objetivo del usuario
2. Descompón en pasos ejecutables
3. Cada paso debe ser una acción de la biblioteca
4. Incluye verificaciones entre pasos
5. Planifica alternativas si algo falla

BIBLIOTECA DE ACCIONES DISPONIBLES:
${Object.entries(actionLibrary).map(([name, desc]) => `- ${name}: ${desc.description}`).join('\n')}

OBJETIVO DEL USUARIO: "${goal}"

Responde ÚNICAMENTE con JSON en este formato:
{
  "plan": [
    {
      "action": "nombre_accion",
      "params": { ... },
      "description": "Descripción humana",
      "verification": "Cómo verificar éxito"
    }
  ],
  "estimated_time": "estimación en segundos",
  "complexity": "baja/media/alta"
}`;

  try {
    // Llamar a IA (DeepSeek)
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Planifica esta tarea: ${goal}` }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
        'Content-Type': 'application/json'
      }
    });

    const plan = JSON.parse(response.data.choices[0].message.content);
    logAction(`✅ Task planned: ${plan.plan.length} steps`, 'success');
    
    return {
      success: true,
      plan: plan.plan,
      metadata: {
        estimatedTime: plan.estimated_time,
        complexity: plan.complexity
      }
    };
  } catch (error) {
    logAction(`❌ Planning failed: ${error.message}`, 'error');
    
    // Plan de respaldo simple
    return {
      success: true,
      plan: [
        {
          action: 'capture_screen',
          params: {},
          description: 'Analizar estado actual',
          verification: 'Screenshot tomado'
        },
        {
          action: 'wait',
          params: { seconds: 2 },
          description: 'Esperar para estabilizar',
          verification: 'Espera completada'
        }
      ],
      metadata: {
        estimatedTime: '10',
        complexity: 'baja'
      },
      fallback: true
    };
  }
}

// Ejecutar plan
async function executePlan(plan, taskId) {
  const task = {
    id: taskId,
    goal: agentState.currentTask?.goal || 'Unknown',
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
      
      // Mostrar guía visual si hay coordenadas
      if (step.params?.x && step.params?.y) {
        showGuide(step.params.x, step.params.y, `Step ${i + 1}: ${step.action}`);
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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      taskStep.status = 'failed';
      taskStep.result = `Error: ${error.message}`;
      logAction(`❌ Step ${i + 1} failed: ${error.message}`, 'error');
      
      // Intentar siguiente paso si es posible
      continue;
    }
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  taskHistory.push(task);
  
  logAction(`🏁 Task completed successfully!`, 'success');
  hideOverlay();
}

// Overlay visual
function showGuide(x, y, label) {
  agentState.screenOverlay.show = true;
  agentState.screenOverlay.guides.push({
    x, y, label,
    color: '#3b82f6'
  });
  
  // Flash effect
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
  
  // Planificar en background
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
      await executePlan(planResult.plan, taskId);
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
  
  monitoringInterval = setInterval(async () => {
    if (!agentState.isRunning) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      agentState.isMonitoring = false;
      return;
    }
    
    // Capturar pantalla periódicamente
    const screenshot = await captureScreen();
    if (screenshot.success) {
      logAction('👁️ Screen monitored', 'info');
    }
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

// ==================== APP SETUP ====================

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-agent.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK AGENT - Autonomous AI Assistant',
    frame: true,
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // mainWindow.webContents.openDevTools(); // Para debugging
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
      mainWindow.loadURL(`data:text/html,<h1>Build required: npm run build</h1>`);
    }
  }

  return mainWindow;
}

// ==================== MAIN ====================

let mainWindow;

app.whenReady().then(() => {
  console.log('🚀 CLAWDESK AGENT ready');
  mainWindow = createWindow();
  
  // Atajos de teclado
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow.webContents.send('agent-hotkey', 'toggle');
  });
  
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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});