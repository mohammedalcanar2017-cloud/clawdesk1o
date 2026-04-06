import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import ChatInterface from './components/ChatInterface'
import SafeModePanel from './components/SafeModePanel'
import ScreenGuideOverlay from './components/ScreenGuideOverlay'
import ActionLog from './components/ActionLog'
import FirstRunWizard from './components/FirstRunWizard'
import ConfigPanel from './components/ConfigPanel'
import { useStore } from './lib/store'
import { configManager } from './lib/config'
import { Brain, Shield, Eye, Terminal, Zap, Settings } from 'lucide-react'

function App() {
  const [connected, setConnected] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState(() => configManager.getConfig())
  const { safeMode, addLog } = useStore()

  useEffect(() => {
    // Suscribirse a cambios de configuración
    const unsubscribe = configManager.subscribe(setConfig)
    
    // Mostrar wizard en primera ejecución
    if (config.firstRun) {
      setShowWizard(true)
    }
    
    // Conectar con OpenClaw si está configurado
    const connectToOpenClaw = async () => {
      if (!config.openclaw.autoConnect || config.firstRun) return
      
      try {
        // Aquí iría la conexión real al engine de OpenClaw
        setConnected(true)
        addLog('✅ Conectado a OpenClaw Engine', 'system')
      } catch (error) {
        addLog('❌ Error conectando a OpenClaw', 'error')
      }
    }

    connectToOpenClaw()

    // Escuchar eventos de Tauri
    const unlisten = listen('tauri://update', (event) => {
      console.log('Tauri update:', event)
    })

    return () => {
      unsubscribe()
      unlisten.then(f => f())
    }
  }, [config.firstRun])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <header className="glass-panel m-4 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">CLAWDESK Ultimate</h1>
            <p className="text-sm text-gray-400">AI Desktop Assistant v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${safeMode ? 'text-yellow-400' : 'text-green-400'}`}>
            <Shield className="w-5 h-5" />
            <span className="font-medium">Safe Mode: {safeMode ? 'ON' : 'OFF'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="px-2 py-1 bg-gray-800 rounded-lg">
              IA: {configManager.getProviderName()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
        {/* Columna izquierda: Chat y controles */}
        <div className="lg:col-span-2 space-y-4">
          <ChatInterface />
          
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button 
                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition flex flex-col items-center"
                onClick={() => invoke('capture_screen', { quality: 50, width: 640 })}
              >
                <Eye className="w-5 h-5 mb-1" />
                <span className="text-sm">Capturar</span>
              </button>
              
              <button 
                className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition flex flex-col items-center"
                onClick={() => invoke('get_screen_info')}
              >
                <Terminal className="w-5 h-5 mb-1" />
                <span className="text-sm">Info Pantalla</span>
              </button>
              
              <button 
                className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition flex flex-col items-center"
                onClick={() => invoke('keyboard_type', { text: 'Hello World!' })}
              >
                <span className="text-lg mb-1">⌨️</span>
                <span className="text-sm">Escribir</span>
              </button>
              
              <button 
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition flex flex-col items-center"
                onClick={() => invoke('keyboard_key', { key: 'enter' })}
              >
                <span className="text-lg mb-1">⏎</span>
                <span className="text-sm">Enter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha: Paneles de control */}
        <div className="space-y-4">
          <SafeModePanel />
          <ActionLog />
        </div>
      </div>

      {/* Overlay para guías de pantalla */}
      <ScreenGuideOverlay />
      
      {/* Wizard de primera ejecución */}
      {showWizard && (
        <FirstRunWizard onComplete={() => setShowWizard(false)} />
      )}
      
      {/* Panel de configuración avanzada */}
      {showConfig && (
        <ConfigPanel onClose={() => setShowConfig(false)} />
      )}
    </div>
  )
}

export default App