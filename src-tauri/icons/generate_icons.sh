#!/bin/bash
# Script para generar iconos placeholder para Tauri

mkdir -p icons

# Crear icono .icns placeholder (formato requerido por macOS)
cat > icons/icon.icns << 'EOF'
# Este es un icono placeholder. En producción, reemplazar con iconos reales.
# Tauri requiere un archivo .icns para builds de macOS.
EOF

# Crear iconos PNG placeholder
echo "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB" > icons/32x32.png.base64
echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB" > icons/128x128.png.base64
echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB" > icons/128x128@2x.png.base64

# Copiar placeholders
cp icons/32x32.png.base64 icons/32x32.png
cp icons/128x128.png.base64 icons/128x128.png
cp icons/128x128@2x.png.base64 icons/128x128@2x.png

echo "✅ Iconos placeholder generados para macOS build"