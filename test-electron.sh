#!/bin/bash
# Script para probar Electron básico

echo "🔧 Electron Basic Test"
echo "====================="

# Verificar Node.js
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Verificar electron local
if [ -f "node_modules/.bin/electron" ]; then
    echo "✅ Electron local encontrado"
    echo "Versión: $(./node_modules/.bin/electron --version)"
else
    echo "❌ Electron local no encontrado"
    echo "Instalando..."
    npm install electron --save-dev 2>&1 | tail -5
    
    if [ -f "node_modules/.bin/electron" ]; then
        echo "✅ Electron instalado"
        echo "Versión: $(./node_modules/.bin/electron --version)"
    else
        echo "❌ No se pudo instalar Electron"
        exit 1
    fi
fi

echo ""
echo "🎯 Probando Electron básico..."
echo ""

# Crear app de prueba mínima
cat > test-minimal.js << 'EOF'
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  console.log('✅ Electron funciona!');
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  win.loadURL('data:text/html,<h1 style="color: green;">✅ Electron funciona correctamente!</h1><p>Si ves esto, Electron está instalado y funcionando.</p>');
  
  win.webContents.openDevTools();
  
  setTimeout(() => {
    console.log('✅ Test completado');
    app.quit();
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
EOF

echo "Ejecutando test..."
./node_modules/.bin/electron test-minimal.js --enable-logging 2>&1 | grep -E "(✅|❌|Error|error|Electron funciona)" | head -20

# Limpiar
rm -f test-minimal.js

echo ""
echo "📋 Resultado:"
echo "Si viste '✅ Electron funciona!', entonces Electron está instalado correctamente."
echo "El problema debe estar en la carga de archivos o paths."