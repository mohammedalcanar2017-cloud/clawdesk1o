#!/bin/bash
# Reconstruir CLAWDESK REAL con IA y control REAL

echo "🚀 CLAWDESK REAL REBUILD"
echo "========================"

echo "📦 Actualizando repositorio..."
git pull origin main

echo "🔧 Instalando módulos nativos..."
./install-native.sh

echo "🔨 Construyendo frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en build del frontend"
    exit 1
fi

echo "🍎 Construyendo app macOS..."
./build-mac-fixed.sh

echo ""
echo "🎯 ¡CLAWDESK REAL LISTO!"
echo ""
echo "📋 CARACTERÍSTICAS REALES:"
echo "   1. 🧠 IA REAL (DeepSeek/OpenAI con visión)"
echo "   2. 📸 Capturas de pantalla REALES"
echo "   3. 🖱️ Control REAL de mouse"
echo "   4. ⌨️ Control REAL de teclado"
echo "   5. ⚡ Acciones REALES (no simulaciones)"
echo ""
echo "🔧 CONFIGURACIÓN REQUERIDA:"
echo "   1. Obtén API key de DeepSeek: platform.deepseek.com"
echo "   2. Configura en la app: Botón ⚙️ → API Key"
echo "   3. Da permisos en macOS: System Preferences → Accessibility"
echo ""
echo "💬 EJEMPLOS REALES:"
echo "   \"Haz clic en el botón de cerrar\""
echo "   \"Escribe 'Hola mundo' en el navegador\""
echo "   \"¿Qué hay en mi pantalla?\""
echo ""
echo "🚀 Para ejecutar: open dist/mac/CLAWDESK.app"
echo ""
echo "⚠️ IMPORTANTE: Primera ejecución puede pedir permisos de accesibilidad"