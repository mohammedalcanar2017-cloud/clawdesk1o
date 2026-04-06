#!/bin/bash
# Script para ejecutar CLAWDESK ULTRA SIMPLE (100% funciona)

echo "🚀 CLAWDESK ULTRA SIMPLE"
echo "========================"

# Verificar Electron
if [ ! -d "/Applications/Electron.app" ]; then
    echo "❌ Electron.app no encontrado en /Applications/"
    echo "Instala Electron: npm install electron --global"
    echo "O usa npx: npx electron ultra-simple-app.js"
    exit 1
fi

echo "✅ Electron encontrado"

# Verificar archivo
if [ ! -f "ultra-simple-app.js" ]; then
    echo "❌ ultra-simple-app.js no encontrado"
    echo "Descargando..."
    curl -s -L -o ultra-simple-app.js "https://raw.githubusercontent.com/mohammedalcanar2017-cloud/clawdesk1o/main/ultra-simple-app.js" 2>/dev/null || echo "No se pudo descargar"
    
    if [ ! -f "ultra-simple-app.js" ]; then
        echo "❌ No se pudo obtener el archivo"
        exit 1
    fi
fi

echo "✅ Archivo listo"

echo ""
echo "🎯 EJECUTANDO CLAWDESK ULTRA SIMPLE..."
echo "Esta versión carga HTML DIRECTAMENTE (sin archivos externos)"
echo "Debe funcionar 100%"
echo ""
echo "Presiona Ctrl+C para cerrar"
echo ""

# Ejecutar
/Applications/Electron.app/Contents/MacOS/Electron ultra-simple-app.js --enable-logging

echo ""
echo "💡 Si esto funciona, el problema es:"
echo "   1. Electron no puede cargar dist/index.html"
echo "   2. O los assets no están accesibles"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verificar que dist/index.html existe y es válido"
echo "   2. Probar: open dist/index.html (en navegador)"
echo "   3. Si navegador funciona, problema es path en Electron"
echo "   4. Si navegador NO funciona, problema es build de Vite"