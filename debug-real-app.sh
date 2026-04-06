#!/bin/bash
# Script para debuggear la app REAL CLAWDESK

echo "🔍 DEBUG REAL CLAWDESK APP"
echo "=========================="

# Verificar que dist/index.html existe
if [ ! -f "dist/index.html" ]; then
    echo "❌ dist/index.html no encontrado"
    echo "Ejecuta: npm run build"
    exit 1
fi

echo "✅ dist/index.html encontrado"

# Verificar estructura
echo ""
echo "📁 Estructura de dist/:"
ls -la dist/

echo ""
echo "📄 Contenido de index.html (primeras 5 líneas):"
head -5 dist/index.html

echo ""
echo "📁 Contenido de assets/:"
ls -la dist/assets/ 2>/dev/null || echo "No assets directory"

# Copiar main-debug.js si no existe
if [ ! -f "main-debug.js" ]; then
    echo "📥 Descargando main-debug.js..."
    curl -s -L -o main-debug.js "https://raw.githubusercontent.com/mohammedalcanar2017-cloud/clawdesk1o/main/main-debug.js" 2>/dev/null || echo "No se pudo descargar"
fi

if [ ! -f "main-debug.js" ]; then
    echo "❌ No se pudo obtener main-debug.js"
    exit 1
fi

echo ""
echo "🚀 Ejecutando app con DEBUG EXTREMO..."
echo "Presiona Ctrl+C para detener"
echo ""

# Crear package.json temporal para electron
cat > package-debug.json << EOF
{
  "name": "clawdesk-debug",
  "version": "1.0.0",
  "main": "main-debug.js"
}
EOF

# Ejecutar
npx electron . --enable-logging 2>&1 | grep -E "(CLAWDESK|✅|❌|📁|📄|🌐|📍|📜|Error|error|Loading|Success|Failed|DIR|FILE)" | head -100

# Limpiar
rm -f package-debug.json

echo ""
echo "💡 ANÁLISIS DE ERRORES COMUNES:"
echo ""
echo "1. Si ves 'index.html exists? true' pero 'Failed to load':"
echo "   - Problema de Content Security Policy"
echo "   - Solución: Añadir <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self' 'unsafe-inline';\">"
echo ""
echo "2. Si ves 'Script X - exists? false':"
echo "   - Los assets no están en el path correcto"
echo "   - Solución: Revisar vite.config.ts base path"
echo ""
echo "3. Si ves 'Base href found: /':"
echo "   - Problema: base href es absoluto en lugar de relativo"
echo "   - Solución: En vite.config.ts, usar base: './'"
echo ""
echo "4. Si NO ves errores pero la app está en blanco:"
echo "   - Problema de React hydration"
echo "   - Solución: Verificar que main.tsx renderiza correctamente"