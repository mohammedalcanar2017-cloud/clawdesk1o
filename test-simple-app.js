const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🚀 CLAWDESK SIMPLE TEST STARTING...');

let mainWindow;

app.whenReady().then(() => {
  console.log('✅ Electron app ready');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // Temporalmente para debug
      webSecurity: false
    },
    show: true
  });
  
  // Abrir DevTools inmediatamente
  mainWindow.webContents.openDevTools();
  
  // Verificar paths
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  console.log('📁 __dirname:', __dirname);
  console.log('📁 dist path:', distPath);
  console.log('📄 index.html path:', indexPath);
  console.log('📄 index.html exists?', fs.existsSync(indexPath));
  
  // Listar contenido de dist
  console.log('📁 Contents of dist/:');
  try {
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stat = fs.statSync(filePath);
      console.log(`  ${file} - ${stat.isDirectory() ? 'DIR' : 'FILE'} - ${stat.size} bytes`);
    });
  } catch (err) {
    console.error('❌ Error reading dist:', err);
  }
  
  // Intentar cargar
  if (fs.existsSync(indexPath)) {
    console.log('✅ Loading index.html...');
    mainWindow.loadFile(indexPath).then(() => {
      console.log('✅ Successfully loaded index.html');
    }).catch(err => {
      console.error('❌ Error loading index.html:', err);
      
      // Fallback: cargar HTML simple
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
          <head>
            <title>CLAWDESK Test</title>
            <style>
              body { background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif; }
              h1 { color: #3b82f6; }
              pre { background: #2d2d2d; padding: 20px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>✅ CLAWDESK Electron está funcionando!</h1>
            <p>Pero hay un problema cargando el frontend React.</p>
            <h3>Debug info:</h3>
            <pre>Error: ${err.toString()}</pre>
            <h3>Paths:</h3>
            <pre>__dirname: ${__dirname}
dist: ${distPath}
index.html: ${indexPath}
exists: ${fs.existsSync(indexPath)}</pre>
            <button onclick="location.reload()">Reintentar</button>
          </body>
        </html>
      `);
    });
  } else {
    console.error('❌ index.html NOT FOUND');
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <body style="background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif;">
          <h1>❌ index.html no encontrado</h1>
          <p>Path: ${indexPath}</p>
          <p>Por favor ejecuta: <code>npm run build</code></p>
          <p>Luego reconstruye la app con: <code>./build-mac-fixed.sh</code></p>
        </body>
      </html>
    `);
  }
  
  // Event listeners para debug
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window finished loading');
  });
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('crashed', () => {
    console.error('💥 Renderer crashed');
  });
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