#!/bin/bash
# Reconstruir CLAWDESK AGENT - Agente autónomo

echo "🤖 CLAWDESK AGENT REBUILD"
echo "=========================="

echo "📦 Actualizando repositorio..."
git pull origin main

echo "🔧 Instalando módulos nativos..."
./install-native.sh

echo "🧠 Instalando dependencias de IA..."
npm install axios

echo "🔨 Construyendo frontend del agente..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en build del frontend"
    exit 1
fi

echo "🍎 Construyendo app macOS..."
./build-mac-fixed.sh

echo ""
echo "🎯 ¡CLAWDESK AGENT LISTO!"
echo ""
echo "🚀 CARACTERÍSTICAS DEL AGENTE:"
echo "   1. 🤖 PLANIFICACIÓN AUTÓNOMA - IA descompone tareas complejas"
echo "   2. 🧠 BIBLIOTECA DE ACCIONES - Click, type, scroll, open_app, etc."
echo "   3. 👁️ MONITOREO CONTINUO - Screenshots cada 2 segundos"
echo "   4. 🎯 OVERLAY VISUAL - Cruces, highlights, guías en pantalla"
echo "   5. 📊 FEEDBACK LOOP - Verifica y se corrige automáticamente"
echo ""
echo "💬 EJEMPLOS DE USO:"
echo "   \"Abre Chrome y busca 'clima en Madrid'\""
echo "   \"Organiza los archivos del escritorio por tipo\""
echo "   \"Configura mi correo en la app de correo\""
echo "   \"Toma capturas de todas las ventanas abiertas\""
echo ""
echo "🔧 CONFIGURACIÓN:"
echo "   1. API Key de DeepSeek en platform.deepseek.com"
echo "   2. Permisos de accesibilidad en macOS"
echo "   3. Variable de entorno: export DEEPSEEK_API_KEY=tu_key"
echo ""
echo "🎮 HOTKEY: Cmd+Shift+A para activar/desactivar agente"
echo ""
echo "🚀 Para ejecutar: open dist/mac/CLAWDESK.app"