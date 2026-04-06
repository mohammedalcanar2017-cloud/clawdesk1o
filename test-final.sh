#!/bin/bash
# 🧪 TEST FINAL - Verificar qué funciona

echo "🧪 CLAWDESK TEST FINAL"
echo "======================"

echo "🔍 Paso 1: Verificar entorno..."
echo "Node.js: $(node --version 2>/dev/null || echo 'No instalado')"
echo "npm: $(npm --version 2>/dev/null || echo 'No instalado')"
echo "Electron: $(npx electron --version 2>/dev/null || echo 'No instalado')"

echo ""
echo "🔍 Paso 2: Probar métodos de apertura..."
echo ""
echo "📱 OPCIÓN A: Abrir en navegador (HTML puro)"
echo "   Comando: open test-direct.html"
echo "   Esto SÍ funciona 100%"
echo ""
echo "🤖 OPCIÓN B: Electron simple"
echo "   Comando: npx electron clawdesk-simple.js"
echo "   Puede fallar si hay problemas de permisos"
echo ""
echo "🚀 OPCIÓN C: Script ultra-simple"
echo "   Comando: ./run-ultra-simple.sh"
echo "   Versión más robusta"

echo ""
echo "🎯 RECOMENDACIÓN:"
echo "   1. PRIMERO prueba la OPCIÓN A (HTML puro)"
echo "   2. Si funciona, prueba OPCIÓN C"
echo "   3. Solo después prueba builds complejos"

echo ""
echo "📋 PARA PROBAR OPCIÓN A (AHORA MISMO):"
echo "   Ejecuta este comando:"
echo "   open test-direct.html"
echo ""
echo "📋 PARA PROBAR OPCIÓN C:"
echo "   chmod +x run-ultra-simple.sh"
echo "   ./run-ultra-simple.sh"

echo ""
echo "🔧 DIAGNÓSTICO RÁPIDO:"
echo "   ¿Electron instalado?: $(command -v electron >/dev/null && echo '✅ Sí' || echo '❌ No')"
echo "   ¿Chrome instalado?: $(command -v google-chrome >/dev/null && echo '✅ Sí' || echo '❌ No')"
echo "   ¿Permisos Terminal?: $(osascript -e 'tell application "System Events" to UI elements enabled' 2>/dev/null && echo '✅ Sí' || echo '❌ No')"

echo ""
echo "🚀 EJECUTANDO PRUEBA A (HTML PURO)..."
sleep 2
open test-direct.html 2>/dev/null || echo "❌ No se pudo abrir. Usa: open -a 'Google Chrome' test-direct.html"

echo ""
echo "✅ Si ves una ventana con CLAWDESK, ¡funciona!"
echo "❌ Si no ves nada, hay problemas de permisos o instalación"