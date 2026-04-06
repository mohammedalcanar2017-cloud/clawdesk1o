#!/bin/bash
# Script para debuggear la app CLAWDESK

echo "🔍 CLAWDESK Debug Script"
echo "========================"

# Verificar que la app existe
APP_PATH="dist/mac/CLAWDESK.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ No se encuentra $APP_PATH"
    echo "Construye primero con: ./build-mac-fixed.sh"
    exit 1
fi

echo "✅ App encontrada: $APP_PATH"

# Verificar estructura de la app
echo ""
echo "📁 Estructura de la app:"
echo ""

# Verificar Contents/Resources
RESOURCES_PATH="$APP_PATH/Contents/Resources"
if [ -d "$RESOURCES_PATH" ]; then
    echo "📦 Contents/Resources:"
    ls -la "$RESOURCES_PATH/" | head -20
    
    # Verificar app.asar
    if [ -f "$RESOURCES_PATH/app.asar" ]; then
        echo "✅ app.asar encontrado"
        echo "   Tamaño: $(du -h "$RESOURCES_PATH/app.asar" | cut -f1)"
    else
        echo "❌ app.asar NO encontrado"
        echo "   Archivos en Resources:"
        ls -la "$RESOURCES_PATH/"
    fi
else
    echo "❌ No existe Contents/Resources"
fi

# Verificar si hay archivos sueltos
echo ""
echo "🔍 Buscando archivos sueltos en Resources:"
find "$RESOURCES_PATH" -type f -name "*.html" -o -name "*.js" -o -name "*.css" 2>/dev/null | head -10

# Verificar dist directory
echo ""
echo "📁 Directorio dist/:"
ls -la dist/

# Probar a ejecutar con logging
echo ""
echo "🚀 Ejecutando app con logging..."
echo "Presiona Ctrl+C para detener"
echo ""

# Crear script temporal para ejecutar con logging
cat > /tmp/run-clawdesk.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('=== CLAWDESK DEBUG START ===');

app.whenReady().then(() => {
  console.log('✅ App ready');
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });
  
  win.once('ready-to-show', () => {
    console.log('✅ Window ready to show');
    win.show();
    win.webContents.openDevTools();
  });
  
  // Intentar cargar
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('📄 Intentando cargar:', indexPath);
  console.log('📄 Existe?', fs.existsSync(indexPath));
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html existe, cargando...');
    win.loadFile(indexPath).then(() => {
      console.log('✅ loadFile completado');
    }).catch(err => {
      console.error('❌ Error en loadFile:', err);
    });
  } else {
    console.error('❌ index.html NO existe');
    console.log('📁 Contenido de dist/:');
    try {
      const files = fs.readdirSync(path.join(__dirname, 'dist'));
      console.log(files);
    } catch (err) {
      console.error('Error leyendo dist:', err);
    }
  }
  
  win.webContents.on('did-finish-load', () => {
    console.log('✅ Contenido cargado completamente');
  });
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error cargando:', errorCode, errorDescription);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
EOF

# Ejecutar desde el directorio correcto
cd "$(pwd)"
/Applications/Electron.app/Contents/MacOS/Electron . --enable-logging 2>&1 | grep -E "(CLAWDESK|ERROR|Error|error|✅|❌|📄|📁)" | head -50

echo ""
echo "💡 SOLUCIONES POSIBLES:"
echo ""
echo "1. Reconstruir frontend:"
echo "   npm run build"
echo ""
echo "2. Verificar que dist/index.html existe:"
echo "   ls -la dist/index.html"
echo ""
echo "3. Ejecutar en modo desarrollo para debug:"
echo "   npm run dev"
echo ""
echo "4. Ver logs de Electron:"
echo "   open -a Console"
echo "   Buscar 'Electron' o 'CLAWDESK'"
echo ""
echo "5. Probar cargar manualmente:"
echo "   open dist/index.html"