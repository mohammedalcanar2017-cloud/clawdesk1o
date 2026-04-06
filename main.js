const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK Ultimate',
    frame: true,
    autoHideMenuBar: true,
    show: false // No mostrar hasta que esté listo
  });

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // mainWindow.webContents.openDevTools(); // Descomentar para debugging
  });

  // Cargar la app React
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Modo desarrollo
    mainWindow.loadURL('http://localhost:5173');
    console.log('🔧 Modo desarrollo: cargando desde localhost:5173');
  } else {
    // Modo producción - cargar desde archivo
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    // Verificar que el archivo existe
    if (fs.existsSync(indexPath)) {
      console.log('✅ Cargando index.html desde:', indexPath);
      mainWindow.loadFile(indexPath);
    } else {
      console.error('❌ index.html no encontrado en:', indexPath);
      console.log('📁 Contenido de dist/:');
      try {
        const files = fs.readdirSync(path.join(__dirname, 'dist'));
        console.log(files);
      } catch (err) {
        console.error('Error leyendo dist:', err);
      }
      
      // Mostrar error al usuario
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
          <body style="background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif;">
            <h1>⚠️ Error cargando CLAWDESK</h1>
            <p>No se pudo encontrar el archivo index.html</p>
            <p>Path: ${indexPath}</p>
            <p>Por favor, reconstruye la app con: <code>npm run build</code></p>
          </body>
        </html>
      `);
    }
  }

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error cargando:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('💥 App crashed');
  });
}

// IPC Handlers SIMPLES (sin dependencias nativas)
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

ipcMain.handle('capture-screen', async () => {
  return { success: true, simulated: true, message: 'Screen capture simulated' };
});

ipcMain.handle('mouse-click', async (event, x, y, button = 'left') => {
  return { success: true, simulated: true, x, y, button, message: 'Mouse click simulated' };
});

ipcMain.handle('keyboard-type', async (event, text) => {
  return { success: true, simulated: true, text, message: 'Keyboard typing simulated' };
});

ipcMain.handle('get-mouse-position', async () => {
  return { x: 500, y: 300, simulated: true };
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
  console.log('🚀 CLAWDESK starting...');
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

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});