#!/bin/bash
# Instalar módulos nativos para CLAWDESK REAL

echo "🔧 Instalando módulos nativos para CLAWDESK REAL..."
echo "=================================================="

# Instalar dependencias del sistema (macOS)
echo "📦 Instalando dependencias del sistema..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Para robotjs en macOS
    brew install libpng jpeg-turbo
    
    # Para screenshot-desktop
    brew install imagemagick
fi

# Instalar node-gyp globalmente si no está
if ! command -v node-gyp &> /dev/null; then
    echo "📦 Instalando node-gyp..."
    npm install -g node-gyp
fi

# Reinstalar node_modules con compilación nativa
echo "🔄 Reinstalando node_modules con módulos nativos..."
rm -rf node_modules package-lock.json

# Instalar con flags para compilación nativa
npm install --build-from-source

# Verificar instalación
echo "✅ Verificando instalación..."
if [ -d "node_modules/robotjs" ]; then
    echo "   ✅ robotjs instalado"
else
    echo "   ❌ robotjs NO instalado"
fi

if [ -d "node_modules/screenshot-desktop" ]; then
    echo "   ✅ screenshot-desktop instalado"
else
    echo "   ❌ screenshot-desktop NO instalado"
fi

echo ""
echo "🎯 CLAWDESK REAL ahora tiene:"
echo "   1. 📸 screenshot-desktop - Capturas REALES"
echo "   2. 🖱️ robotjs - Control REAL de mouse/teclado"
echo "   3. 🧠 axios - Para llamadas a API de IA"
echo ""
echo "⚠️ NOTA: En macOS, puede necesitar permisos:"
echo "   System Preferences → Security & Privacy → Accessibility"
echo "   Añadir Terminal y la app CLAWDESK"
echo ""
echo "🚀 Para construir la app: ./build-mac-fixed.sh"