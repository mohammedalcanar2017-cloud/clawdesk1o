// 🚀 CLAWDESK REAL - Main completo como OpenClaw
const { app, BrowserWindow, ipcMain, dialog, screen, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { CLAWDESKAgent } = require('./src/agent');

console.log('🦾 CLAWDESK REAL starting...');

// Crear agente REAL
let agent = null;
let mainWindow = null;

// Inicializar agente
function initAgent() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || '';
    
    agent = new CLAWDESKAgent({
      apiKey,
      apiProvider: 'deepseek',
      safeMode: true,
      autoRetry: true,
      maxRetries: 3
    });
    
    console.log('✅ Agente REAL inicializado');
    console.log('📊 Estado:', agent.getStatus());
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando agente:', error);
    return false;
  }
}

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-real.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK REAL - Agente Autónomo',
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
      console.log('✅ Loading:', indexPath);
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('❌ Load error:', err);
        loadErrorPage(err);
      });
    } else {
      console.error('❌ index.html not found');
      loadErrorPage(new Error('Build required: npm run build'));
    }
  }

  // Manejar errores
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });

  return mainWindow;
}

function loadErrorPage(error) {
  mainWindow.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>CLAWDESK REAL Error</title>
        <style>
          body {
            background: #1a1a1a;
            color: white;
            font-family: -apple-system, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }
          h1 { color: #ff6b6b; }
          code {
            background: #2d2d2d;
            padding: 10px;
            border-radius: 5px;
            display: block;
            margin: 10px 0;
            font-family: monospace;
          }
          .steps {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px 5px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>⚠️ CLAWDESK REAL Error</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        
        <div class="steps">
          <h2>📋 Pasos para solucionar:</h2>
          <ol>
            <li>Abre Terminal en esta carpeta</li>
            <li>Ejecuta: <code>npm run build</code></li>
            <li>Configura API key: <code>export DEEPSEEK_API_KEY=tu_key</code></li>
            <li>Ejecuta: <code>npx electron .</code></li>
          </ol>
        </div>
        
        <h2>🔧 Scripts disponibles:</h2>
        <button onclick="runScript('install')">Instalar Dependencias</button>
        <button onclick="runScript('build')">Construir Frontend</button>
        <button onclick="runScript('start')">Iniciar App</button>
        
        <script>
          function runScript(script) {
            const commands = {
              'install': 'npm install',
              'build': 'npm run build',
              'start': 'npx electron .'
            };
            alert('Ejecuta en terminal:\\n' + commands[script]);
          }
        </script>
      </body>
    </html>
  `);
}

// ==================== IPC HANDLERS ====================

// Control del agente
ipcMain.handle('startAgent', async (event, goal) => {
  if (!agent) {
    return { success: false, error: 'Agente no inicializado' };
  }
  
  if (agent.isRunning) {
    return { success: false, error: 'El agente ya está ejecutando una tarea' };
  }
  
  try {
    const result = await agent.executeGoal(goal);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stopAgent', async () => {
  if (agent) {
    agent.stop();
    return { success: true };
  }
  return { success: false, error: 'Agente no inicializado' };
});

ipcMain.handle('getAgentStatus', async () => {
  if (!agent) {
    return { success: false, error: 'Agente no inicializado' };
  }
  return { success: true, status: agent.getStatus() };
});

ipcMain.handle('getCapabilities', async () => {
  if (!agent) {
    return { success: false, error: 'Agente no inicializado' };
  }
  return { success: true, capabilities: agent.getCapabilities() };
});

ipcMain.handle('getTaskHistory', async () => {
  if (!agent) {
    return { success: false, error: 'Agente no inicializado' };
  }
  return { success: true, history: agent.taskHistory };
});

ipcMain.handle('clearHistory', async () => {
  if (agent) {
    agent.clearHistory();
    return { success: true };
  }
  return { success: false, error: 'Agente no inicializado' };
});

// Configuración
ipcMain.handle('updateConfig', async (event, config) => {
  // Reiniciar agente con nueva configuración
  agent = new CLAWDESKAgent(config);
  return { success: true };
});

ipcMain.handle('getConfig', async () => {
  if (!agent) {
    return { success: false, error: 'Agente no inicializado' };
  }
  return { success: true, config: agent.config };
});

// Sistema
ipcMain.handle('getScreenInfo', async () => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
      success: true,
      width: primaryDisplay.size.width,
      height: primaryDisplay.size.height,
      scaleFactor: primaryDisplay.scaleFactor
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('showDialog', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== APP LIFECYCLE ====================

app.whenReady().then(() => {
  console.log('🚀 App ready');
  
  // Inicializar agente
  const agentInitialized = initAgent();
  
  if (!agentInitialized) {
    console.error('❌ No se pudo inicializar el agente. Modo limitado.');
  }
  
  // Crear ventana
  mainWindow = createWindow();
  
  // Atajos de teclado
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow) {
      mainWindow.webContents.send('agent-hotkey', 'toggle');
    }
  });
  
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (agent && agent.isRunning) {
      agent.stop();
      if (mainWindow) {
        mainWindow.webContents.send('agent-stopped');
      }
    }
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

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ CLAWDESK REAL main loaded');