import React, { useState, useEffect, useRef } from 'react'
import { Send, Brain, Zap, Settings, Camera, MousePointer, Keyboard, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

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
    }
    environment: {
      platform: string
      isDev: boolean
      version: string
    }
  }
}

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  action?: {
    type: 'screenshot' | 'click' | 'type' | 'keypress' | 'info' | 'config'
    data?: any
    success?: boolean
  }
}

type AIConfig = {
  autoScreenshot: boolean
  autoMouseControl: boolean
  autoKeyboard: boolean
  safeMode: boolean
  aiModel: 'deepseek' | 'openai' | 'local'
  visionEnabled: boolean
}

function AppIntelligent() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy CLAWDESK. Puedo controlar tu ordenador por ti. Dime qué quieres hacer y yo decidiré las acciones necesarias.',
      sender: 'ai',
      timestamp: new Date(),
      action: { type: 'info', data: { message: 'System ready' } }
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [config, setConfig] = useState<AIConfig>({
    autoScreenshot: true,
    autoMouseControl: true,
    autoKeyboard: true,
    safeMode: true,
    aiModel: 'deepseek',
    visionEnabled: true
  })
  const [screenInfo, setScreenInfo] = useState<{ width: number; height: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Obtener información de pantalla al iniciar
  useEffect(() => {
    const init = async () => {
      try {
        const info = await window.clawdeskAPI.getScreenInfo()
        setScreenInfo(info)
        addAIMessage(`Pantalla detectada: ${info.width}x${info.height}. Listo para ayudarte.`)
      } catch (error) {
        addAIMessage(`Nota: Modo simulado activado. En producción tendría control completo.`)
      }
    }
    init()
  }, [])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (text: string, sender: 'user' | 'ai', action?: Message['action']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      action
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addAIMessage = (text: string, action?: Message['action']) => {
    addMessage(text, 'ai', action)
  }

  // IA Decision Engine - Decide qué acciones tomar basado en el comando
  const analyzeCommand = async (command: string): Promise<{
    actions: Array<{ type: string, data: any }>
    response: string
  }> => {
    const cmd = command.toLowerCase().trim()
    const actions: Array<{ type: string, data: any }> = []
    let response = ''

    // Análisis de intención
    if (cmd.includes('captura') || cmd.includes('pantalla') || cmd.includes('screenshot') || 
        cmd.includes('foto') || cmd.includes('imagen')) {
      
      if (config.autoScreenshot) {
        actions.push({ type: 'screenshot', data: { reason: 'User requested screen capture' } })
        response = 'Tomaré una captura de pantalla para analizar la situación...'
      } else {
        response = 'La captura automática de pantalla está desactivada en configuración.'
      }
    }
    
    else if (cmd.includes('clic') || cmd.includes('click') || cmd.includes('haz clic') || 
             cmd.includes('pulsa') || cmd.includes('presiona')) {
      
      if (config.autoMouseControl) {
        // Extraer coordenadas si se mencionan
        const coords = cmd.match(/(\d+)[, ]+(\d+)/)
        let x = 500, y = 300
        
        if (coords) {
          x = parseInt(coords[1])
          y = parseInt(coords[2])
        } else if (screenInfo) {
          // Click al centro por defecto
          x = Math.floor(screenInfo.width / 2)
          y = Math.floor(screenInfo.height / 2)
        }
        
        actions.push({ type: 'click', data: { x, y, reason: 'User requested click' } })
        response = `Haré clic en la posición (${x}, ${y})...`
      } else {
        response = 'El control automático del ratón está desactivado en configuración.'
      }
    }
    
    else if (cmd.includes('escribe') || cmd.includes('type') || cmd.includes('teclea') || 
             cmd.includes('escribir') || cmd.includes('texto')) {
      
      if (config.autoKeyboard) {
        // Extraer texto a escribir
        const textMatch = cmd.match(/(?:escribe|type|teclea|escribir|texto)[: ]+(.+)/)
        const text = textMatch ? textMatch[1] : 'Texto de prueba desde CLAWDESK'
        
        actions.push({ type: 'type', data: { text, reason: 'User requested typing' } })
        response = `Escribiré: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
      } else {
        response = 'El control automático del teclado está desactivado en configuración.'
      }
    }
    
    else if (cmd.includes('config') || cmd.includes('ajustes') || cmd.includes('settings') || 
             cmd.includes('preferencias')) {
      
      actions.push({ type: 'config', data: { showConfig: true } })
      response = 'Mostrando panel de configuración...'
    }
    
    else if (cmd.includes('ayuda') || cmd.includes('help') || cmd.includes('qué puedes hacer')) {
      response = 'Puedo: capturar pantalla, hacer clics, escribir texto, presionar teclas, y más. Solo dime qué necesitas y yo decidiré las acciones.'
    }
    
    else {
      // Comando no reconocido - la IA decide si necesita más info
      if (config.visionEnabled && (cmd.includes('qué hay') || cmd.includes('qué ves') || 
          cmd.includes('analiza') || cmd.includes('revisa'))) {
        
        actions.push({ type: 'screenshot', data: { reason: 'AI needs visual context' } })
        response = 'Tomaré una captura para entender mejor la situación...'
      } else {
        response = 'Entendido. Si necesitas que realice alguna acción específica (captura, clic, escribir), dime exactamente qué quieres.'
      }
    }
    
    return { actions, response }
  }

  // Ejecutar acciones decididas por la IA
  const executeActions = async (actions: Array<{ type: string, data: any }>) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'screenshot':
            if (config.autoScreenshot) {
              addAIMessage('📸 Capturando pantalla...', { type: 'screenshot', data: action.data })
              const screenshot = await window.clawdeskAPI.captureScreen()
              addAIMessage('✅ Pantalla capturada. Analizando...', { 
                type: 'screenshot', 
                data: { ...action.data, success: true, size: screenshot.length },
                success: true 
              })
            }
            break
            
          case 'click':
            if (config.autoMouseControl) {
              const { x, y } = action.data
              addAIMessage(`🖱️ Haciendo clic en (${x}, ${y})...`, { type: 'click', data: action.data })
              
              if (config.safeMode) {
                const confirm = await window.clawdeskAPI.showDialog({
                  type: 'question',
                  title: 'Safe Mode Confirmation',
                  message: `¿Hacer clic en posición (${x}, ${y})?`,
                  buttons: ['Cancelar', 'Confirmar']
                })
                
                if (confirm.response === 1) {
                  const result = await window.clawdeskAPI.mouseClick(x, y)
                  addAIMessage(result.success ? '✅ Clic realizado' : '❌ Error en clic', {
                    type: 'click',
                    data: { ...action.data, success: result.success },
                    success: result.success
                  })
                } else {
                  addAIMessage('⏸️ Clic cancelado por Safe Mode', {
                    type: 'click',
                    data: { ...action.data, cancelled: true },
                    success: false
                  })
                }
              } else {
                const result = await window.clawdeskAPI.mouseClick(x, y)
                addAIMessage(result.success ? '✅ Clic realizado' : '❌ Error en clic', {
                  type: 'click',
                  data: { ...action.data, success: result.success },
                  success: result.success
                })
              }
            }
            break
            
          case 'type':
            if (config.autoKeyboard) {
              const { text } = action.data
              addAIMessage(`⌨️ Escribiendo texto...`, { type: 'type', data: action.data })
              
              if (config.safeMode && text.length > 20) {
                const confirm = await window.clawdeskAPI.showDialog({
                  type: 'question',
                  title: 'Safe Mode Confirmation',
                  message: `¿Escribir "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"?`,
                  buttons: ['Cancelar', 'Confirmar']
                })
                
                if (confirm.response === 1) {
                  const result = await window.clawdeskAPI.keyboardType(text)
                  addAIMessage(result.success ? '✅ Texto escrito' : '❌ Error al escribir', {
                    type: 'type',
                    data: { ...action.data, success: result.success },
                    success: result.success
                  })
                } else {
                  addAIMessage('⏸️ Escritura cancelada por Safe Mode', {
                    type: 'type',
                    data: { ...action.data, cancelled: true },
                    success: false
                  })
                }
              } else {
                const result = await window.clawdeskAPI.keyboardType(text)
                addAIMessage(result.success ? '✅ Texto escrito' : '❌ Error al escribir', {
                  type: 'type',
                  data: { ...action.data, success: result.success },
                  success: result.success
                })
              }
            }
            break
            
          case 'config':
            // Solo marca que se mostró configuración
            addAIMessage('⚙️ Mostrando configuración...', { type: 'config', data: action.data })
            break
        }
        
        // Pequeña pausa entre acciones
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        addAIMessage(`❌ Error ejecutando acción: ${error}`, {
          type: action.type,
          data: { ...action.data, error: error.toString() },
          success: false
        })
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return
    
    const userMessage = input.trim()
    setInput('')
    addMessage(userMessage, 'user')
    setIsProcessing(true)
    
    try {
      // Paso 1: IA analiza el comando y decide acciones
      const { actions, response } = await analyzeCommand(userMessage)
      
      // Paso 2: IA responde
      addAIMessage(response)
      
      // Paso 3: Ejecutar acciones decididas por la IA
      if (actions.length > 0) {
        await executeActions(actions)
      }
    } catch (error) {
      addAIMessage(`❌ Error procesando comando: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleConfig = () => {
    setConfig(prev => ({ ...prev })) // Forzar re-render
    addAIMessage('⚙️ Panel de configuración', { type: 'config', data: { showConfig: true } })
  }

  const updateConfig = (key: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    addAIMessage(`Configuración actualizada: ${key} = ${value}`, {
      type: 'config',
      data: { [key]: value }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      {/* Header minimalista */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CLAWDESK Intelligent
              </h1>
              <p className="text-sm text-gray-400">IA que controla tu ordenador</p>
            </div>
          </div>
          
          <button
            onClick={toggleConfig}
            className="p-2 hover:bg-white/5 rounded-lg transition group"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
          </button>
        </div>
      </header>

      {/* Config Panel (solo cuando se activa) */}
      {messages.some(m => m.action?.type === 'config' && m.action.data?.showConfig) && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración Inteligente
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Captura automática</div>
                  <div className="text-sm text-gray-400">IA decide cuándo tomar screenshots</div>
                </div>
                <button
                  onClick={() => updateConfig('autoScreenshot', !config.autoScreenshot)}
                  className={`w-12 h-6 rounded-full transition ${config.autoScreenshot ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.autoScreenshot ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Control ratón</div>
                  <div className="text-sm text-gray-400">IA puede hacer clics automáticamente</div>
                </div>
                <button
                  onClick={() => updateConfig('autoMouseControl', !config.autoMouseControl)}
                  className={`w-12 h-6 rounded-full transition ${config.autoMouseControl ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.autoMouseControl ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Control teclado</div>
                  <div className="text-sm text-gray-400">IA puede escribir automáticamente</div>
                </div>
                <button
                  onClick={() => updateConfig('autoKeyboard', !config.autoKeyboard)}
                  className={`w-12 h-6 rounded-full transition ${config.autoKeyboard ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.autoKeyboard ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Safe Mode</div>
                  <div className="text-sm text-gray-400">Confirmar acciones importantes</div>
                </div>
                <button
                  onClick={() => updateConfig('safeMode', !config.safeMode)}
                  className={`w-12 h-6 rounded-full transition ${config.safeMode ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.safeMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    addAIMessage('✅ Configuración guardada. Continuando...')
                    setMessages(prev => prev.filter(m => !(m.action?.type === 'config' && m.action.data?.showConfig)))
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
                >
                  Cerrar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-gray-800/50 border border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.sender === 'ai' ? (
                      <Brain className="w-4 h-4 text-purple-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-400" />
                    )}
                    <span className="text-sm font-medium">
                      {message.sender === 'ai' ? 'CLAWDESK' : 'Tú'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Action Status */}
                  {message.action && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-2 text-sm">
                        {message.action.type === 'screenshot' && <Camera className="w-4 h-4" />}
                        {message.action.type === 'click' && <MousePointer className="w-4 h-4" />}
                        {message.action.type === 'type' && <Keyboard className="w-4 h-4" />}
                        {message.action.type === 'config' && <Settings className="w-4 h-4" />}
                        {message.action.type === 'info' && <AlertCircle className="w-4 h-4" />}
                        
                        <span className="capitalize">{message.action.type}</span>
                        
                        {message.action.success === true && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {message.action.success === false && (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      
                      {message.action.data?.reason && (
                        <div className="text-xs text-gray-400 mt-1">
                          {message.action.data.reason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm font-medium">CLAWDESK pensando...</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-white/10 p-6">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Dime qué quieres hacer (ej: 'captura la pantalla', 'haz clic aquí', 'escribe mi nombre')..."
                className="flex-1 bg-gray-900/50 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                disabled={isProcessing}
              />
              
              <button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              >
                <Send className="w-5 h-5" />
                <span>Enviar</span>
              </button>
            </div>
            
            {/* Quick Tips */}
            <div className="mt-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Ejemplos: "captura pantalla", "haz clic al centro", "escribe hola mundo", "configuración"</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Status Bar */}
        <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${screenInfo ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span>{screenInfo ? 'Sistema conectado' : 'Modo simulado'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${config.safeMode ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span>Safe Mode: {config.safeMode ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            
            <div className="text-gray-400">
              {screenInfo && `Pantalla: ${screenInfo.width}x${screenInfo.height}`}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto p-4 text-center text-gray-500 text-sm">
        <div className="border-t border-white/10 pt-4">
          CLAWDESK Intelligent • IA que controla tu ordenador • v{window.environment?.version || '1.0.0'}
          <div className="mt-1 text-xs">
            Solo dime qué necesitas, yo decido las acciones.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppIntelligent