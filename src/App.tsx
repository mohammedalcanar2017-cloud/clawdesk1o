import React, { useState, useEffect, useRef } from 'react'
import { Send, Brain, Camera, MousePointer, Keyboard, Settings, AlertCircle, CheckCircle, XCircle, Zap, Eye } from 'lucide-react'

// Tipos
type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  action?: {
    type: 'screenshot' | 'click' | 'type' | 'keypress' | 'thinking' | 'api_call'
    data?: any
    success?: boolean
  }
}

type AIConfig = {
  apiKey: string
  apiProvider: 'deepseek' | 'openai' | 'anthropic' | 'local'
  model: string
  visionEnabled: boolean
  autoActions: boolean
  safeMode: boolean
}

// API de Electron real
declare global {
  interface Window {
    clawdeskAPI: {
      // Captura REAL
      captureScreenReal: () => Promise<{ success: boolean; data?: string; error?: string }>
      
      // Control REAL
      mouseClickReal: (x: number, y: number) => Promise<{ success: boolean; error?: string }>
      mouseMoveReal: (x: number, y: number) => Promise<{ success: boolean; error?: string }>
      keyboardTypeReal: (text: string) => Promise<{ success: boolean; error?: string }>
      keyboardPressReal: (key: string) => Promise<{ success: boolean; error?: string }>
      
      // Sistema
      getScreenInfo: () => Promise<{ width: number; height: number }>
      showDialog: (options: any) => Promise<any>
      
      // IA REAL
      callAIWithVision: (prompt: string, imageBase64?: string) => Promise<{
        success: boolean
        response: string
        actions?: Array<{ type: string; data: any }>
        error?: string
      }>
    }
  }
}

function AppReal() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy CLAWDESK REAL. Puedo VER tu pantalla y CONTROLAR tu ordenador. Dime qué necesitas.',
      sender: 'ai',
      timestamp: new Date(),
      action: { type: 'thinking', data: { status: 'ready' } }
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    apiProvider: 'deepseek',
    model: 'deepseek-chat',
    visionEnabled: true,
    autoActions: true,
    safeMode: true
  })
  const [screenInfo, setScreenInfo] = useState<{ width: number; height: number } | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inicializar
  useEffect(() => {
    const init = async () => {
      try {
        const info = await window.clawdeskAPI.getScreenInfo()
        setScreenInfo(info)
        addAIMessage(`✅ Sistema conectado. Pantalla: ${info.width}x${info.height}`)
      } catch (error) {
        addAIMessage('⚠️ Modo limitado. Configura API para control completo.')
      }
    }
    init()
  }, [])

  // Auto-scroll
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

  // Procesar comando con IA REAL
  const processWithRealAI = async (userCommand: string) => {
    setIsProcessing(true)
    
    try {
      // Paso 1: Tomar screenshot REAL si visión está activada
      let screenshotData: string | undefined
      
      if (config.visionEnabled) {
        addAIMessage('📸 Tomando captura de pantalla REAL...', { 
          type: 'screenshot', 
          data: { reason: 'AI needs visual context' } 
        })
        
        const screenshot = await window.clawdeskAPI.captureScreenReal()
        if (screenshot.success && screenshot.data) {
          screenshotData = screenshot.data
          addAIMessage('✅ Pantalla capturada. Analizando con IA...', {
            type: 'screenshot',
            data: { success: true },
            success: true
          })
        } else {
          addAIMessage('⚠️ No se pudo capturar pantalla. Continuando sin visión.', {
            type: 'screenshot',
            data: { success: false, error: screenshot.error },
            success: false
          })
        }
      }

      // Paso 2: Llamar a IA REAL con visión
      addAIMessage('🧠 Consultando a IA...', { type: 'api_call', data: { provider: config.apiProvider } })
      
      const aiResponse = await window.clawdeskAPI.callAIWithVision(
        `Usuario dice: "${userCommand}". 
        
        Tú eres CLAWDESK, un asistente que PUEDE CONTROLAR EL ORDENADOR.
        
        INSTRUCCIONES:
        1. Analiza lo que el usuario quiere
        2. Si necesitas hacer acciones (clic, escribir, teclear), responde con JSON de acciones
        3. Si solo es conversación, responde normalmente
        
        FORMATO DE ACCIONES (si las necesitas):
        {
          "response": "Texto para mostrar al usuario",
          "actions": [
            {"type": "click", "x": 100, "y": 200, "reason": "Clic en botón X"},
            {"type": "type", "text": "Hola mundo", "reason": "Escribir texto"},
            {"type": "keypress", "key": "Enter", "reason": "Presionar Enter"}
          ]
        }
        
        CONTEXTO: ${screenInfo ? `Pantalla: ${screenInfo.width}x${screenInfo.height}` : 'Pantalla desconocida'}
        
        Responde ÚNICAMENTE con JSON si hay acciones, o texto normal si no.`,
        screenshotData
      )

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Error en API de IA')
      }

      // Paso 3: Procesar respuesta de IA
      try {
        // Intentar parsear como JSON (si la IA devolvió acciones)
        const parsed = JSON.parse(aiResponse.response)
        
        if (parsed.response) {
          addAIMessage(parsed.response)
        }
        
        if (parsed.actions && Array.isArray(parsed.actions)) {
          // Ejecutar acciones REALES
          await executeRealActions(parsed.actions)
        }
      } catch {
        // Si no es JSON, es respuesta normal
        addAIMessage(aiResponse.response)
      }

    } catch (error) {
      addAIMessage(`❌ Error: ${error}`, { 
        type: 'api_call', 
        data: { error: error.toString() },
        success: false 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Ejecutar acciones REALES
  const executeRealActions = async (actions: Array<any>) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            addAIMessage(`🖱️ Haciendo clic REAL en (${action.x}, ${action.y})...`, {
              type: 'click',
              data: action
            })
            
            if (config.safeMode) {
              const confirm = await window.clawdeskAPI.showDialog({
                type: 'question',
                title: 'Safe Mode - Clic REAL',
                message: `¿Hacer clic REAL en posición (${action.x}, ${action.y})?\n\nRazón: ${action.reason || 'No especificada'}`,
                buttons: ['Cancelar', 'Confirmar']
              })
              
              if (confirm.response !== 1) {
                addAIMessage('⏸️ Clic cancelado por Safe Mode', {
                  type: 'click',
                  data: { ...action, cancelled: true },
                  success: false
                })
                continue
              }
            }
            
            const clickResult = await window.clawdeskAPI.mouseClickReal(action.x, action.y)
            addAIMessage(clickResult.success ? '✅ Clic REAL realizado' : '❌ Error en clic', {
              type: 'click',
              data: { ...action, success: clickResult.success },
              success: clickResult.success
            })
            break
            
          case 'type':
            addAIMessage(`⌨️ Escribiendo REAL: "${action.text}"...`, {
              type: 'type',
              data: action
            })
            
            if (config.safeMode && action.text.length > 10) {
              const confirm = await window.clawdeskAPI.showDialog({
                type: 'question',
                title: 'Safe Mode - Escritura REAL',
                message: `¿Escribir REALMENTE "${action.text.substring(0, 50)}${action.text.length > 50 ? '...' : ''}"?\n\nRazón: ${action.reason || 'No especificada'}`,
                buttons: ['Cancelar', 'Confirmar']
              })
              
              if (confirm.response !== 1) {
                addAIMessage('⏸️ Escritura cancelada por Safe Mode', {
                  type: 'type',
                  data: { ...action, cancelled: true },
                  success: false
                })
                continue
              }
            }
            
            const typeResult = await window.clawdeskAPI.keyboardTypeReal(action.text)
            addAIMessage(typeResult.success ? '✅ Texto escrito REALMENTE' : '❌ Error al escribir', {
              type: 'type',
              data: { ...action, success: typeResult.success },
              success: typeResult.success
            })
            break
            
          case 'keypress':
            addAIMessage(`⌨️ Presionando tecla REAL: ${action.key}...`, {
              type: 'keypress',
              data: action
            })
            
            const keyResult = await window.clawdeskAPI.keyboardPressReal(action.key)
            addAIMessage(keyResult.success ? `✅ Tecla ${action.key} presionada` : '❌ Error al presionar tecla', {
              type: 'keypress',
              data: { ...action, success: keyResult.success },
              success: keyResult.success
            })
            break
        }
        
        // Pequeña pausa entre acciones
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        addAIMessage(`❌ Error ejecutando acción: ${error}`, {
          type: action.type,
          data: { ...action, error: error.toString() },
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
    
    // Verificar configuración
    if (!config.apiKey && config.apiProvider !== 'local') {
      addAIMessage('❌ Necesitas configurar una API key primero. Usa el botón ⚙️ Configuración.')
      setIsConfigOpen(true)
      return
    }
    
    // Procesar con IA REAL
    await processWithRealAI(userMessage)
  }

  const handleConfigSave = () => {
    addAIMessage('✅ Configuración guardada. Ahora puedo usar IA REAL.')
    setIsConfigOpen(false)
    
    // Guardar en localStorage
    localStorage.setItem('clawdesk_config', JSON.stringify(config))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      {/* Header */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                CLAWDESK REAL
              </h1>
              <p className="text-sm text-gray-400">IA que VE y CONTROLA tu ordenador</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {screenInfo && (
              <div className="text-sm text-gray-300 hidden md:block">
                📺 {screenInfo.width}x{screenInfo.height}
              </div>
            )}
            
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </header>

      {/* Config Panel */}
      {isConfigOpen && (
        <div className="max-w-5xl mx-auto p-4">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración IA REAL
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Proveedor de IA</label>
                <select
                  value={config.apiProvider}
                  onChange={(e) => setConfig({...config, apiProvider: e.target.value as any})}
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="deepseek">DeepSeek</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="local">Local (experimental)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                />
                <div className="text-xs text-gray-400 mt-2">
                  {config.apiProvider === 'deepseek' && 'Consigue tu key en: platform.deepseek.com'}
                  {config.apiProvider === 'openai' && 'Consigue tu key en: platform.openai.com'}
                  {config.apiProvider === 'anthropic' && 'Consigue tu key en: console.anthropic.com'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="font-medium">Visión por IA</div>
                    <div className="text-sm text-gray-400">IA ve screenshots REALES</div>
                  </div>
                  <button
                    onClick={() => setConfig({...config, visionEnabled: !config.visionEnabled})}
                    className={`w-12 h                  <button
                    onClick={() => setConfig({...config, visionEnabled: !config.visionEnabled})}
                    className={`w-12 h-6 rounded-full transition ${config.visionEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.visionEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="font-medium">Acciones automáticas</div>
                    <div className="text-sm text-gray-400">IA ejecuta acciones REALES</div>
                  </div>
                  <button
                    onClick={() => setConfig({...config, autoActions: !config.autoActions})}
                    className={`w-12 h-6 rounded-full transition ${config.autoActions ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.autoActions ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="font-medium">Safe Mode</div>
                    <div className="text-sm text-gray-400">Confirmar acciones importantes</div>
                  </div>
                  <button
                    onClick={() => setConfig({...config, safeMode: !config.safeMode})}
                    className={`w-12 h-6 rounded-full transition ${config.safeMode ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition ${config.safeMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="font-medium mb-2">Modelo</div>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({...config, model: e.target.value})}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="deepseek-chat">deepseek-chat</option>
                    <option value="deepseek-coder">deepseek-coder</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                    <option value="claude-3-opus">claude-3-opus</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <div className="flex space-x-4">
                  <button
                    onClick={handleConfigSave}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition font-medium"
                  >
                    Guardar y Activar
                  </button>
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat */}
      <main className="max-w-5xl mx-auto p-4">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-gray-800/70 border border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.sender === 'ai' ? (
                      <Brain className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-400" />
                    )}
                    <span className="text-sm font-medium">
                      {message.sender === 'ai' ? 'CLAWDESK REAL' : 'Tú'}
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
                        {message.action.type === 'keypress' && <Keyboard className="w-4 h-4" />}
                        {message.action.type === 'api_call' && <Brain className="w-4 h-4" />}
                        {message.action.type === 'thinking' && <Eye className="w-4 h-4" />}
                        
                        <span className="capitalize">
                          {message.action.type === 'api_call' ? 'IA REAL' : message.action.type}
                        </span>
                        
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
                <div className="bg-gray-800/70 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-sm font-medium">IA REAL procesando...</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {config.visionEnabled ? '📸 Capturando pantalla → 🧠 Analizando con IA → 🖱️ Ejecutando acciones' : '🧠 Consultando a IA...'}
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
                placeholder="Dime qué hacer (ej: 'cierra esa ventana', 'escribe un correo', 'haz clic en el botón azul')..."
                className="flex-1 bg-gray-900/70 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition text-lg"
                disabled={isProcessing}
              />
              
              <button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium text-lg"
              >
                <Send className="w-5 h-5" />
                <span>Ejecutar</span>
              </button>
            </div>
            
            {/* Quick Tips */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="w-4 h-4" />
                <span>Ejemplos REALES:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => setInput('Haz clic en el botón de cerrar')}
                  className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition text-sm"
                >
                  "Haz clic en el botón de cerrar"
                </button>
                <button
                  onClick={() => setInput('Escribe "Hola mundo" en el navegador')}
                  className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition text-sm"
                >
                  'Escribe "Hola mundo" en el navegador'
                </button>
                <button
                  onClick={() => setInput('¿Qué hay en mi pantalla?')}
                  className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition text-sm"
                >
                  "¿Qué hay en mi pantalla?"
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.apiKey ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm">
                  {config.apiKey ? 'IA CONECTADA' : 'SIN API KEY'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.visionEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-sm">Visión: {config.visionEnabled ? 'ON' : 'OFF'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.safeMode ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                <span className="text-sm">Safe Mode: {config.safeMode ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              {config.apiProvider} • {config.model}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto p-4 text-center text-gray-500 text-sm">
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <span className="font-medium">CLAWDESK REAL</span> • IA que VE y CONTROLA
            </div>
            <div className="mt-2 md:mt-0">
              {!config.apiKey && (
                <span className="text-yellow-400">⚠️ Configura API key para control REAL</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppReal