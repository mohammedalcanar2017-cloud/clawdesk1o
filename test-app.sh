#!/bin/bash
# Script para TESTEAR la app CLAWDESK sin rebuild

echo "🔍 CLAWDESK Test Script"
echo "======================"

# Verificar dependencias
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que dist/index.html existe
if [ ! -f "dist/index.html" ]; then
    echo "❌ dist/index.html no encontrado"
    echo "Ejecuta primero: npm run build"
    exit 1
fi

echo "✅ dist/index.html encontrado"

# Verificar estructura
echo ""
echo "📁 Estructura de dist/:"
ls -la dist/

echo ""
echo "📄 Contenido de index.html (primeras 10 líneas):"
head -10 dist/index.html

# Crear test app si no existe
if [ ! -f "test-simple-app.js" ]; then
    echo "❌ test-simple-app.js no encontrado"
    echo "Descargando..."
    curl -s -L -o test-simple-app.js "https://raw.githubusercontent.com/mohammedalcanar2017-cloud/clawdesk1o/main/test-simple-app.js" 2>/dev/null || echo "No se pudo descargar"
fi

if [ ! -f "test-simple-app.js" ]; then
    echo "❌ No se pudo obtener test-simple-app.js"
    exit 1
fi

echo ""
echo "🚀 Ejecutando test app con DEBUG..."
echo "Presiona Ctrl+C para detener"
echo ""

# Ejecutar test
/Applications/Electron.app/Contents/MacOS/Electron test-simple-app.js --enable-logging 2>&1 | grep -E "(CLAWDESK|✅|❌|📁|📄|Error|error|Loading|Success|Failed)" | head -100

echo ""
echo "💡 SI VES ERRORES:"
echo ""
echo "1. Verifica que dist/index.html tiene contenido correcto:"
echo "   head -20 dist/index.html"
echo ""
echo "2. Verifica que los assets existen:"
echo "   ls -la dist/assets/"
echo ""
echo "3. Prueba cargar en navegador:"
echo "   open dist/index.html"
echo ""
echo "4. Si el navegador muestra la app, el problema es Electron."
echo "   Si no, el problema es el build de Vite."