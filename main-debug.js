const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🔍 CLAWDESK DEBUG STARTING...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

let mainWindow;

function createWindow() {
  console.log('🪟 Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Temporal para debug
    },
    show: false
  });

  // Abrir DevTools inmediatamente
  mainWindow.webContents.openDevTools();
  
  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Window ready to show');
    mainWindow.show();
  });

  // Verificar paths
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  console.log('📁 dist path:', distPath);
  console.log('📄 index.html path:', indexPath);
  console.log('📄 index.html exists?', fs.existsSync(indexPath));
  
  // Listar contenido de dist
  console.log('📁 Contents of dist/:');
  try {
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      try {
        const stat = fs.statSync(filePath);
        console.log(`  ${file} - ${stat.isDirectory() ? 'DIR' : 'FILE'} - ${stat.size} bytes`);
        
        // Si es index.html, mostrar primeras líneas
        if (file === 'index.html') {
          console.log('📄 First 10 lines of index.html:');
          const content = fs.readFileSync(filePath, 'utf8');
          content.split('\n').slice(0, 10).forEach((line, i) => {
            console.log(`  ${i+1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          });
        }
      } catch (err) {
        console.log(`  ${file} - ERROR: ${err.message}`);
      }
    });
  } catch (err) {
    console.error('❌ Error reading dist:', err);
  }

  // Intentar cargar
  if (fs.existsSync(indexPath)) {
    console.log('✅ Loading index.html...');
    
    // Leer contenido para debug
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    console.log('📄 HTML starts with:', htmlContent.substring(0, 200));
    
    // Verificar base href
    const baseHrefMatch = htmlContent.match(/<base href="([^"]+)"/);
    if (baseHrefMatch) {
      console.log('📍 Base href found:', baseHrefMatch[1]);
    }
    
    // Verificar script tags
    const scriptTags = htmlContent.match(/<script[^>]*src="([^"]+)"[^>]*>/g);
    if (scriptTags) {
      console.log('📜 Script tags found:', scriptTags.length);
      scriptTags.forEach((tag, i) => {
        const srcMatch = tag.match(/src="([^"]+)"/);
        if (srcMatch) {
          const scriptPath = path.join(distPath, srcMatch[1]);
          console.log(`  Script ${i+1}: ${srcMatch[1]} - exists? ${fs.existsSync(scriptPath)}`);
        }
      });
    }
    
    // Cargar con file:// protocol
    const fileUrl = `file://${indexPath}`;
    console.log('🌐 Loading URL:', fileUrl);
    
    mainWindow.loadURL(fileUrl).then(() => {
      console.log('✅ Successfully loaded index.html');
    }).catch(err => {
      console.error('❌ Error loading index.html:', err);
      
      // Fallback 1: Intentar con loadFile
      console.log('🔄 Trying loadFile...');
      mainWindow.loadFile(indexPath).then(() => {
        console.log('✅ loadFile succeeded');
      }).catch(err2 => {
        console.error('❌ loadFile also failed:', err2);
        
        // Fallback 2: HTML simple
        mainWindow.loadURL(`data:text/html;charset=utf-8,
          <html>
            <head><title>CLAWDESK Debug</title></head>
            <body style="background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif;">
              <h1>🔍 CLAWDESK Debug Mode</h1>
              <h3>Error loading index.html:</h3>
              <pre style="background: #2d2d2d; padding: 20px; border-radius: 8px;">${err.toString()}</pre>
              <h3>Paths:</h3>
              <pre style="background: #2d2d2d; padding: 20px; border-radius: 8px;">
__dirname: ${__dirname}
dist: ${distPath}
index.html: ${indexPath}
exists: ${fs.existsSync(indexPath)}
cwd: ${process.cwd()}</pre>
              <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
            </body>
          </html>
        `);
      });
    });
  } else {
    console.error('❌ index.html NOT FOUND');
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <body style="background: #1a1a1a; color: white; padding: 40px; font-family: -apple-system, sans-serif;">
          <h1>❌ index.html not found</h1>
          <p>Path: ${indexPath}</p>
          <p>Please run: <code>npm run build</code></p>
          <p>Then rebuild app with: <code>./build-mac-fixed.sh</code></p>
        </body>
      </html>
    `);
  }

  // Event listeners para debug
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window finished loading');
  });
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });
  
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`📝 Console [${level}]: ${message} (${sourceId}:${line})`);
  });
}

// IPC Handlers
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
    return { width: 1920, height: 1080, scaleFactor: 1, success: false, error: error.message };
  }
});

// App lifecycle
app.whenReady().then(() => {
  console.log('🚀 App ready');
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