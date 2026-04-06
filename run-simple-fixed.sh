#!/bin/bash
# Script para ejecutar CLAWDESK ULTRA SIMPLE (usa npx)

echo "🚀 CLAWDESK ULTRA SIMPLE (npx version)"
echo "======================================"

# Verificar que tenemos electron en node_modules
if [ ! -d "node_modules/electron" ]; then
    echo "❌ Electron no encontrado en node_modules"
    echo "Instalando electron localmente..."
    npm install electron --save-dev 2>&1 | tail -10
    
    if [ ! -d "node_modules/electron" ]; then
        echo "❌ No se pudo instalar electron"
        exit 1
    fi
fi

echo "✅ Electron disponible localmente"

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
echo "🎯 EJECUTANDO CLAWDESK ULTRA SIMPLE CON NPX..."
echo "Esta versión carga HTML DIRECTAMENTE (sin archivos externos)"
echo "Debe funcionar 100%"
echo ""
echo "Presiona Ctrl+C para cerrar"
echo ""

# Ejecutar con npx
npx electron ultra-simple-app.js --enable-logging

echo ""
echo "💡 Si esto funciona, el problema original era:"
echo "   1. Electron no podía cargar dist/index.html"
echo "   2. O los assets no estaban accesibles"
echo ""
echo "📋 Próximos pasos SI FUNCIONA:"
echo "   1. Verificar que dist/index.html existe: ls -la dist/index.html"
echo "   2. Probar en navegador: open dist/index.html"
echo "   3. Si navegador funciona, arreglar main.js paths"
echo "   4. Si navegador NO funciona, reconstruir: npm run build"
echo ""
echo "📋 Próximos pasos SI NO FUNCIONA:"
echo "   1. Verificar Node.js: node --version"
echo "   2. Reinstalar dependencias: rm -rf node_modules && npm install"
echo "   3. Probar electron directamente: ./node_modules/.bin/electron --version"