const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🧠 CLAWDESK Intelligent starting...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Para desarrollo
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK Intelligent',
    frame: true,
    autoHideMenuBar: true,
    show: false
  });

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Descomentar para debugging:
    // mainWindow.webContents.openDevTools();
  });

  // Cargar la app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    console.log('🔧 Development mode: loading from localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Loading index.html from:', indexPath);
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('❌ Error loading index.html:', err);
        showErrorPage(err);
      });
    } else {
      console.error('❌ index.html not found at:', indexPath);
      showErrorPage(new Error('index.html not found'));
    }
  }

  // Manejar errores
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });
}

function showErrorPage(error) {
  mainWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <body style="background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif;">
        <h1>⚠️ CLAWDESK Error</h1>
        <p>${error.message}</p>
        <p>Please rebuild with: <code>npm run build && ./build-mac-fixed.sh</code></p>
      </body>
    </html>
  `);
}

// IPC Handlers para control inteligente
ipcMain.handle('get-screen-info', async () => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
      width: primaryDisplay.size.width,
      height: primaryDisplay.size.height,
      scaleFactor: primaryDisplay.scaleFactor,
      success: true
    };
  } catch (error) {
    console.error('Error get-screen-info:', error);
    return { width: 1920, height: 1080, scaleFactor: 1, success: false, error: error.message };
  }
});

ipcMain.handle('capture-screen', async (event, options = {}) => {
  try {
    // En producción usaría screenshot-desktop
    // Por ahora simulamos
    console.log('📸 Screen capture requested:', options.reason || 'No reason given');
    return { success: true, simulated: true, data: 'screenshot-simulated-data' };
  } catch (error) {
    console.error('Error capture-screen:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mouse-click', async (event, x, y, button = 'left') => {
  try {
    console.log(`🖱️ Mouse click at (${x}, ${y}) with ${button} button`);
    // En producción usaría robotjs
    return { success: true, simulated: true, x, y, button };
  } catch (error) {
    console.error('Error mouse-click:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('keyboard-type', async (event, text) => {
  try {
    console.log(`⌨️ Keyboard type: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    // En producción usaría robotjs
    return { success: true, simulated: true, text };
  } catch (error) {
    console.error('Error keyboard-type:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('keyboard-press', async (event, key) => {
  try {
    console.log(`⌨️ Keyboard press: ${key}`);
    return { success: true, simulated: true, key };
  } catch (error) {
    console.error('Error keyboard-press:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-mouse-position', async () => {
  try {
    // Simular posición
    return { x: Math.floor(Math.random() * 1000), y: Math.floor(Math.random() * 700), simulated: true };
  } catch (error) {
    console.error('Error get-mouse-position:', error);
    return { x: 0, y: 0, simulated: true };
  }
});

ipcMain.handle('show-dialog', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  } catch (error) {
    console.error('Error show-dialog:', error);
    return { response: 0, checkboxChecked: false };
  }
});

// App lifecycle
app.whenReady().then(() => {
  console.log('🚀 App ready, creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});