const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🚀 CLAWDESK MINIMAL starting...');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-minimal.js'),
      webSecurity: false
    },
    show: false
  });

  win.once('ready-to-show', () => {
    win.show();
    win.webContents.openDevTools(); // Siempre abrir DevTools para debug
  });

  // Verificar si dist/index.html existe
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Loading:', indexPath);
    win.loadFile(indexPath).catch(err => {
      console.error('❌ Error loading:', err);
      loadErrorPage(win, err);
    });
  } else {
    console.error('❌ index.html not found at:', indexPath);
    loadErrorPage(win, new Error('index.html not found. Run: npm run build'));
  }

  // Manejar errores
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });

  win.webContents.on('console-message', (event, level, message) => {
    console.log(`📝 Console [${level}]: ${message}`);
  });
}

function loadErrorPage(win, error) {
  win.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>CLAWDESK Error</title>
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
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>⚠️ CLAWDESK Error</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        
        <h2>📋 Pasos para solucionar:</h2>
        <ol>
          <li>Abre Terminal en esta carpeta</li>
          <li>Ejecuta: <code>npm run build</code></li>
          <li>Luego: <code>npx electron .</code></li>
        </ol>
        
        <h2>🔍 Debug rápido:</h2>
        <button onclick="location.reload()">Reintentar</button>
        <button onclick="runDebug()">Ejecutar Debug</button>
        
        <script>
          function runDebug() {
            alert('Ejecuta en terminal: ./debug-electron.sh');
          }
        </script>
      </body>
    </html>
  `);
}

app.whenReady().then(() => {
  console.log('✅ App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});