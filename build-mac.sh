#!/bin/bash
# Script para construir CLAWDESK en macOS

echo "🚀 CLAWDESK macOS Build Script"
echo "==============================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm: $(npm --version)"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Construir frontend
echo ""
echo "🔨 Construyendo frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error construyendo frontend"
    exit 1
fi

echo "✅ Frontend construido"

# Crear iconos para macOS
echo ""
echo "🎨 Creando iconos para macOS..."
mkdir -p build/icons 2>/dev/null

# Verificar si hay icono PNG
if [ ! -f "build/icon.png" ]; then
    echo "⚠️  Creando icono básico..."
    # Crear icono simple 256x256 azul
    convert -size 256x256 xc:#2563eb -fill white -pointsize 100 -gravity center -draw "text 0,0 'C'" build/icon.png 2>/dev/null || echo "No se pudo crear icono, continuando..."
fi

# Intentar crear .icns si iconutil está disponible
if command -v iconutil &> /dev/null; then
    echo "📱 Creando icon.icns..."
    iconutil -c icns -o build/icon.icns build/icon.png 2>/dev/null || echo "No se pudo crear .icns"
else
    echo "⚠️  iconutil no disponible, usando PNG simple"
    cp build/icon.png build/icon.icns 2>/dev/null || true
fi

echo "✅ Iconos preparados"

# Construir app macOS
echo ""
echo "🍎 Construyendo app macOS..."
echo "Esto puede tardar varios minutos..."

# Intentar construir .dmg
npm run dist:mac-dmg 2>&1 | tee build-mac.log

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡ÉXITO! App macOS construida"
    echo ""
    echo "📁 Archivos generados:"
    find dist -name "*.dmg" -o -name "*.app" 2>/dev/null | while read file; do
        echo "  ✅ $file"
        ls -lh "$file" 2>/dev/null | awk '{print "    Tamaño: "$5}'
    done
    
    echo ""
    echo "📋 Resumen:"
    echo "  • .dmg instalador: dist/CLAWDESK-1.0.0.dmg"
    echo "  • .app portable: dist/mac/CLAWDESK.app"
    echo ""
    echo "🚀 Para ejecutar:"
    echo "  Abre el .dmg y arrastra CLAWDESK a la carpeta Aplicaciones"
    echo "  O ejecuta directamente: open dist/mac/CLAWDESK.app"
else
    echo ""
    echo "⚠️  Build falló, intentando método alternativo..."
    
    # Intentar construir solo .app
    npm run dist:mac-app 2>&1 | tee -a build-mac.log
    
    if [ $? -eq 0 ]; then
        echo "✅ .app construido exitosamente"
        echo "📁 En: dist/mac/CLAWDESK.app"
    else
        echo "❌ Build falló completamente"
        echo "📄 Revisa el log: build-mac.log"
        echo ""
        echo "💡 Soluciones posibles:"
        echo "  1. Ejecuta: npm install electron-builder --save-dev"
        echo "  2. Ejecuta: npm install electron --save-dev"
        echo "  3. Revisa que tienes Xcode Command Line Tools instalados"
        echo "  4. Intenta construir manualmente: npm run dist:mac"
    fi
fi

echo ""
echo "🔍 Log completo en: build-mac.log"