const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const robot = require('robotjs');
const screenshot = require('screenshot-desktop');

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

// IPC Handlers para control del sistema
ipcMain.handle('get-screen-info', async () => {
  const size = robot.getScreenSize();
  return {
    width: size.width,
    height: size.height,
    scaleFactor: 1 // Puedes ajustar según el sistema
  };
});

ipcMain.handle('capture-screen', async (event, options = {}) => {
  try {
    const imgBuffer = await screenshot({ format: 'png', ...options });
    return imgBuffer.toString('base64');
  } catch (error) {
    console.error('Screen capture error:', error);
    throw error;
  }
});

ipcMain.handle('mouse-click', async (event, x, y, button = 'left') => {
  try {
    robot.moveMouse(x, y);
    robot.mouseClick(button);
    return { success: true, x, y, button };
  } catch (error) {
    console.error('Mouse click error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('keyboard-type', async (event, text) => {
  try {
    robot.typeString(text);
    return { success: true, text };
  } catch (error) {
    console.error('Keyboard type error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('keyboard-press', async (event, key) => {
  try {
    robot.keyTap(key);
    return { success: true, key };
  } catch (error) {
    console.error('Keyboard press error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-mouse-position', async () => {
  try {
    const pos = robot.getMousePos();
    return { x: pos.x, y: pos.y };
  } catch (error) {
    console.error('Get mouse position error:', error);
    return { x: 0, y: 0 };
  }
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