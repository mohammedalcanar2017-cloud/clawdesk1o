#!/bin/bash
# 🚀 EJECUTAR CLAWDESK DIRECTAMENTE (sin build)

echo "🦾 CLAWDESK REAL - Ejecución Directa"
echo "===================================="

echo "📦 Paso 1: Instalar dependencias básicas..."
npm install robotjs@0.6.0 screenshot-desktop@1.15.0 axios@1.6.0

echo ""
echo "📦 Paso 2: Instalar dependencias opcionales (pueden fallar)..."
npm install opencv4nodejs@5.6.0 2>/dev/null || echo "⚠️ opencv4nodejs no instalado (modo básico)"
npm install tesseract.js@5.1.0 2>/dev/null || echo "⚠️ tesseract.js no instalado (modo básico)"

echo ""
echo "📦 Paso 3: Construir frontend mínimo..."
npm run build 2>/dev/null || {
    echo "⚠️ Build falló, creando HTML básico..."
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CLAWDESK REAL</title>
    <style>
        body { background: #1a1a1a; color: white; font-family: -apple-system, sans-serif; padding: 40px; }
        h1 { color: #3b82f6; }
        textarea { width: 100%; height: 100px; background: #2d2d2d; color: white; border: 1px solid #444; padding: 10px; }
        button { background: #3b82f6; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; margin: 10px 5px; }
        .logs { background: #2d2d2d; padding: 20px; border-radius: 8px; margin-top: 20px; height: 300px; overflow-y: auto; }
    </style>
</head>
<body>
    <h1>🤖 CLAWDESK REAL - Agente Autónomo</h1>
    <p>Escribe un objetivo complejo y el agente lo ejecutará automáticamente:</p>
    
    <textarea id="goal" placeholder="Ej: 'Configura mi correo en Outlook' o 'Abre Chrome y busca vuelos baratos'"></textarea>
    
    <div>
        <button onclick="startAgent()">🚀 Ejecutar Agente</button>
        <button onclick="stopAgent()">⏹️ Detener</button>
        <button onclick="getStatus()">📊 Estado</button>
    </div>
    
    <div class="logs" id="logs">
        <div>📋 Logs aparecerán aquí...</div>
    </div>
    
    <script>
        async function startAgent() {
            const goal = document.getElementById('goal').value;
            if (!goal) return alert('Escribe un objetivo');
            
            addLog('🎯', `Iniciando: "${goal}"`);
            
            try {
                const result = await window.clawdeskAgent.startAgent(goal);
                addLog('✅', `Agente iniciado: ${result.taskId}`);
                
                // Monitorear progreso
                monitorAgent();
            } catch (error) {
                addLog('❌', `Error: ${error}`);
            }
        }
        
        async function stopAgent() {
            try {
                await window.clawdeskAgent.stopAgent();
                addLog('⏹️', 'Agente detenido');
            } catch (error) {
                addLog('❌', `Error deteniendo: ${error}`);
            }
        }
        
        async function getStatus() {
            try {
                const status = await window.clawdeskAgent.getAgentStatus();
                addLog('📊', `Estado: ${status.status.currentTask?.status || 'inactivo'}`);
                addLog('📊', `Logs: ${status.status.logs?.length || 0} registros`);
            } catch (error) {
                addLog('❌', `Error obteniendo estado: ${error}`);
            }
        }
        
        async function monitorAgent() {
            setInterval(async () => {
                try {
                    const status = await window.clawdeskAgent.getAgentStatus();
                    if (status.status.currentTask?.status === 'completed') {
                        addLog('🏁', '¡Tarea completada!');
                    }
                } catch (error) {
                    // Ignorar errores de polling
                }
            }, 2000);
        }
        
        function addLog(emoji, message) {
            const logs = document.getElementById('logs');
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<strong>${emoji}</strong> ${message}`;
            logs.appendChild(logEntry);
            logs.scrollTop = logs.scrollHeight;
        }
    </script>
</body>
</html>
EOF
}

echo ""
echo "🚀 Paso 4: Ejecutar Electron..."
echo ""
echo "📱 La app se abrirá en 3 segundos..."
echo "   - Interfaz completa de CLAWDESK REAL"
echo "   - Puedes probar objetivos complejos"
echo "   - Verás logs en tiempo real"
echo ""
echo "💡 Ejemplos para probar:"
echo "   1. 'Abre Chrome'"
echo "   2. 'Captura pantalla y analiza'"
echo "   3. 'Mueve el mouse a la esquina'"
echo ""

sleep 3

# Ejecutar
npx electron main-real-complete.js --enable-logging

echo ""
echo "🔧 Si hay errores:"
echo "   1. Permisos: System Preferences → Security → Accessibility"
echo "   2. API key: export DEEPSEEK_API_KEY=tu_key"
echo "   3. Dependencias: npm install robotjs@0.6.0"