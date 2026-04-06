#!/bin/bash
# Ejecutar CLAWDESK AHORA MISMO (solución inmediata)

echo "🚀 CLAWDESK EJECUCIÓN INMEDIATA"
echo "================================"

echo "📦 Paso 1: Usar versión FIXED (sin axios requerido)..."
cp main-fixed.js main.js
cp preload-minimal.js preload.js

echo "📦 Paso 2: Verificar dist/index.html..."
if [ ! -f "dist/index.html" ]; then
    echo "⚠️ Construyendo frontend..."
    npm run build 2>/dev/null || npx vite build 2>/dev/null || {
        echo "❌ Build falló, creando index.html básico..."
        mkdir -p dist
        cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CLAWDESK AGENT</title>
    <style>
        body { background: #1a1a1a; color: white; font-family: -apple-system, sans-serif; padding: 40px; }
        h1 { color: #3b82f6; }
        button { background: #3b82f6; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>✅ CLAWDESK AGENT Funcionando</h1>
    <p>Versión mínima cargada correctamente.</p>
    <button onclick="testAgent()">Probar Agente</button>
    <div id="logs" style="margin-top: 20px; background: #2d2d2d; padding: 20px; border-radius: 8px;"></div>
    <script>
        async function testAgent() {
            const logs = document.getElementById('logs');
            logs.innerHTML += '<div>🎯 Probando agente...</div>';
            
            try {
                const result = await window.clawdeskAgent.startAgent('Abrir Chrome');
                logs.innerHTML += `<div>✅ Agente iniciado: ${result.taskId}</div>`;
                
                const state = await window.clawdeskAgent.getAgentState();
                logs.innerHTML += `<div>📊 Estado: ${state.logs.length} logs</div>`;
                
                const actions = await window.clawdeskAgent.getAvailableActions();
                logs.innerHTML += `<div>🛠️ Acciones: ${actions.length} disponibles</div>`;
                
            } catch (error) {
                logs.innerHTML += `<div>❌ Error: ${error}</div>`;
            }
        }
    </script>
</body>
</html>
EOF
    }
fi

echo "📦 Paso 3: Ejecutar Electron..."
echo ""
echo "🎯 La app se abrirá en 3 segundos..."
echo "   - DevTools estará abierto"
echo "   - Verás la interfaz CLAWDESK"
echo "   - Puedes escribir objetivos y probar"
echo ""

sleep 3

# Ejecutar
npx electron . --enable-logging 2>&1 | grep -v "Downloading" | grep -v "Installing" | head -50

echo ""
echo "💡 Si ves la app funcionando:"
echo "   1. Escribe un objetivo en el campo grande"
echo "   2. Haz clic en 'Ejecutar Agente'"
echo "   3. Observa los logs en tiempo real"
echo ""
echo "🔧 Si hay errores, ejecuta:"
echo "   ./fix-axios.sh"