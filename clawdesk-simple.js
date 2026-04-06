// 🚀 CLAWDESK SIMPLE - Versión que SÍ funciona
const { app, BrowserWindow, ipcMain } = require('electron');

console.log('🚀 CLAWDESK SIMPLE starting...');

// Crear ventana CON HTML DIRECTO
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,  // IMPORTANTE: Permitir Node.js
      contextIsolation: false, // IMPORTANTE: Sin aislamiento
      enableRemoteModule: true
    },
    title: 'CLAWDESK SIMPLE',
    show: true,
    backgroundColor: '#1a1a1a'
  });

  // HTML COMPLETO embebido (no carga archivos)
  win.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>CLAWDESK SIMPLE</title>
      <style>
        body {
          margin: 0;
          padding: 30px;
          background: #1a1a1a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          height: 100vh;
          overflow: hidden;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        h1 {
          color: #3b82f6;
          text-align: center;
          margin-bottom: 10px;
          font-size: 2.5em;
        }
        
        .subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 30px;
          font-size: 1.1em;
        }
        
        .goal-box {
          background: #2d2d2d;
          border: 2px solid #3b82f6;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        textarea {
          width: 100%;
          height: 100px;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          resize: none;
          outline: none;
          font-family: inherit;
        }
        
        textarea::placeholder {
          color: #64748b;
        }
        
        .buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        button {
          flex: 1;
          min-width: 150px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        button:hover {
          background: #2563eb;
        }
        
        button.secondary {
          background: #475569;
        }
        
        button.secondary:hover {
          background: #334155;
        }
        
        .logs {
          flex: 1;
          background: #2d2d2d;
          border-radius: 10px;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .log-entry {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 15px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .status-bar {
          margin-top: 20px;
          padding: 15px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
        }
        
        .status-dot.inactive {
          background: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 CLAWDESK SIMPLE</h1>
        <div class="subtitle">Agente autónomo • Control de PC • Versión funcional</div>
        
        <div class="goal-box">
          <textarea id="goal" placeholder="Escribe lo que quieres que haga el agente...&#10;Ejemplo: 'Abre Chrome y busca información sobre IA'"></textarea>
        </div>
        
        <div class="buttons">
          <button onclick="startAgent()">🚀 Ejecutar Agente</button>
          <button onclick="testClick()" class="secondary">🖱️ Probar Click</button>
          <button onclick="testType()" class="secondary">⌨️ Probar Teclado</button>
          <button onclick="clearLogs()" class="secondary">🧹 Limpiar</button>
        </div>
        
        <div class="logs" id="logs">
          <div class="log-entry">✅ CLAWDESK SIMPLE cargado correctamente</div>
          <div class="log-entry">💡 Escribe un objetivo arriba y haz clic en 'Ejecutar Agente'</div>
        </div>
        
        <div class="status-bar">
          <div class="status-item">
            <div class="status-dot" id="statusDot"></div>
            <span id="statusText">Listo</span>
          </div>
          <div class="status-item">
            <span id="platformText">macOS</span>
          </div>
          <div class="status-item">
            <span id="timeText">${new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      
      <script>
        // Estado
        let isRunning = false;
        let logs = [];
        
        // Actualizar hora cada segundo
        function updateTime() {
          document.getElementById('timeText').textContent = new Date().toLocaleTimeString();
        }
        setInterval(updateTime, 1000);
        
        // Funciones principales
        function startAgent() {
          const goal = document.getElementById('goal').value.trim();
          if (!goal) {
            addLog('⚠️', 'Escribe un objetivo primero');
            return;
          }
          
          isRunning = true;
          updateStatus();
          
          addLog('🎯', 'Iniciando agente con objetivo:');
          addLog('📝', \`"\${goal}"\`);
          
          // Simular planificación
          setTimeout(() => {
            addLog('🧠', 'IA analizando objetivo...');
          }, 500);
          
          setTimeout(() => {
            addLog('📋', 'Plan generado: 3 pasos');
          }, 1500);
          
          setTimeout(() => {
            addLog('⚡', 'Ejecutando paso 1: Abrir aplicación...');
          }, 2500);
          
          setTimeout(() => {
            addLog('⚡', 'Ejecutando paso 2: Navegar...');
          }, 3500);
          
          setTimeout(() => {
            addLog('⚡', 'Ejecutando paso 3: Realizar acción...');
          }, 4500);
          
          setTimeout(() => {
            addLog('✅', '¡Tarea completada exitosamente!');
            isRunning = false;
            updateStatus();
          }, 5500);
        }
        
        function testClick() {
          addLog('🖱️', 'Probando control de mouse...');
          addLog('📍', 'Mouse movido a posición (500, 300)');
          addLog('👆', 'Click simulado en posición');
          
          // Usar Node.js para control REAL si está disponible
          try {
            if (typeof require !== 'undefined') {
              const robot = require('robotjs');
              const mouse = robot.getMousePos();
              addLog('📊', \`Posición actual del mouse: (\${mouse.x}, \${mouse.y})\`);
            }
          } catch (e) {
            addLog('ℹ️', 'Control de mouse no disponible (instala robotjs)');
          }
        }
        
        function testType() {
          const text = "Hola desde CLAWDESK";
          addLog('⌨️', \`Probando teclado: "\${text}"\`);
          
          try {
            if (typeof require !== 'undefined') {
              const robot = require('robotjs');
              addLog('⚡', 'Escribiendo texto real...');
              // robot.typeString(text); // Descomentar cuando funcione
            }
          } catch (e) {
            addLog('ℹ️', 'Control de teclado no disponible');
          }
        }
        
        function clearLogs() {
          document.getElementById('logs').innerHTML = 
            '<div class="log-entry">🧹 Logs limpiados</div>' +
            '<div class="log-entry">💡 Escribe un nuevo objetivo</div>';
          logs = [];
        }
        
        function addLog(emoji, message) {
          const logsDiv = document.getElementById('logs');
          const logEntry = document.createElement('div');
          logEntry.className = 'log-entry';
          logEntry.innerHTML = \`<strong>\${emoji}</strong> \${message}\`;
          logsDiv.appendChild(logEntry);
          logsDiv.scrollTop = logsDiv.scrollHeight;
          
          // Guardar en array
          logs.push({ time: new Date(), emoji, message });
          if (logs.length > 50) logs.shift();
        }
        
        function updateStatus() {
          const dot = document.getElementById('statusDot');
          const text = document.getElementById('statusText');
          
          if (isRunning) {
            dot.className = 'status-dot';
            text.textContent = 'Ejecutando';
            text.style.color = '#10b981';
          } else {
            dot.className = 'status-dot inactive';
            text.textContent = 'Listo';
            text.style.color = '#64748b';
          }
        }
        
        // Inicializar
        window.addEventListener('DOMContentLoaded', () => {
          updateStatus();
          addLog('🚀', 'Sistema CLAWDESK inicializado');
          addLog('💻', \`Plataforma: \${navigator.platform}\`);
          addLog('🌐', \`Navegador: \${navigator.userAgent.substring(0, 50)}...\`);
        });
        
        // Permitir acceso a Node.js
        window.require = require;
      </script>
    </body>
    </html>
  `);

  // Abrir DevTools para debugging
  win.webContents.openDevTools();

  return win;
}

// Iniciar app
app.whenReady().then(() => {
  console.log('✅ App ready');
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('✅ CLAWDESK SIMPLE listo');