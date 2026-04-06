#!/bin/bash
# 🔧 SOLUCIÓN PARA ARCHIVOS FALTANTES

echo "📥 CLAWDESK - Descargar archivos faltantes"
echo "=========================================="

echo "📦 Paso 1: Forzar actualización del repositorio..."
git fetch origin
git reset --hard origin/main

echo ""
echo "📦 Paso 2: Verificar archivos descargados..."
echo ""
echo "Archivos HTML:"
ls -la *.html 2>/dev/null || echo "❌ No hay archivos HTML"
echo ""
echo "Archivos JS:"
ls -la *.js 2>/dev/null | head -10
echo ""
echo "Scripts:"
ls -la *.sh 2>/dev/null

echo ""
echo "📦 Paso 3: Crear test-direct.html si no existe..."
if [ ! -f "test-direct.html" ]; then
    echo "⚠️ Creando test-direct.html..."
    cat > test-direct.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CLAWDESK TEST</title>
    <style>
        body { background: #1a1a1a; color: white; font-family: -apple-system, sans-serif; padding: 40px; }
        h1 { color: #3b82f6; text-align: center; }
        button { background: #3b82f6; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; margin: 10px; }
        .logs { background: #2d2d2d; padding: 20px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>🤖 CLAWDESK TEST</h1>
    <p>Versión de prueba HTML directo</p>
    
    <button onclick="test()">🚀 Probar Agente</button>
    <button onclick="addLog('ℹ️', 'Botón de información')">ℹ️ Info</button>
    
    <div class="logs" id="logs">
        <div>✅ CLAWDESK cargado</div>
    </div>
    
    <script>
        function test() {
            const logs = document.getElementById('logs');
            logs.innerHTML += '<div>🎯 Iniciando agente...</div>';
            logs.innerHTML += '<div>🧠 IA pensando...</div>';
            logs.innerHTML += '<div>⚡ Ejecutando acciones...</div>';
            logs.innerHTML += '<div>✅ ¡Tarea completada!</div>';
        }
        
        function addLog(emoji, message) {
            const logs = document.getElementById('logs');
            logs.innerHTML += \`<div>\${emoji} \${message}</div>\`;
        }
    </script>
</body>
</html>
HTML
    echo "✅ test-direct.html creado"
fi

echo ""
echo "📦 Paso 4: Dar permisos de ejecución..."
chmod +x *.sh 2>/dev/null || echo "⚠️ No hay scripts .sh"

echo ""
echo "🎯 ¡LISTO!"
echo ""
echo "🚀 PARA PROBAR:"
echo "   open test-direct.html"
echo ""
echo "🔧 SI SIGUE FALLANDO:"
echo "   1. Verifica conexión a internet"
echo "   2. Ejecuta: git status"
echo "   3. Contacta si hay errores de git"