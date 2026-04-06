const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');

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
    autoHideMenuBar: true
  });

  // Cargar la app React
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// IPC Handlers SIMPLES (sin dependencias nativas)
ipcMain.handle('get-screen-info', async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return {
    width: primaryDisplay.size.width,
    height: primaryDisplay.size.height,
    scaleFactor: primaryDisplay.scaleFactor
  };
});

ipcMain.handle('capture-screen', async () => {
  // Simular captura de pantalla (en producción usaría screenshot-desktop)
  return `screenshot-simulated-${Date.now()}`;
});

ipcMain.handle('mouse-click', async (event, x, y, button = 'left') => {
  // Simular click (en producción usaría robotjs)
  return { success: true, simulated: true, x, y, button, message: 'In production, this would actually click' };
});

ipcMain.handle('keyboard-type', async (event, text) => {
  // Simular typing (en producción usaría robotjs)
  return { success: true, simulated: true, text, message: 'In production, this would actually type' };
});

ipcMain.handle('get-mouse-position', async () => {
  // Simular posición del mouse
  return { x: 500, y: 300, simulated: true };
});

ipcMain.handle('show-dialog', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// App lifecycle
app.whenReady().then(() => {
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