#!/bin/bash
# Debug extremo de Electron

echo "🔍 ELECTRON DEBUG EXTREMO"
echo "========================"

echo "📦 Verificando Node.js..."
node --version
npm --version

echo ""
echo "📁 Verificando estructura de archivos..."
echo "main.js existe? $(ls -la main.js 2>/dev/null | wc -l)"
echo "preload.js existe? $(ls -la preload.js 2>/dev/null | wc -l)"
echo "dist/index.html existe? $(ls -la dist/index.html 2>/dev/null | wc -l)"

echo ""
echo "📄 Contenido de dist/ (primeros 5 archivos):"
ls -la dist/ 2>/dev/null | head -10

echo ""
echo "📦 Verificando package.json..."
cat package.json | head -20

echo ""
echo "🚀 Ejecutando Electron con DEBUG COMPLETO..."
echo "Presiona Ctrl+C para detener"
echo ""

# Crear archivo de test mínimo
cat > test-minimal.js << 'EOF'
const { app, BrowserWindow } = require('electron');

console.log('🔧 TEST MINIMAL STARTING...');

app.whenReady().then(() => {
  console.log('✅ Electron ready');
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadURL('data:text/html,<h1>✅ Electron funciona!</h1><p>Si ves esto, Electron está bien.</p>');
  
  win.webContents.openDevTools();
  
  console.log('✅ Test completado');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
EOF

echo "🎯 Probando Electron básico..."
npx electron test-minimal.js --enable-logging 2>&1 | head -50

echo ""
echo "🔍 Si lo anterior funciona, probando CLAWDESK real..."
echo ""

# Limpiar
rm -f test-minimal.js

# Ejecutar CLAWDESK con logging extremo
ELECTRON_ENABLE_LOGGING=1 npx electron . --enable-logging --log-level=0 2>&1 | grep -E "(Error|error|ERROR|SyntaxError|TypeError|ReferenceError|Cannot|Failed|failed|at |\.js:|\.ts:)" | head -100

echo ""
echo "💡 ANÁLISIS DE ERRORES COMUNES:"
echo ""
echo "1. 'Cannot find module' → Falta dependencia"
echo "   Solución: npm install"
echo ""
echo "2. 'SyntaxError' → Error en JavaScript"
echo "   Solución: Verificar main.js o preload.js"
echo ""
echo "3. 'Failed to load' → dist/index.html no existe"
echo "   Solución: npm run build"
echo ""
echo "4. 'Context isolation' → Problema con preload.js"
echo "   Solución: Revisar contextBridge en preload.js"
echo ""
echo "🎯 PASOS DE SOLUCIÓN:"
echo "   1. rm -rf node_modules package-lock.json"
echo "   2. npm install"
echo "   3. npm run build"
echo "   4. npx electron . --enable-logging"