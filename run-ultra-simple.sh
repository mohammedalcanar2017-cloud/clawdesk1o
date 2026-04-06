#!/bin/bash
# 🚀 CLAWDESK ULTRA-SIMPLE - Versión que SÍ abre

echo "🤖 CLAWDESK ULTRA-SIMPLE"
echo "========================"

echo "📦 Paso 1: Verificar Electron..."
if ! command -v electron &> /dev/null; then
    echo "⚠️ Electron no encontrado, instalando..."
    npm install electron@28.0.0 --no-save
fi

echo ""
echo "📦 Paso 2: Crear package.json mínimo..."
cat > package-ultra.json << 'EOF'
{
  "name": "clawdesk-ultra",
  "version": "1.0.0",
  "main": "clawdesk-simple.js",
  "scripts": {
    "start": "electron ."
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF

# Usar este package.json
cp package-ultra.json package.json

echo ""
echo "🎯 ¡LISTO PARA EJECUTAR!"
echo ""
echo "🚀 EJECUTANDO CLAWDESK..."
echo "   La ventana se abrirá en 2 segundos..."
echo "   - Verás la interfaz COMPLETA"
echo "   - DevTools abiertos para debugging"
echo "   - Puedes escribir objetivos y probar"
echo ""

sleep 2

# Ejecutar DIRECTAMENTE
npx electron clawdesk-simple.js 2>&1 | grep -v "Downloading" | head -20

echo ""
echo "🔧 SI LA VENTANA SALE EN BLANCO:"
echo "   1. Espera 5 segundos - a veces tarda en cargar"
echo "   2. Presiona Cmd+R para recargar"
echo "   3. Verifica que no hay errores en la terminal"
echo ""
echo "✅ SI FUNCIONA, VERÁS:"
echo "   • Título: 'CLAWDESK SIMPLE'"
echo "   • Fondo oscuro con interfaz azul"
echo "   • Campo de texto para objetivos"
echo "   • Botones para ejecutar"
echo "   • Logs en tiempo real"
echo ""
echo "💡 PARA PROBAR:"
echo "   1. Escribe: 'Abre Chrome'"
echo "   2. Haz clic en: 🚀 Ejecutar Agente"
echo "   3. Observa los logs que aparecen"