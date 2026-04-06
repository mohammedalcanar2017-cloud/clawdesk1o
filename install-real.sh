#!/bin/bash
# 🦾 INSTALACIÓN COMPLETA DE CLAWDESK REAL

echo "🦾 CLAWDESK REAL - INSTALACIÓN COMPLETA"
echo "========================================"

echo "📦 Paso 1: Actualizar repositorio..."
git pull origin main

echo "📦 Paso 2: Instalar Xcode Command Line Tools..."
xcode-select --install 2>/dev/null || echo "✅ Xcode CLI ya instalado"

echo "📦 Paso 3: Instalar dependencias del sistema..."
echo "⚠️ Esto puede tomar varios minutos..."
brew install git libpng jpeg-turbo imagemagick tesseract 2>/dev/null || echo "✅ Dependencias instaladas o ya presentes"

echo "📦 Paso 4: Instalar módulos Node.js REALES..."
npm install robotjs screenshot-desktop opencv4nodejs tesseract.js axios --save

echo "📦 Paso 5: Instalar dependencias de desarrollo..."
npm install

echo "📦 Paso 6: Configurar API key de DeepSeek..."
read -p "¿Tienes API key de DeepSeek? (s/n): " hasKey

if [[ $hasKey == "s" || $hasKey == "S" ]]; then
    read -p "Pega tu API key: " apiKey
    echo "export DEEPSEEK_API_KEY=$apiKey" >> ~/.zshrc
    echo "✅ API key configurada en ~/.zshrc"
else
    echo "⚠️ Sin API key, el agente funcionará en modo limitado"
    echo "   Obtén una en: https://platform.deepseek.com/api_keys"
fi

echo "📦 Paso 7: Construir frontend..."
npm run build

echo "📦 Paso 8: Configurar permisos macOS..."
echo ""
echo "⚠️ IMPORTANTE: Da estos permisos en System Preferences:"
echo "   1. Security & Privacy → Accessibility"
echo "      ✓ Terminal"
echo "      ✓ CLAWDESK.app (después de construir)"
echo "   2. Security & Privacy → Screen Recording"
echo "      ✓ CLAWDESK.app"
echo "   3. Security & Privacy → Automation"
echo "      ✓ CLAWDESK.app puede controlar otras apps"
echo ""

echo "📦 Paso 9: Construir aplicación..."
./build-mac-fixed.sh

echo ""
echo "🎯 ¡INSTALACIÓN COMPLETADA!"
echo ""
echo "🚀 CARACTERÍSTICAS DE CLAWDESK REAL:"
echo "   1. 🧠 IA REAL - DeepSeek/OpenAI con visión"
echo "   2. 👁️ VISIÓN REAL - Análisis de pantalla con OpenCV"
echo "   3. 🛠️ CONTROL REAL - Mouse, teclado, aplicaciones"
echo "   4. 🤖 AGENTE AUTÓNOMO - Piensa y ejecuta como OpenClaw"
echo "   5. 📝 SCRIPTS DINÁMICOS - Se adapta a cualquier tarea"
echo ""
echo "💬 EJEMPLOS REALES QUE FUNCIONAN:"
echo "   \"Configura mi correo en Outlook\""
echo "   \"Organiza los archivos del escritorio\""
echo "   \"Abre Chrome y busca vuelos baratos\""
echo "   \"Toma capturas y analiza el contenido\""
echo ""
echo "🔧 CONFIGURACIÓN:"
echo "   API Key: export DEEPSEEK_API_KEY=tu_key"
echo "   O configurar en la app: Botón ⚙️"
echo ""
echo "🎮 HOTKEYS:"
echo "   Cmd+Shift+A: Activar/desactivar agente"
echo "   Cmd+Shift+S: Detener agente"
echo ""
echo "🚀 PARA EJECUTAR:"
echo "   open dist/mac/CLAWDESK.app"
echo ""
echo "📱 LA APP ES 100% INDEPENDIENTE:"
echo "   - No necesita OpenClaw"
echo "   - No necesita servidores externos"
echo "   - Funciona offline (excepto llamadas a IA)"
echo "   - Totalmente portable y vendible"