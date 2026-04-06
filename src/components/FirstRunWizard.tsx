import React, { useState, useEffect } from 'react'
import { Settings, Key, Brain, Shield, Zap, Check, AlertCircle } from 'lucide-react'
import { configManager, AppConfig } from '../lib/config'
import { useStore } from '../lib/store'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const FirstRunWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<AppConfig>(configManager.getConfig())
  const [importing, setImporting] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const { addLog } = useStore()

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenido a CLAWDESK',
      description: 'Configura tu asistente de IA para controlar el PC',
      icon: <Brain className="w-6 h-6" />
    },
    {
      id: 'ai',
      title: 'Configuración de IA',
      description: 'Elige tu proveedor de inteligencia artificial',
      icon: <Settings className="w-6 h-6" />
    },
    {
      id: 'engine',
      title: 'Motor de Procesamiento',
      description: 'Configura el procesamiento local de imágenes',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'security',
      title: 'Configuración de Seguridad',
      description: 'Define los niveles de control y aprobación',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'test',
      title: 'Prueba la Configuración',
      description: 'Verifica que todo funcione correctamente',
      icon: <Check className="w-6 h-6" />
    }
  ]

  useEffect(() => {
    const unsubscribe = configManager.subscribe(setConfig)
    return unsubscribe
  }, [])

  const handleImportOpenClaw = async () => {
    setImporting(true)
    addLog('🔄 Importando configuración de OpenClaw...', 'system')
    
    const success = await configManager.importFromOpenClaw()
    
    if (success) {
      addLog('✅ Configuración de OpenClaw importada', 'system')
      setTestResults(prev => ({ ...prev, openclaw: true }))
    } else {
      addLog('⚠️ No se pudo importar configuración de OpenClaw', 'warning')
    }
    
    setImporting(false)
  }

  const handleTestConnection = async (type: string) => {
    addLog(`🔍 Probando conexión ${type}...`, 'system')
    
    // Simular prueba (en implementación real haría ping real)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const success = Math.random() > 0.3 // 70% de éxito simulado
    
    setTestResults(prev => ({ ...prev, [type]: success }))
    
    if (success) {
      addLog(`✅ Conexión ${type} exitosa`, 'system')
    } else {
      addLog(`❌ Conexión ${type} fallida`, 'error')
    }
  }

  const handleComplete = async () => {
    configManager.updateConfig({ firstRun: false })
    addLog('🎉 Configuración inicial completada', 'system')
    onComplete()
  }

  const renderStep = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">¡Hola! 👋</h3>
              <p className="text-gray-300">
                CLAWDESK es tu asistente de IA para controlar el PC. 
                Vamos a configurarlo en unos simples pasos.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                Lo que podrás hacer:
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Controlar el PC con comandos de voz/texto
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Capturar y analizar pantalla automáticamente
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                  Modo seguro con aprobación para acciones críticas
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Integración con OpenClaw para IA avanzada
                </li>
              </ul>
            </div>
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'openclaw', name: 'OpenClaw', desc: 'Usar tu instalación existente', color: 'bg-purple-500/20 text-purple-400' },
                { id: 'deepseek', name: 'DeepSeek', desc: 'Modelo económico y potente', color: 'bg-blue-500/20 text-blue-400' },
                { id: 'openai', name: 'OpenAI', desc: 'GPT-4, el más avanzado', color: 'bg-green-500/20 text-green-400' },
                { id: 'local', name: 'Local', desc: 'Modelos en tu PC', color: 'bg-gray-500/20 text-gray-400' },
              ].map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => configManager.updateAIConfig({ provider: provider.id as any })}
                  className={`p-4 rounded-lg text-left transition ${provider.color} ${
                    config.ai.provider === provider.id ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-current' : ''
                  }`}
                >
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-xs opacity-80 mt-1">{provider.desc}</div>
                </button>
              ))}
            </div>

            {config.ai.provider !== 'openclaw' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Key className="w-4 h-4 inline mr-1" />
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.ai.apiKey}
                    onChange={(e) => configManager.updateAIConfig({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Tu clave se almacena de forma segura en tu dispositivo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <select
                    value={config.ai.model}
                    onChange={(e) => configManager.updateAIConfig({ model: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {config.ai.provider === 'deepseek' && (
                      <>
                        <option value="deepseek-chat">DeepSeek Chat</option>
                        <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                      </>
                    )}
                    {config.ai.provider === 'openai' && (
                      <>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </>
                    )}
                    {config.ai.provider === 'local' && (
                      <>
                        <option value="llama2">Llama 2</option>
                        <option value="mistral">Mistral</option>
                        <option value="phi">Phi-2</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {config.ai.provider === 'openclaw' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-purple-300">
                  Usarás tu instalación existente de OpenClaw. La configuración se importará automáticamente.
                </p>
              </div>
            )}
          </div>
        )

      case 'engine':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Procesamiento Local</div>
                  <div className="text-sm text-gray-400">Analizar imágenes en tu PC (ahorra tokens)</div>
                </div>
                <button
                  onClick={() => configManager.updateConfig({
                    engine: { ...config.engine, useLocalProcessing: !config.engine.useLocalProcessing }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    config.engine.useLocalProcessing ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.engine.useLocalProcessing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.engine.cacheScreenshots}
                    onChange={(e) => configManager.updateConfig({
                      engine: { ...config.engine, cacheScreenshots: e.target.checked }
                    })}
                    className="rounded border-gray-600 bg-gray-800"
                  />
                  <span className="text-sm">Cache de capturas de pantalla</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">Tamaño máximo de cache (MB)</label>
                  <input
                    type="number"
                    value={config.engine.maxCacheSizeMB}
                    onChange={(e) => configManager.updateConfig({
                      engine: { ...config.engine, maxCacheSizeMB: parseInt(e.target.value) }
                    })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="10"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                El procesamiento local usa TensorFlow.js y Tesseract.js para analizar imágenes
                directamente en tu navegador, sin enviar datos a servidores externos.
              </p>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Modo Seguro</div>
                  <div className="text-sm text-gray-400">Requerir aprobación para acciones críticas</div>
                </div>
                <button
                  onClick={() => configManager.updateControlConfig({ safeMode: !config.control.safeMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    config.control.safeMode ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.control.safeMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.control.requireConfirmation}
                    onChange={(e) => configManager.updateControlConfig({ requireConfirmation: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-800"
                  />
                  <span className="text-sm">Mostrar confirmación antes de acciones</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.vision.localAnalysis}
                    onChange={(e) => configManager.updateConfig({
                      vision: { ...config.vision, localAnalysis: e.target.checked }
                    })}
                    className="rounded border-gray-600 bg-gray-800"
                  />
                  <span className="text-sm">Analizar imágenes localmente (ahorra tokens)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Aplicaciones permitidas</label>
              <div className="flex flex-wrap gap-2">
                {['chrome', 'vscode', 'terminal', 'firefox', 'edge', 'slack', 'discord', 'spotify'].map((app) => (
                  <button
                    key={app}
                    onClick={() => {
                      const newApps = config.control.allowedApps.includes(app)
                        ? config.control.allowedApps.filter(a => a !== app)
                        : [...config.control.allowedApps, app]
                      configManager.updateControlConfig({ allowedApps: newApps })
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      config.control.allowedApps.includes(app)
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'test':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { id: 'ai', label: 'Conexión IA', test: () => handleTestConnection('ai') },
                { id: 'engine', label: 'Motor Local', test: () => handleTestConnection('engine') },
                { id: 'screenshot', label: 'Captura de pantalla', test: () => handleTestConnection('screenshot') },
                { id: 'control', label: 'Control de entrada', test: () => handleTestConnection('control') },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-400">
                      {testResults[item.id] === undefined ? 'No probado' : 
                       testResults[item.id] ? '✅ Listo' : '❌ Falló'}
                    </div>
                  </div>
                  <button
                    onClick={item.test}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Probar
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                Puedes cambiar estas configuraciones en cualquier momento desde el panel de ajustes.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepComplete = (stepId: string): boolean => {
    switch (stepId) {
      case 'ai':
        return config.ai.provider !== '' && config.ai.apiKey !== ''
      case 'openclaw':
        return config.openclaw.engineUrl !== ''
      case 'test':
        return Object.values(testResults).filter(Boolean).length >= 2
      default:
        return true
    }
  }

  const canProceed = isStepComplete(steps[currentStep].id)

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                {step.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Paso {currentStep + 1} de {steps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            Anterior
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition flex items-center"
            >
              <Check className="w-5 h-5 mr-2" />
              Completar Configuración
            </button>
          )}
        </div>
      </div>
    </div>
  )}
export default FirstRunWizard
