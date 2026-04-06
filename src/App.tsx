import React, { useState, useEffect } from 'react'
import { Send, Shield, Settings, Zap, MousePointer, Keyboard, Camera, AlertCircle } from 'lucide-react'

// Declarar tipos para window.clawdeskAPI
declare global {
  interface Window {
    clawdeskAPI: {
      getScreenInfo: () => Promise<{ width: number; height: number; scaleFactor: number }>
      captureScreen: (options?: any) => Promise<string>
      mouseClick: (x: number, y: number, button?: string) => Promise<{ success: boolean }>
      getMousePosition: () => Promise<{ x: number; y: number }>
      keyboardType: (text: string) => Promise<{ success: boolean }>
      keyboardPress: (key: string) => Promise<{ success: boolean }>
      showDialog: (options: any) => Promise<any>
      on: (channel: string, callback: Function) => void
      off: (channel: string, callback: Function) => void
    }
    environment: {
      platform: string
      isDev: boolean
      version: string
    }
  }
}

function App() {
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>(['CLAWDESK Ultimate started (Electron)'])
  const [safeMode, setSafeMode] = useState(true)
  const [screenInfo, setScreenInfo] = useState<{ width: number; height: number } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Obtener información de pantalla al iniciar
  useEffect(() => {
    const init = async () => {
      try {
        const info = await window.clawdeskAPI.getScreenInfo()
        setScreenInfo(info)
        addLog(`Screen: ${info.width}x${info.height}`)
        
        // Actualizar posición del mouse periódicamente
        const updateMousePos = async () => {
          const pos = await window.clawdeskAPI.getMousePosition()
          setMousePos(pos)
        }
        setInterval(updateMousePos, 1000)
      } catch (error) {
        addLog(`Error: ${error}`)
      }
    }
    init()
  }, [])

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`])
  }

  const handleSend = async () => {
    if (!message.trim()) return
    
    const userMessage = `You: ${message}`
    addLog(userMessage)
    setMessage('')
    
    try {
      // Parsear comandos simples
      const cmd = message.toLowerCase().trim()
      
      if (cmd.includes('click') || cmd.includes('clic')) {
        // Ejemplo: "click at 500,300"
        const coords = cmd.match(/(\d+)[, ]+(\d+)/)
        if (coords) {
          const x = parseInt(coords[1])
          const y = parseInt(coords[2])
          
          if (safeMode) {
            const confirm = await window.clawdeskAPI.showDialog({
              type: 'question',
              title: 'Safe Mode Confirmation',
              message: `Click at position (${x}, ${y})?`,
              buttons: ['Cancel', 'Confirm']
            })
            
            if (confirm.response === 1) {
              const result = await window.clawdeskAPI.mouseClick(x, y)
              addLog(`AI: Clicked at (${x}, ${y}) - ${result.success ? 'Success' : 'Failed'}`)
            } else {
              addLog('AI: Click cancelled by Safe Mode')
            }
          } else {
            const result = await window.clawdeskAPI.mouseClick(x, y)
            addLog(`AI: Clicked at (${x}, ${y}) - ${result.success ? 'Success' : 'Failed'}`)
          }
        }
      } else if (cmd.includes('screenshot') || cmd.includes('capture')) {
        addLog('AI: Capturing screen...')
        const screenshot = await window.clawdeskAPI.captureScreen()
        addLog(`AI: Screenshot captured (${screenshot.length} bytes)`)
      } else if (cmd.includes('type ') || cmd.includes('write ')) {
        const text = message.substring(message.indexOf(' ') + 1)
        if (safeMode && text.length > 10) {
          const confirm = await window.clawdeskAPI.showDialog({
            type: 'question',
            title: 'Safe Mode Confirmation',
            message: `Type "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"?`,
            buttons: ['Cancel', 'Confirm']
          })
          
          if (confirm.response === 1) {
            const result = await window.clawdeskAPI.keyboardType(text)
            addLog(`AI: Typed text - ${result.success ? 'Success' : 'Failed'}`)
          } else {
            addLog('AI: Typing cancelled by Safe Mode')
          }
        } else {
          const result = await window.clawdeskAPI.keyboardType(text)
          addLog(`AI: Typed text - ${result.success ? 'Success' : 'Failed'}`)
        }
      } else {
        addLog(`AI: Command "${cmd}" received`)
      }
    } catch (error) {
      addLog(`AI Error: ${error}`)
    }
  }

  const quickAction = async (action: string) => {
    addLog(`Quick action: ${action}`)
    
    switch (action) {
      case 'Capture Screen':
        const screenshot = await window.clawdeskAPI.captureScreen()
        addLog(`Screenshot captured (${screenshot.length} bytes)`)
        break
      case 'Mouse Click':
        if (screenInfo) {
          const x = Math.floor(screenInfo.width / 2)
          const y = Math.floor(screenInfo.height / 2)
          await window.clawdeskAPI.mouseClick(x, y)
          addLog(`Clicked center (${x}, ${y})`)
        }
        break
      case 'Type Text':
        await window.clawdeskAPI.keyboardType('Hello from CLAWDESK!')
        addLog('Typed: Hello from CLAWDESK!')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CLAWDESK Ultimate</h1>
              <p className="text-sm text-gray-400">Electron v{window.environment?.version || '1.0.0'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSafeMode(!safeMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${safeMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Shield className="w-4 h-4" />
              <span>Safe Mode: {safeMode ? 'ON' : 'OFF'}</span>
            </button>
            
            <div className="text-sm text-gray-400">
              Mouse: {mousePos.x}, {mousePos.y}
            </div>
            
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-3 gap-6">
          {/* Chat Panel */}
          <div className="col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="p-3 bg-gray-700/50 rounded-lg font-mono text-sm">
                    {log}
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a command (e.g., 'click at 500,300', 'type Hello World', 'screenshot')"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <button
                  onClick={handleSend}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                {['Capture Screen', 'Mouse Click', 'Type Text', 'Get Mouse Pos', 'Test Dialog'].map((action) => (
                  <button
                    key={action}
                    onClick={() => quickAction(action)}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center"
                  >
                    {action === 'Capture Screen' && <Camera className="w-4 h-4 mr-2" />}
                    {action === 'Mouse Click' && <MousePointer className="w-4 h-4 mr-2" />}
                    {action === 'Type Text' && <Keyboard className="w-4 h-4 mr-2" />}
                    {action === 'Test Dialog' && <AlertCircle className="w-4 h-4 mr-2" />}
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-blue-400">{window.environment?.platform || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Screen</span>
                  <span className="text-green-400">
                    {screenInfo ? `${screenInfo.width}x${screenInfo.height}` : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Safe Mode</span>
                  <span className={safeMode ? 'text-green-400' : 'text-yellow-400'}>
                    {safeMode ? '✅ ON' : '⚠️ OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Electron API</span>
                  <span className="text-green-400">✅ Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 p-4 text-center text-gray-500 text-sm">
        CLAWDESK Ultimate • Electron Desktop Assistant • v{window.environment?.version || '1.0.0'}
      </footer>
    </div>
  )
}

export default App