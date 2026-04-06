#!/bin/bash
# Reparar error "Cannot find module 'axios'"

echo "🔧 REPARANDO ERROR: Cannot find module 'axios'"
echo "=============================================="

echo "📦 Paso 1: Instalar axios..."
npm install axios --save

if [ $? -ne 0 ]; then
    echo "⚠️ Falló con --save, intentando sin..."
    npm install axios
fi

echo "📦 Paso 2: Verificar que axios está instalado..."
if [ -d "node_modules/axios" ]; then
    echo "✅ axios instalado correctamente"
else
    echo "❌ axios NO instalado, intentando con --force..."
    npm install axios --force
fi

echo "📦 Paso 3: Usar versión SIN axios temporalmente..."
cat > main-no-axios.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🚀 CLAWDESK (sin axios) starting...');

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
    win.webContents.openDevTools();
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Loading:', indexPath);
    win.loadFile(indexPath);
  } else {
    win.loadURL(`data:text/html,<h1>Run: npm run build</h1>`);
  }
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
EOF

echo "📦 Paso 4: Copiar versión sin axios..."
cp main-no-axios.js main.js

echo ""
echo "🎯 ¡REPARACIÓN COMPLETADA!"
echo ""
echo "🚀 Para ejecutar:"
echo "   npx electron . --enable-logging"
echo ""
echo "🔧 Si sigue fallando, ejecuta:"
echo "   rm -rf node_modules package-lock.json"
echo "   npm install"
echo "   npm run build"
echo "   npx electron ."