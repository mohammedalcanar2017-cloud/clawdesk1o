import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Image as ImageIcon, MousePointer } from 'lucide-react'
import { useStore, safeInvoke } from '../lib/store'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  action?: {
    type: string
    data: any
    executed: boolean
  }
}

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de IA. Puedo ayudarte a controlar tu PC. ¿Qué necesitas?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addLog, addGuide } = useStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeCommand = (text: string) => {
    const lower = text.toLowerCase()
    
    // Detectar comandos de control
    if (lower.includes('clic') || lower.includes('click')) {
      const coords = text.match(/(\d+)[,x\s]+(\d+)/)
      if (coords) {
        const x = parseInt(coords[1])
        const y = parseInt(coords[2])
        return {
          type: 'click',
          data: { x, y, button: 'left' },
          description: `Hacer clic en coordenadas (${x}, ${y})`
        }
      }
    }
    
    if (lower.includes('escribir') || lower.includes('type')) {
      const match = text.match(/escribir\s+"([^"]+)"|type\s+"([^"]+)"/i)
      const textToType = match ? (match[1] || match[2]) : text.replace(/.*(escribir|type)\s+/i, '')
      if (textToType) {
        return {
          type: 'type',
          data: { text: textToType },
          description: `Escribir: "${textToType}"`
        }
      }
    }
    
    if (lower.includes('capturar') || lower.includes('screenshot')) {
      return {
        type: 'screenshot',
        data: { quality: 40, width: 320 },
        description: 'Capturar pantalla (optimizada)'
      }
    }
    
    if (lower.includes('mostrar coordenadas') || lower.includes('show coordinates')) {
      const coords = text.match(/(\d+)[,x\s]+(\d+)/)
      if (coords) {
        const x = parseInt(coords[1])
        const y = parseInt(coords[2])
        addGuide(x - 20, y - 20, 40, 40, `Coordenadas (${x}, ${y})`)
        return {
          type: 'guide',
          data: { x, y },
          description: `Mostrar guía en (${x}, ${y})`
        }
      }
    }
    
    return null
  }

  const executeAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'click':
          await safeInvoke('click', 'mouse_click', action.data)
          break
        case 'type':
          await safeInvoke('type', 'keyboard_type', action.data)
          break
        case 'screenshot':
          const screenshot = await safeInvoke<string>('screen_capture', 'capture_screen', action.data)
          // Analizar localmente (simulado por ahora)
          addLog('🔍 Analizando captura localmente...', 'info')
          // Aquí iría OpenCV.js/Tesseract.js
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Analizar comando
    const action = analyzeCommand(input)
    
    if (action) {
      userMessage.action = {
        type: action.type,
        data: action.data,
        executed: false
      }
      
      addLog(`🤖 Detectado: ${action.description}`, 'action', action.data)
      
      // Ejecutar acción
      await executeAction(action)
      userMessage.action.executed = true
    }

    // Simular respuesta de IA
    setTimeout(() => {
      let response = ''
      
      if (action) {
        response = `✅ He ejecutado: ${action.description}. ¿Necesitas algo más?`
      } else {
        response = `He procesado tu mensaje: "${input}". Puedo ayudarte con: clics, escritura, capturas de pantalla, o mostrar coordenadas.`
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="glass-panel h-[500px] flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          Chat con IA
        </h2>
        <p className="text-sm text-gray-400">Controla tu PC con comandos naturales</p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'user'
                  ? 'bg-blue-500/20 rounded-br-none'
                  : 'bg-gray-800/50 rounded-bl-none'
              }`}
            >
              <div className="flex items-center mb-2">
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 mr-2" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {msg.sender === 'user' ? 'Tú' : 'Asistente'}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {msg.action && (
                <div className="mt-2 p-2 bg-black/20 rounded-lg text-sm">
                  <div className="flex items-center">
                    {msg.action.type === 'click' && <MousePointer className="w-4 h-4 mr-2" />}
                    {msg.action.type === 'screenshot' && <ImageIcon className="w-4 h-4 mr-2" />}
                    <span className="font-medium">
                      {msg.action.type === 'click' && 'Clic'}
                      {msg.action.type === 'type' && 'Escritura'}
                      {msg.action.type === 'screenshot' && 'Captura'}
                      {msg.action.type === 'guide' && 'Guía'}
                    </span>
                    <span className="ml-2 text-gray-300">
                      {msg.action.executed ? '✅ Ejecutado' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <code className="text-xs mt-1 block">
                    {JSON.stringify(msg.action.data, null, 2)}
                  </code>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 rounded-2xl rounded-bl-none p-4">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un comando como 'Haz clic en 100,150' o 'Escribe Hola Mundo'..."
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg p-3 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          <p>Ejemplos: "clic en 500,300", "escribir 'Hola Mundo'", "capturar pantalla", "mostrar coordenadas 200,150"</p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface