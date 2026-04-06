#!/bin/bash
# ✅ VERIFICAR INSTALACIÓN CLAWDESK REAL

echo "🔍 VERIFICANDO INSTALACIÓN..."
echo "=============================="

echo "1. ✅ Node.js version:"
node --version

echo ""
echo "2. ✅ Dependencias instaladas:"
npm list robotjs screenshot-desktop opencv4nodejs tesseract.js axios 2>/dev/null | grep -E "robotjs|screenshot-desktop|opencv4nodejs|tesseract|axios"

echo ""
echo "3. ✅ Xcode Command Line Tools:"
xcode-select -p 2>/dev/null && echo "✅ Instalado" || echo "❌ No instalado"

echo ""
echo "4. ✅ Permisos (necesitas verificar manualmente):"
echo "   - System Preferences → Security & Privacy → Accessibility"
echo "   - System Preferences → Security & Privacy → Screen Recording"
echo "   - System Preferences → Security & Privacy → Automation"

echo ""
echo "5. ✅ API key configurada:"
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo "✅ API key encontrada (longitud: ${#DEEPSEEK_API_KEY})"
else
    echo "⚠️ No hay API key configurada"
    echo "   export DEEPSEEK_API_KEY=tu_key"
fi

echo ""
echo "6. ✅ Build disponible:"
if [ -f "dist/mac/CLAWDESK.app/Contents/MacOS/CLAWDESK" ]; then
    echo "✅ App construida: dist/mac/CLAWDESK.app"
else
    echo "⚠️ App no construida. Ejecuta: ./build-mac-fixed.sh"
fi

echo ""
echo "7. ✅ Scripts disponibles:"
ls -la *.sh | grep -E "install|build|run|verify"

echo ""
echo "🎯 RESUMEN:"
echo "   Si ves ✅ en todos, la instalación es correcta."
echo "   Si ves ❌ o ⚠️, sigue las instrucciones abajo."
echo ""
echo "🚀 PARA EJECUTAR:"
echo "   ./build-mac-fixed.sh   # Construir app"
echo "   open dist/mac/CLAWDESK.app  # Abrir"
echo ""
echo "🔧 SI HAY PROBLEMAS:"
echo "   1. Reinstalar: npm install"
echo "   2. Permisos: System Preferences → Security"
echo "   3. Xcode: xcode-select --install"
echo "   4. API key: export DEEPSEEK_API_KEY=tu_key"