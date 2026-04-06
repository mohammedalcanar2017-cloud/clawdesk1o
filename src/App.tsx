import React, { useState, useEffect, useRef } from 'react'
import { 
  Brain, Play, Square, Eye, Target, MousePointer, Keyboard, 
  Settings, Zap, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, Clock, Map, GitBranch, Sparkles
} from 'lucide-react'

// Tipos
type Task = {
  id: string
  goal: string
  status: 'pending' | 'planning' | 'executing' | 'completed' | 'failed'
  steps: Array<{
    id: string
    action: string
    status: 'pending' | 'executing' | 'completed' | 'failed'
    result?: string
    coordinates?: { x: number; y: number }
  }>
  createdAt: Date
  completedAt?: Date
}

type AgentState = {
  isRunning: boolean
  isMonitoring: boolean
  currentTask?: Task
  screenOverlay: {
    show: boolean
    guides: Array<{ x: number; y: number; label: string; color: string }>
    highlights: Array<{ x: number; y: number; width: number; height: number; label: string }>
  }
  logs: Array<{
    timestamp: Date
    level: 'info' | 'action' | 'warning' | 'error' | 'success'
    message: string
    data?: any
  }>
}

// API del Agente
declare global {
  interface Window {
    clawdeskAgent: {
      // Control del agente
      startAgent: (goal: string) => Promise<{ success: boolean; taskId: string }>
      stopAgent: () => Promise<void>
      pauseAgent: () => Promise<void>
      resumeAgent: () => Promise<void>
      
      // Monitoreo
      startMonitoring: (intervalMs: number) => Promise<void>
      stopMonitoring: () => Promise<void>
      getCurrentScreen: () => Promise<{ data: string; timestamp: number }>
      
      // Overlay visual
      showOverlay: (guides: any[], highlights: any[]) => Promise<void>
      hideOverlay: () => Promise<void>
      flashElement: (x: number, y: number, duration: number) => Promise<void>
      
      // Biblioteca de acciones
      executeAction: (actionName: string, params: any) => Promise<{ success: boolean; result: any }>
      getAvailableActions: () => Promise<Array<{ name: string; description: string; params: any }>>
      
      // Estado
      getAgentState: () => Promise<AgentState>
      getTaskHistory: () => Promise<Task[]>
      
      // Configuración
      updateConfig: (config: any) => Promise<void>
      getConfig: () => Promise<any>
    }
  }
}

function AppAgent() {
  const [goal, setGoal] = useState('')
  const [agentState, setAgentState] = useState<AgentState>({
    isRunning: false,
    isMonitoring: false,
    screenOverlay: {
      show: false,
      guides: [],
      highlights: []
    },
    logs: []
  })
  const [availableActions, setAvailableActions] = useState<Array<{ name: string; description: string }>>([])
  const [taskHistory, setTaskHistory] = useState<Task[]>([])
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Inicializar
  useEffect(() => {
    const init = async () => {
      try {
        const actions = await window.clawdeskAgent.getAvailableActions()
        setAvailableActions(actions)
        
        const history = await window.clawdeskAgent.getTaskHistory()
        setTaskHistory(history)
        
        addLog('✅ Agente inicializado', 'info')
      } catch (error) {
        addLog(`❌ Error inicializando agente: ${error}`, 'error')
      }
    }
    init()
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentState.logs])

  const addLog = (message: string, level: AgentState['logs'][0]['level'] = 'info', data?: any) => {
    const newLog = {
      timestamp: new Date(),
      level,
      message,
      data
    }
    setAgentState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-99), newLog] // Mantener últimos 100 logs
    }))
  }

  const startAgent = async () => {
    if (!goal.trim() || agentState.isRunning) return
    
    addLog(`🎯 Iniciando tarea: "${goal}"`, 'info')
    
    try {
      const result = await window.clawdeskAgent.startAgent(goal)
      
      if (result.success) {
        addLog(`✅ Tarea iniciada (ID: ${result.taskId})`, 'success')
        
        // Iniciar monitoreo
        await window.clawdeskAgent.startMonitoring(2000) // Cada 2 segundos
        
        // Actualizar estado periódicamente
        const updateInterval = setInterval(async () => {
          if (!agentState.isRunning) {
            clearInterval(updateInterval)
            return
          }
          
          const state = await window.clawdeskAgent.getAgentState()
          setAgentState(state)
          
          if (state.currentTask?.status === 'completed' || state.currentTask?.status === 'failed') {
            clearInterval(updateInterval)
            addLog(`🏁 Tarea ${state.currentTask.status === 'completed' ? 'completada' : 'fallida'}`, 
                   state.currentTask.status === 'completed' ? 'success' : 'error')
            
            const history = await window.clawdeskAgent.getTaskHistory()
            setTaskHistory(history)
          }
        }, 1000)
      }
    } catch (error) {
      addLog(`❌ Error iniciando agente: ${error}`, 'error')
    }
  }

  const stopAgent = async () => {
    addLog('⏹️ Deteniendo agente...', 'warning')
    await window.clawdeskAgent.stopAgent()
    addLog('✅ Agente detenido', 'info')
  }

  const executeQuickTask = async (quickGoal: string) => {
    setGoal(quickGoal)
    setTimeout(() => startAgent(), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header futurista */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-lg p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7" />
                </div>
                {agentState.isRunning && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  CLAWDESK AGENT
                </h1>
                <p className="text-sm text-gray-400">Agente autónomo que planifica y ejecuta</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${agentState.isRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                  {agentState.isRunning ? '🟢 EJECUTANDO' : '⚫ DETENIDO'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${agentState.isMonitoring ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                  {agentState.isMonitoring ? '👁️ MONITOREANDO' : '👁️‍🗨️ INACTIVO'}
                </div>
              </div>
              
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="p-2 hover:bg-white/5 rounded-xl transition"
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Config Panel */}
      {isConfigOpen && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración del Agente
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Monitoreo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intervalo de screenshots</span>
                      <select className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-sm">
                        <option>1 segundo</option>
                        <option selected>2 segundos</option>
                        <option>5 segundos</option>
                        <option>10 segundos</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calidad de imagen</span>
                      <select className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-sm">
                        <option>Baja (rápido)</option>
                        <option selected>Media</option>
                        <option>Alta (preciso)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Overlay Visual
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mostrar guías</span>
                      <div className="w-10 h-6 bg-blue-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Animaciones</span>
                      <div className="w-10 h-6 bg-blue-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sonidos de acción</span>
                      <div className="w-10 h-6 bg-gray-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition font-medium"
                >
                  Cerrar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Input */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Objetivo del Agente
              </h2>
              
              <div className="space-y-4">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe lo que quieres que haga el agente (ej: 'Abre Chrome, busca el clima en Madrid y toma una captura', 'Organiza mis archivos del escritorio', 'Configura mi correo electrónico')..."
                  className="w-full h-32 bg-gray-900/70 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition resize-none"
                  disabled={agentState.isRunning}
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={startAgent}
                    disabled={!goal.trim() || agentState.isRunning}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-lg"
                  >
                    <Play className="w-5 h-5" />
                    <span>Ejecutar Agente</span>
                  </button>
                  
                  {agentState.isRunning && (
                    <button
                      onClick={stopAgent}
                      className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl transition flex items-center space-x-2 font-medium"
                    >
                      <Square className="w-5 h-5" />
                      <span>Detener</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Quick Tasks */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Tareas rápidas:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => executeQuickTask('Abre Chrome y busca "clima en Madrid"')}
                    className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition border border-white/5"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">Buscar en Chrome</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Abre y busca automáticamente</div>
                  </button>
                  
                  <button
                    onClick={() => executeQuickTask('Organiza los archivos del escritorio por tipo')}
                    className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition border border-white/5"
                  >
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Organizar escritorio</span>
                    </div>
                    <div className="text-sm text-gray-400                    <div className="text-sm text-gray-400 mt-1">Clasifica archivos automáticamente</div>
                  </button>
                  
                  <button
                    onClick={() => executeQuickTask('Configura mi correo en la app de correo')}
                    className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition border border-white/5"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">Configurar correo</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Setup automático de email</div>
                  </button>
                  
                  <button
                    onClick={() => executeQuickTask('Toma capturas de todas las ventanas abiertas')}
                    className="text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition border border-white/5"
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Capturar ventanas</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Screenshot de todo el sistema</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Task */}
            {agentState.currentTask && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Map className="w-5 h-5 mr-2" />
                  Tarea en Progreso
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{agentState.currentTask.goal}</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        agentState.currentTask.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                        agentState.currentTask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {agentState.currentTask.status === 'executing' ? '🔄 EJECUTANDO' :
                         agentState.currentTask.status === 'completed' ? '✅ COMPLETADO' :
                         '📝 PLANIFICANDO'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Iniciada: {agentState.currentTask.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400">Pasos planificados:</h3>
                    {agentState.currentTask.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-900/30 rounded-lg">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          step.status === 'executing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                          'bg-gray-800 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.action}</div>
                          {step.result && (
                            <div className="text-sm text-gray-400 mt-1">{step.result}</div>
                          )}
                          {step.coordinates && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 ({step.coordinates.x}, {step.coordinates.y})
                            </div>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          step.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                          step.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-800 text-gray-500'
                        }`}>
                          {step.status === 'completed' ? '✅' :
                           step.status === 'executing' ? '🔄' :
                           step.status === 'failed' ? '❌' : '⏳'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Logs */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Logs del Agente
              </h2>
              
              <div className="h-64 overflow-y-auto bg-gray-900/30 rounded-xl p-4 space-y-2">
                {agentState.logs.map((log, index) => (
                  <div key={index} className="font-mono text-sm">
                    <span className="text-gray-500">
                      [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </span>
                    <span className={`ml-2 ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warning' ? 'text-yellow-400' :
                      log.level === 'success' ? 'text-green-400' :
                      log.level === 'action' ? 'text-blue-400' :
                      'text-gray-300'
                    }`}>
                      {log.level === 'error' ? '❌' :
                       log.level === 'warning' ? '⚠️' :
                       log.level === 'success' ? '✅' :
                       log.level === 'action' ? '⚡' : 'ℹ️'} {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* Columna derecha: Estado y acciones */}
          <div className="space-y-6">
            {/* Agent Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Estado del Agente
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-sm text-gray-400">Estado</div>
                    <div className={`text-lg font-medium ${agentState.isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                      {agentState.isRunning ? 'ACTIVO' : 'INACTIVO'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-sm text-gray-400">Monitoreo</div>
                    <div className={`text-lg font-medium ${agentState.isMonitoring ? 'text-blue-400' : 'text-gray-400'}`}>
                      {agentState.isMonitoring ? 'ACTIVO' : 'INACTIVO'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Overlay Visual</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Guías en pantalla</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full ${agentState.screenOverlay.show ? 'bg-blue-500' : 'bg-gray-700'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transform transition ${agentState.screenOverlay.show ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Tareas ejecutadas</div>
                  <div className="text-2xl font-bold">{taskHistory.length}</div>
                </div>
              </div>
            </div>

            {/* Available Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Biblioteca de Acciones
              </h2>
              
              <div className="space-y-3">
                {availableActions.slice(0, 6).map((action, index) => (
                  <div key={index} className="p-3 bg-gray-900/30 rounded-lg border border-white/5">
                    <div className="font-medium text-sm">{action.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{action.description}</div>
                  </div>
                ))}
                
                {availableActions.length > 6 && (
                  <div className="text-center text-sm text-gray-500">
                    +{availableActions.length - 6} acciones más disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Visual Guide Preview */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Guías Visuales
              </h2>
              
              <div className="relative h-48 bg-gray-900/50 rounded-xl overflow-hidden">
                {/* Simulación de pantalla con overlays */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-20 bg-gray-700/50 rounded-lg border border-white/20"></div>
                </div>
                
                {/* Cruces de guía */}
                {agentState.screenOverlay.guides.slice(0, 3).map((guide, index) => (
                  <div
                    key={index}
                    className="absolute w-6 h-6"
                    style={{ left: `${guide.x / 5}%`, top: `${guide.y / 5}%` }}
                  >
                    <div className="w-6 h-6 border-2 border-red-400 rounded-full flex items-center justify-center">
                      <div className="w-4 h-0.5 bg-red-400 absolute"></div>
                      <div className="h-4 w-0.5 bg-red-400 absolute"></div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 px-2 py-1 rounded whitespace-nowrap">
                      {guide.label}
                    </div>
                  </div>
                ))}
                
                {/* Highlights */}
                {agentState.screenOverlay.highlights.slice(0, 2).map((highlight, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-yellow-400 animate-pulse"
                    style={{
                      left: `${highlight.x / 5}%`,
                      top: `${highlight.y / 5}%`,
                      width: `${highlight.width / 5}%`,
                      height: `${highlight.height / 5}%`
                    }}
                  >
                    <div className="absolute -top-6 left-0 text-xs bg-gray-900 px-2 py-1 rounded">
                      {highlight.label}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                El agente muestra cruces y highlights para guiar sus acciones
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-4 text-center text-gray-500 text-sm">
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <span className="font-medium">CLAWDESK AGENT</span> • Agente autónomo de planificación y ejecución
            </div>
            <div className="mt-2 md:mt-0">
              {agentState.isRunning ? (
                <span className="text-green-400">🟢 Agente ejecutando tarea...</span>
              ) : (
                <span className="text-gray-400">⚫ Listo para recibir objetivos</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppAgent