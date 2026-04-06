const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const axios = require('axios');

console.log('🚀 CLAWDESK REAL starting...');

let mainWindow;

// Configuración
const config = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || ''
};

// Inicializar módulos nativos (si están disponibles)
let screenshotDesktop;
let robotjs;

try {
  screenshotDesktop = require('screenshot-desktop');
  console.log('✅ screenshot-desktop loaded');
} catch (error) {
  console.log('⚠️ screenshot-desktop not available (simulated)');
}

try {
  robotjs = require('robotjs');
  console.log('✅ robotjs loaded');
} catch (error) {
  console.log('⚠️ robotjs not available (simulated)');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'CLAWDESK REAL - IA que Controla',
    frame: true,
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Para debugging:
    // mainWindow.webContents.openDevTools();
  });

  // Cargar app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    console.log('🔧 Development mode');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Loading:', indexPath);
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('❌ Load error:', err);
        showErrorPage(err);
      });
    } else {
      console.error('❌ index.html not found');
      showErrorPage(new Error('Build required: npm run build'));
    }
  }
}

function showErrorPage(error) {
  mainWindow.loadURL(`data:text/html;charset=utf-8,
    <html><body style="background:#1a1a1a;color:white;padding:40px;font-family:-apple-system,sans-serif">
      <h1>⚠️ CLAWDESK Error</h1><p>${error.message}</p><p>Run: <code>npm run build && ./build-mac-fixed.sh</code></p>
    </body></html>`);
}

// ==================== FUNCIONES REALES ====================

// 1. Captura de pantalla REAL
async function captureScreenReal() {
  try {
    if (screenshotDesktop) {
      console.log('📸 Capturing REAL screenshot...');
      const buffer = await screenshotDesktop({ format: 'png' });
      const base64 = buffer.toString('base64');
      return { success: true, data: base64 };
    } else {
      // Simulación
      console.log('📸 Simulated screenshot');
      return { success: true, data: 'simulated', simulated: true };
    }
  } catch (error) {
    console.error('❌ Screenshot error:', error);
    return { success: false, error: error.message };
  }
}

// 2. Mouse REAL
async function mouseClickReal(x, y) {
  try {
    if (robotjs) {
      console.log(`🖱️ REAL click at (${x}, ${y})`);
      robotjs.moveMouse(x, y);
      robotjs.mouseClick();
      return { success: true };
    } else {
      console.log(`🖱️ Simulated click at (${x}, ${y})`);
      // En macOS podemos usar AppleScript
      exec(`osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`, (error) => {
        if (error) console.error('AppleScript error:', error);
      });
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error('❌ Mouse error:', error);
    return { success: false, error: error.message };
  }
}

// 3. Teclado REAL
async function keyboardTypeReal(text) {
  try {
    if (robotjs) {
      console.log(`⌨️ REAL typing: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      robotjs.typeString(text);
      return { success: true };
    } else {
      console.log(`⌨️ Simulated typing: "${text}"`);
      // AppleScript para escribir
      const escaped = text.replace(/"/g, '\\"');
      exec(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`, (error) => {
        if (error) console.error('AppleScript error:', error);
      });
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error('❌ Keyboard error:', error);
    return { success: false, error: error.message };
  }
}

// 4. Tecla REAL
async function keyboardPressReal(key) {
  try {
    if (robotjs) {
      console.log(`⌨️ REAL press: ${key}`);
      robotjs.keyTap(key.toLowerCase());
      return { success: true };
    } else {
      console.log(`⌨️ Simulated press: ${key}`);
      // AppleScript
      exec(`osascript -e 'tell application "System Events" to keystroke "${key}"'`, (error) => {
        if (error) console.error('AppleScript error:', error);
      });
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error('❌ Key press error:', error);
    return { success: false, error: error.message };
  }
}

// 5. IA REAL con visión
async function callAIWithVision(prompt, imageBase64, provider = 'deepseek', apiKey) {
  try {
    console.log('🧠 Calling REAL AI...');
    
    if (!apiKey) {
      throw new Error('API key required');
    }
    
    if (provider === 'deepseek') {
      return await callDeepSeekVision(prompt, imageBase64, apiKey);
    } else if (provider === 'openai') {
      return await callOpenAIVision(prompt, imageBase64, apiKey);
    } else {
      throw new Error(`Provider ${provider} not implemented`);
    }
  } catch (error) {
    console.error('❌ AI error:', error);
    return { success: false, error: error.message };
  }
}

// DeepSeek Vision API
async function callDeepSeekVision(prompt, imageBase64, apiKey) {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  const messages = [
    {
      role: 'system',
      content: 'Eres CLAWDESK, un asistente que PUEDE CONTROLAR ordenadores. Responde con JSON si necesitas acciones, o texto normal.'
    },
    {
      role: 'user',
      content: []
    }
  ];
  
  // Añadir texto
  messages[1].content.push({ type: 'text', text: prompt });
  
  // Añadir imagen si existe
  if (imageBase64 && imageBase64 !== 'simulated') {
    messages[1].content.push({
      type: 'image_url',
      image_url: { url: `data:image/png;base64,${imageBase64}` }
    });
  }
  
  const data = {
    model: 'deepseek-chat',
    messages: messages,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  };
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const content = response.data.choices[0].message.content;
    console.log('✅ AI response received');
    
    return {
      success: true,
      response: content
    };
  } catch (error) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    throw error;
  }
}

// OpenAI Vision API (similar)
async function callOpenAIVision(prompt, imageBase64, apiKey) {
  // Implementación similar para OpenAI
  return { success: false, error: 'OpenAI not implemented yet' };
}

// ==================== IPC HANDLERS ====================

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
    return { width: 1920, height: 1080, scaleFactor: 1, success: false };
  }
});

ipcMain.handle('captureScreenReal', captureScreenReal);
ipcMain.handle('mouseClickReal', (event, x, y) => mouseClickReal(x, y));
ipcMain.handle('keyboardTypeReal', (event, text) => keyboardTypeReal(text));
ipcMain.handle('keyboardPressReal', (event, key) => keyboardPressReal(key));

ipcMain.handle('callAIWithVision', async (event, prompt, imageBase64, provider, apiKey) => {
  return await callAIWithVision(prompt, imageBase64, provider, apiKey);
});

ipcMain.handle('show-dialog', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  } catch (error) {
    return { response: 0 };
  }
});

// ==================== APP LIFECYCLE ====================

app.whenReady().then(() => {
  console.log('🚀 App ready');
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