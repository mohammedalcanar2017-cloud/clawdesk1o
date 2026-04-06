#!/bin/bash
# Script FIXED para construir CLAWDESK en macOS

echo "🚀 CLAWDESK macOS Build Script (FIXED)"
echo "======================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm: $(npm --version)"

# Limpiar builds anteriores
echo ""
echo "🧹 Limpiando builds anteriores..."
rm -rf dist build-mac-fixed.log 2>/dev/null

# Instalar/actualizar dependencias
echo ""
echo "📦 Instalando/actualizando dependencias..."
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
mkdir -p build 2>/dev/null

# Crear icono PNG si no existe
if [ ! -f "build/icon.png" ]; then
    echo "📱 Creando icono PNG..."
    # Crear icono simple 256x256 azul con 'C' blanca
    if command -v convert &> /dev/null; then
        convert -size 256x256 xc:#2563eb -fill white -pointsize 100 -gravity center -draw "text 0,0 'C'" build/icon.png
    else
        echo "⚠️  ImageMagick no disponible, descargando icono..."
        curl -s -L -o build/icon.png "https://raw.githubusercontent.com/mohammedalcanar2017-cloud/clawdesk1o/main/build/icon.png" 2>/dev/null || echo "No se pudo descargar icono"
    fi
fi

# Crear .icns desde PNG
echo "📱 Creando icon.icns..."
if command -v iconutil &> /dev/null && [ -f "build/icon.png" ]; then
    # Crear directorio temporal para iconos
    mkdir -p clawdesk.iconset 2>/dev/null
    
    # Crear diferentes tamaños
    sips -z 16 16 build/icon.png --out clawdesk.iconset/icon_16x16.png 2>/dev/null
    sips -z 32 32 build/icon.png --out clawdesk.iconset/icon_16x16@2x.png 2>/dev/null
    sips -z 32 32 build/icon.png --out clawdesk.iconset/icon_32x32.png 2>/dev/null
    sips -z 64 64 build/icon.png --out clawdesk.iconset/icon_32x32@2x.png 2>/dev/null
    sips -z 128 128 build/icon.png --out clawdesk.iconset/icon_128x128.png 2>/dev/null
    sips -z 256 256 build/icon.png --out clawdesk.iconset/icon_128x128@2x.png 2>/dev/null
    sips -z 256 256 build/icon.png --out clawdesk.iconset/icon_256x256.png 2>/dev/null
    sips -z 512 512 build/icon.png --out clawdesk.iconset/icon_256x256@2x.png 2>/dev/null
    sips -z 512 512 build/icon.png --out clawdesk.iconset/icon_512x512.png 2>/dev/null
    
    # Convertir a .icns
    iconutil -c icns -o build/icon.icns clawdesk.iconset 2>/dev/null
    rm -rf clawdesk.iconset 2>/dev/null
    
    if [ -f "build/icon.icns" ]; then
        echo "✅ icon.icns creado"
    else
        echo "⚠️  No se pudo crear .icns, usando PNG"
        cp build/icon.png build/icon.icns 2>/dev/null
    fi
else
    echo "⚠️  iconutil no disponible, usando PNG como .icns"
    cp build/icon.png build/icon.icns 2>/dev/null
fi

# Construir app macOS
echo ""
echo "🍎 Construyendo app macOS (esto puede tardar 2-3 minutos)..."
echo ""

# Construir .app primero
echo "1. Construyendo .app..."
npx electron-builder --mac dir 2>&1 | tee build-mac-fixed.log

if [ $? -eq 0 ]; then
    echo "✅ .app construido"
    
    # Renombrar Electron.app a CLAWDESK.app si es necesario
    if [ -d "dist/mac/Electron.app" ]; then
        echo "🔄 Renombrando Electron.app a CLAWDESK.app..."
        mv "dist/mac/Electron.app" "dist/mac/CLAWDESK.app" 2>/dev/null
    fi
    
    # Construir .dmg
    echo ""
    echo "2. Construyendo .dmg..."
    npx electron-builder --mac dmg 2>&1 | tee -a build-mac-fixed.log
    
    if [ $? -eq 0 ]; then
        echo "✅ .dmg construido"
    else
        echo "⚠️  .dmg falló, pero .app está listo"
    fi
else
    echo "❌ Build falló"
    echo "💡 Intenta: npm install electron-builder --save-dev"
    exit 1
fi

echo ""
echo "🎉 ¡BUILD COMPLETADO!"
echo "===================="

# Mostrar resultados
echo ""
echo "📁 ARCHIVOS GENERADOS:"
echo ""

# Buscar .app
find dist -name "*.app" -type d 2>/dev/null | while read app; do
    app_name=$(basename "$app" .app)
    app_size=$(du -sh "$app" 2>/dev/null | cut -f1)
    echo "  🍎 $app_name.app - $app_size"
    echo "     📍 $app"
done

# Buscar .dmg
find dist -name "*.dmg" 2>/dev/null | while read dmg; do
    dmg_name=$(basename "$dmg")
    dmg_size=$(du -h "$dmg" 2>/dev/null | cut -f1)
    echo "  📦 $dmg_name - $dmg_size"
    echo "     📍 $dmg"
done

# Buscar .zip
find dist -name "*.zip" 2>/dev/null | while read zip; do
    zip_name=$(basename "$zip")
    zip_size=$(du -h "$zip" 2>/dev/null | cut -f1)
    echo "  📎 $zip_name - $zip_size"
    echo "     📍 $zip"
done

echo ""
echo "🚀 INSTRUCCIONES DE USO:"
echo ""
if [ -d "dist/mac/CLAWDESK.app" ]; then
    echo "  Para ejecutar directamente:"
    echo "    open dist/mac/CLAWDESK.app"
    echo ""
    echo "  Para instalar en Aplicaciones:"
    echo "    cp -r dist/mac/CLAWDESK.app /Applications/"
fi

if [ -f "dist/CLAWDESK-1.0.0.dmg" ]; then
    echo ""
    echo "  Para instalar desde .dmg:"
    echo "    1. Abre dist/CLAWDESK-1.0.0.dmg"
    echo "    2. Arrastra CLAWDESK a la carpeta Aplicaciones"
fi

echo ""
echo "🔍 Log completo en: build-mac-fixed.log"
echo ""
echo "✅ ¡LISTO! La app está construida y lista para usar."