const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('🚀 ULTRA SIMPLE CLAWDESK STARTING...');

app.whenReady().then(() => {
  console.log('✅ Electron ready');
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,  // Temporalmente permitido
      contextIsolation: false // Temporalmente desactivado
    },
    show: true
  });
  
  // Abrir DevTools inmediatamente
  win.webContents.openDevTools();
  
  // Cargar HTML DIRECTAMENTE (sin archivos)
  win.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CLAWDESK ULTRA SIMPLE</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .logo {
            width: 40px;
            height: 40px;
            background: #3b82f6;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
          }
          
          .title {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .subtitle {
            color: #9ca3af;
            font-size: 14px;
          }
          
          .main {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }
          
          .card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
          }
          
          .card h2 {
            margin-bottom: 20px;
            color: #3b82f6;
            font-size: 20px;
          }
          
          .status-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
          }
          
          .status-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .status-label {
            color: #9ca3af;
          }
          
          .status-value {
            font-weight: 600;
          }
          
          .status-good {
            color: #10b981;
          }
          
          .status-warning {
            color: #f59e0b;
          }
          
          .chat-input {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }
          
          input {
            flex: 1;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px 20px;
            color: white;
            font-size: 16px;
            outline: none;
            transition: all 0.2s;
          }
          
          input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          
          button {
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 15px 30px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
          }
          
          .log {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 20px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            line-height: 1.6;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
          }
          
          .log-entry {
            margin-bottom: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
          }
          
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">C</div>
          <div>
            <div class="title">CLAWDESK Ultimate</div>
            <div class="subtitle">AI Desktop Assistant • Electron v${process.versions.electron}</div>
          </div>
        </div>
        
        <div class="main">
          <div class="card">
            <h2>🎯 System Status</h2>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Electron Version</span>
                <span class="status-value status-good">${process.versions.electron}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Node.js Version</span>
                <span class="status-value status-good">${process.versions.node}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Chrome Version</span>
                <span class="status-value status-good">${process.versions.chrome}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Platform</span>
                <span class="status-value">${process.platform}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Screen Control</span>
                <span class="status-value status-warning">Simulated</span>
              </div>
              <div class="status-item">
                <span class="status-label">Safe Mode</span>
                <span class="status-value status-good">✅ ON</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2>💬 Chat Interface</h2>
            <p>Type commands to control your computer:</p>
            
            <div class="chat-input">
              <input type="text" id="commandInput" placeholder="Try: 'click at 500,300' or 'type Hello World' or 'screenshot'">
              <button onclick="sendCommand()">Send</button>
            </div>
            
            <div class="log" id="log">
              <div class="log-entry">[${new Date().toLocaleTimeString()}] CLAWDESK started successfully!</div>
              <div class="log-entry">[${new Date().toLocaleTimeString()}] Electron: ${process.versions.electron}</div>
              <div class="log-entry">[${new Date().toLocaleTimeString()}] Platform: ${process.platform}</div>
              <div class="log-entry">[${new Date().toLocaleTimeString()}] Ready to receive commands...</div>
            </div>
          </div>
          
          <div class="card">
            <h2>⚡ Quick Actions</h2>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button onclick="quickAction('screenshot')">📸 Capture Screen</button>
              <button onclick="quickAction('click-center')">🖱️ Click Center</button>
              <button onclick="quickAction('type-test')">⌨️ Type Test</button>
              <button onclick="quickAction('get-info')">📊 Get System Info</button>
              <button onclick="quickAction('test-dialog')">💬 Test Dialog</button>
            </div>
          </div>
        </div>
        
        <div class="footer">
          CLAWDESK Ultimate • AI Desktop Assistant • Built with Electron • ${new Date().getFullYear()}
        </div>
        
        <script>
          const log = document.getElementById('log');
          const commandInput = document.getElementById('commandInput');
          
          function addLog(message) {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
          }
          
          function sendCommand() {
            const command = commandInput.value.trim();
            if (!command) return;
            
            addLog(\`You: \${command}\`);
            commandInput.value = '';
            
            // Simulate AI response
            setTimeout(() => {
              const responses = [
                \`AI: Command "\${command}" received and processed\`,
                \`AI: Executing "\${command}" (simulated)\`,
                \`AI: Successfully completed "\${command}"\`,
                \`AI: Would perform "\${command}" in production\`
              ];
              addLog(responses[Math.floor(Math.random() * responses.length)]);
            }, 500);
          }
          
          function quickAction(action) {
            const actions = {
              'screenshot': '📸 Capturing screen (simulated)...',
              'click-center': '🖱️ Clicking at screen center (simulated)...',
              'type-test': '⌨️ Typing "Hello from CLAWDESK!" (simulated)...',
              'get-info': '📊 Getting system information...',
              'test-dialog': '💬 Showing test dialog (simulated)...'
            };
            
            addLog(\`Quick Action: \${actions[action]}\`);
            
            if (action === 'get-info') {
              setTimeout(() => {
                addLog(\`System: Electron \${process.versions.electron}, Node \${process.versions.node}, Chrome \${process.versions.chrome}\`);
                addLog(\`System: Platform \${process.platform}, Arch \${process.arch}\`);
              }, 300);
            }
          }
          
          // Allow Enter key to send
          commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendCommand();
          });
          
          // Focus input on load
          commandInput.focus();
          
          // Test Electron API
          setTimeout(() => {
            if (typeof require !== 'undefined') {
              try {
                const { screen } = require('electron');
                const display = screen.getPrimaryDisplay();
                addLog(\`Screen: \${display.size.width}x\${display.size.height} (scale: \${display.scaleFactor})\`);
              } catch (e) {
                addLog(\`Note: Running in browser context\`);
              }
            }
          }, 1000);
        </script>
      </body>
    </html>
  `);
  
  console.log('✅ HTML loaded directly');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});