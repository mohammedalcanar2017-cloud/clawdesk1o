import React, { useState } from 'react'
import { Send, Shield, Settings, Zap } from 'lucide-react'

function App() {
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>(['CLAWDESK Ultimate started'])

  const handleSend = () => {
    if (!message.trim()) return
    
    const newLog = `You: ${message}`
    setLogs(prev => [...prev, newLog])
    setMessage('')
    
    // Simulate AI response
    setTimeout(() => {
      setLogs(prev => [...prev, 'AI: Command received and processed'])
    }, 500)
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
              <p className="text-sm text-gray-400">AI Desktop Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              <Shield className="w-4 h-4" />
              <span>Safe Mode: ON</span>
            </button>
            
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
                  <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
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
                  placeholder="Type a command (e.g., 'Click at 500,300', 'Take screenshot')"
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
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {['Capture Screen', 'Mouse Click', 'Type Text', 'Open App', 'Get Info'].map((action) => (
                  <button
                    key={action}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Connection</span>
                  <span className="text-green-400">✅ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Screen Access</span>
                  <span className="text-green-400">✅ Granted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Input Control</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 p-4 text-center text-gray-500 text-sm">
        CLAWDESK Ultimate • AI Desktop Assistant • v1.0.0
      </footer>
    </div>
  )
}

export default App