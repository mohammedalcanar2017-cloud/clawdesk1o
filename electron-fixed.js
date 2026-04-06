        }
        
        // Utilidades
        function addLog(emoji, message) {
            const terminal = document.getElementById('terminal');
            const line = document.createElement('div');
            line.className = 'terminal-line output';
            line.innerHTML = \`<strong>\${emoji}</strong> \${message}\`;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            
            systemState.logs.push({ time: new Date(), emoji, message });
            if (systemState.logs.length > 100) systemState.logs.shift();
        }
        
        function updateStatus() {
            const dot = document.getElementById('systemDot');
            const status = document.getElementById('systemStatus');
            
            if (systemState.agentActive) {
                dot.className = 'status-dot';
                status.textContent = 'Agente ejecutando';
                status.style.color = '#10b981';
            } else {
                dot.className = 'status-dot inactive';
                status.textContent = 'Sistema operativo';
                status.style.color = '#94a3b8';
            }
        }
        
        function updateTime() {
            document.getElementById('timeDisplay').textContent = 
                new Date().toLocaleTimeString('es-ES', { hour12: false });
        }
        
        // Inicialización
        window.addEventListener('DOMContentLoaded', () => {
            // Verificar Node.js
            const nodeOk = checkNodeIntegration();
            
            // Actualizar versión de Electron
            if (typeof process !== 'undefined' && process.versions.electron) {
                document.getElementById('electronVersion').textContent = process.versions.electron;
                document.getElementById('electronVersion').className = 'success';
            }
            
            // Actualizar hora
            updateTime();
            setInterval(updateTime, 1000);
            
            // Actualizar estado
            updateStatus();
            
            // Mensaje de bienvenida
            if (nodeOk) {
                addLog('🎉', '¡ELECTRON FIXED FUNCIONANDO CORRECTAMENTE!');
                addLog('🚀', 'Puedes probar todas las funcionalidades');
                addLog('💡', 'Los botones usan Node.js REAL cuando está disponible');
            } else {
                addLog('⚠️', 'Electron con configuración limitada');
                addLog('🔧', 'Algunas funcionalidades pueden no estar disponibles');
                addLog('💡', 'Revisa la configuración de webPreferences');
            }
            
            addLog('📋', 'Usa los botones para probar el sistema');
        });
        
        // Hacer require disponible globalmente
        window.require = require;
        window.process = process;
    </script>
</body>
</html>
`;

// Crear ventana
function createWindow() {
  console.log('🖥️ Creando ventana con config:', config);
  
  const win = new BrowserWindow(config);
  
  // Cargar HTML DIRECTAMENTE desde string
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HTML_CONTENT)}`);
  
  // Abrir DevTools para debugging
  win.webContents.openDevTools();
  
  // Eventos de carga
  win.webContents.on('did-finish-load', () => {
    console.log('✅ Ventana cargada correctamente');
    win.setTitle('CLAWDESK FIXED - Funcionando');
  });
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error cargando ventana:', errorCode, errorDescription);
    win.loadURL(`data:text/html;charset=utf-8,<h1 style="color:white;background:#1a1a1a;padding:40px;">Error: ${errorDescription}</h1>`);
  });
  
  return win;
}

// Manejar IPC
ipcMain.handle('test-connection', () => {
  return { success: true, message: 'Electron FIXED funcionando' };
});

// Iniciar app
app.whenReady().then(() => {
  console.log('✅ App ready - Creando ventana...');
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

// Log de inicio
console.log('✅ electron-fixed.js cargado');
console.log('📋 Configuración usada:');
console.log('   • nodeIntegration: true');
console.log('   • contextIsolation: false');
console.log('   • enableRemoteModule: true');
console.log('   • HTML embebido (no carga archivos)');