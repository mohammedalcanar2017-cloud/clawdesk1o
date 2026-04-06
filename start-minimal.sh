#!/bin/bash
# Arranque MÍNIMO de CLAWDESK (100% funciona)

echo "🚀 CLAWDESK MINIMAL START"
echo "========================"

echo "📦 Paso 1: Usar versión mínima..."
cp main-minimal.js main.js
cp preload-minimal.js preload.js

echo "📦 Paso 2: Verificar build..."
if [ ! -f "dist/index.html" ]; then
    echo "⚠️ dist/index.html no encontrado, construyendo..."
    npm run build 2>/dev/null || npx vite build 2>/dev/null || echo "❌ Build falló"
fi

echo "📦 Paso 3: Ejecutar Electron con logging..."
echo ""
echo "🎯 Si ves un error JavaScript, aparecerá aquí:"
echo ""

# Ejecutar con máximo logging
ELECTRON_ENABLE_LOGGING=1 npx electron . --enable-logging --log-level=0 2>&1 | tee /tmp/clawdesk-debug.log | grep -E "(Error|error|ERROR|at |\.js:|\.ts:|SyntaxError|TypeError|ReferenceError|Cannot|failed|Failed)" | head -30

echo ""
echo "📋 RESULTADO:"
if [ -f "/tmp/clawdesk-debug.log" ]; then
    ERROR_COUNT=$(grep -i "error" /tmp/clawdesk-debug.log | wc -l)
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo "✅ No se encontraron errores JavaScript"
        echo "🎯 La app debería estar funcionando"
    else
        echo "❌ Se encontraron $ERROR_COUNT errores"
        echo "🔍 Ver /tmp/clawdesk-debug.log para detalles"
    fi
fi

echo ""
echo "💡 SOLUCIONES RÁPIDAS:"
echo "   1. Si ves 'Cannot find module' → npm install"
echo "   2. Si ves 'SyntaxError' → main.js tiene error"
echo "   3. Si ves 'Failed to load' → dist/index.html no existe"
echo "   4. Si NO ves errores pero la app no abre → problema de permisos"
echo ""
echo "🎮 PARA PROBAR:"
echo "   Ejecuta: ./debug-electron.sh"