// ⚡ TEST ELECTRON QUICK - Prueba rápida sin complicaciones
const { app, BrowserWindow } = require('electron');

console.log('⚡ TEST ELECTRON QUICK starting...');

// Configuración MÍNIMA pero FUNCIONAL
const win = new BrowserWindow({
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  show: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true
  }
});

// HTML SUPER SIMPLE pero VISIBLE
win.loadURL(`data:text/html;charset=utf-8,
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #1a1a1a;
        color: white;
        font-family: -apple-system, sans-serif;
        text-align: center;
      }
      h1 {
        color: #3b82f6;
        font-size: 3em;
        margin-bottom: 20px;
      }
      .box {
        background: #2d2d2d;
        border: 3px solid #3b82f6;
        border-radius: 15px;
        padding: 30px;
        margin: 20px auto;
        max-width: 600px;
      }
      button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 18px;
        cursor: pointer;
        margin: 10px;
      }
      .status {
        margin-top: 30px;
        padding: 15px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 10px;
      }
    </style>
  </head>
  <body>
    <h1>✅ ELECTRON FUNCIONA</h1>
    
    <div class="box">
      <p>Si ves esto, Electron está funcionando correctamente.</p>
      <p>Node.js integration: <span id="nodeStatus">Comprobando...</span></p>
      <p>Plataforma: <span id="platform"></span></p>
      
      <button onclick="testNode()">Probar Node.js</button>
      <button onclick="testRequire()">Probar require()</button>
      <button onclick="showInfo()">Mostrar Info</button>
    </div>
    
    <div class="status" id="status">
      Estado: Cargado correctamente
    </div>
    
    <script>
      // Verificar Node.js inmediatamente
      document.getElementById('platform').textContent = navigator.platform;
      
      function testNode() {
        try {
          const fs = require('fs');
          const path = require('path');
          document.getElementById('nodeStatus').textContent = '✅ ACTIVADO';
          document.getElementById('nodeStatus').style.color = '#10b981';
          document.getElementById('status').innerHTML = 
            '✅ Node.js funciona. Módulos cargados: fs, path';
        } catch (e) {
          document.getElementById('nodeStatus').textContent = '❌ DESACTIVADO';
          document.getElementById('nodeStatus').style.color = '#ef4444';
          document.getElementById('status').innerHTML = 
            '❌ Node.js no disponible: ' + e.message;
        }
      }
      
      function testRequire() {
        try {
          const os = require('os');
          document.getElementById('status').innerHTML = 
            \`✅ require() funciona<br>
               Sistema: \${os.platform()} \${os.arch()}<br>
               CPUs: \${os.cpus().length} núcleos<br>
               Memoria: \${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB\`;
        } catch (e) {
          document.getElementById('status').innerHTML = 
            '❌ require() falló: ' + e.message;
        }
      }
      
      function showInfo() {
        document.getElementById('status').innerHTML = 
          \`📊 Información del sistema:<br>
             User Agent: \${navigator.userAgent}<br>
             Pantalla: \${screen.width}x\${screen.height}<br>
             Online: \${navigator.onLine ? 'Sí' : 'No'}<br>
             Electron: \${typeof process !== 'undefined' ? process.versions.electron || 'No' : 'No'}\`;
      }
      
      // Probar automáticamente
      setTimeout(testNode, 500);
    </script>
  </body>
  </html>
`);

// Abrir DevTools
win.webContents.openDevTools();

// Log
console.log('✅ Ventana creada. Debería ser visible.');

// Mantener app abierta
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});