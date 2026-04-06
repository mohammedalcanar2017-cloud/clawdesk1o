import React, { useState } from 'react'
import { X, Save, Download, Upload, Trash2, TestTube, Key, Eye, MousePointer, Cpu } from 'lucide-react'
import { configManager } from '../lib/config'
import { useStore } from '../lib/store'

interface ConfigPanelProps {
  onClose: () => void
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('ai')
  const config = configManager.getConfig()
  const { addLog } = useStore()

  const handleSave = () => {
    configManager.saveConfig()
    addLog('💾 Configuración guardada', 'system')
  }

  const handleReset = () => {
    if (window.confirm('¿Restablecer toda la configuración a valores por defecto?')) {
      configManager.resetToDefaults()
      addLog('🔄 Configuración restablecida', 'system')
    }
  }

  const handleExport = async () => {
    try {
      // En una implementación real, usaría el sistema de archivos de Tauri
      const configStr = JSON.stringify(config, null, 2)
      const blob = new Blob([configStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clawdesk-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      addLog('📤 Configuración exportada', 'system')
    } catch (error) {
      addLog('❌ Error exportando configuración', 'error')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = JSON.parse(text)
      
      // Validar estructura básica
      if (imported.ai && imported.vision && imported.control) {
        configManager.updateConfig(imported)
        addLog('📥 Configuración importada', 'system')
      } else {
        addLog('❌ Archivo de configuración inválido', 'error')
      }
    } catch (error) {
      addLog('❌ Error importando configuración', 'error')
    }
    
    // Limpiar input
    event.target.value = ''
  }

  const tabs = [
    { id: 'ai', label: 'IA', icon: <Cpu className="w-4 h-4" /> },
    { id: 'vision', label: 'Visión', icon: <Eye className="w-4 h-4" /> },
    { id: 'control', label: 'Control', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'security', label: 'Seguridad', icon: <Key className="w-4 h-4" /> },
    { id: 'advanced', label: 'Avanzado', icon: <TestTube className="w-4 h-4" /> },
  ]

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Proveedor de IA</label>
        <select
          value={config.ai.provider}
          onChange={(e) => configManager.updateAIConfig({ 
            provider: e.target.value as any 
          })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="openclaw">OpenClaw Engine</option>
          <option value="deepseek">DeepSeek</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic Claude</option>
          <option value="local">Modelo Local</option>
        </select>
      </div>

      {config.ai.provider !== 'openclaw' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={config.ai.apiKey}
              onChange={(e) => configManager.updateAIConfig({ apiKey: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Almacenada de forma segura en tu dispositivo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modelo</label>
            <input
              type="text"
              value={config.ai.model}
              onChange={(e) => configManager.updateAIConfig({ model: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="gpt-4, deepseek-chat, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tokens máximos</label>
              <input
                type="number"
                value={config.ai.maxTokens}
                onChange={(e) => configManager.updateAIConfig({ maxTokens: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="16000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Temperatura</label>
              <input
                type="number"
                step="0.1"
                value={config.ai.temperature}
                onChange={(e) => configManager.updateAIConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="2"
              />
            </div>
          </div>
        </>
      )}

      {config.ai.provider === 'openclaw' && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-purple-300">
            Usando OpenClaw Engine. La configuración se sincroniza automáticamente.
          </p>
        </div>
      )}
    </div>
  )

  const renderVisionTab = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Análisis local de imágenes</span>
          <input
            type="checkbox"
            checked={config.vision.localAnalysis}
            onChange={(e) => configManager.updateConfig({
              vision: { ...config.vision, localAnalysis: e.target.checked }
            })}
            className="rounded border-gray-600 bg-gray-800"
          />
        </label>
        <p className="text-xs text-gray-400">
          Analiza capturas localmente para ahorrar tokens de API
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Calidad de captura</label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={config.vision.screenshotQuality}
            onChange={(e) => configManager.updateConfig({
              vision: { ...config.vision, screenshotQuality: parseInt(e.target.value) }
            })}
            className="flex-1"
          />
          <span className="text-sm w-12">{config.vision.screenshotQuality}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Más bajo = menos tokens, pero peor calidad
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ancho máximo (px)</label>
        <input
          type="number"
          value={config.vision.maxWidth}
          onChange={(e) => configManager.updateConfig({
            vision: { ...config.vision, maxWidth: parseInt(e.target.value) }
          })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="160"
          max="1920"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.vision.detectChanges}
            onChange={(e) => configManager.updateConfig({
              vision: { ...config.vision, detectChanges: e.target.checked }
            })}
            className="rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm">Detectar solo regiones cambiadas</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.vision.useOCR}
            onChange={(e) => configManager.updateConfig({
              vision: { ...config.vision, useOCR: e.target.checked }
            })}
            className="rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm">Usar OCR para extraer texto</span>
        </label>
      </div>
    </div>
  )

  const renderControlTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Retardo de clic (ms)</label>
          <input
            type="number"
            value={config.control.clickDelay}
            onChange={(e) => configManager.updateControlConfig({ 
              clickDelay: parseInt(e.target.value) 
            })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="1000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Velocidad de escritura (ms)</label>
          <input
            type="number"
            value={config.control.typingSpeed}
            onChange={(e) => configManager.updateControlConfig({ 
              typingSpeed: parseInt(e.target.value) 
            })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="10"
            max="500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Aplicaciones permitidas</label>
        <div className="flex flex-wrap gap-2">
          {['chrome', 'vscode', 'terminal', 'firefox', 'edge', 'slack', 'discord', 'spotify', 'whatsapp', 'telegram'].map((app) => (
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

  const renderSecurityTab = () => (
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
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.control.requireConfirmation}
              onChange={(e) => configManager.updateControlConfig({ requireConfirmation: e.target.checked })}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span className="text-sm">Mostrar confirmación antes de acciones</span>
          </label>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          ⚠️ Las API Keys se almacenan localmente en tu dispositivo. 
          Nunca se envían a servidores externos excepto al proveedor de IA configurado.
        </p>
      </div>
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">URL de OpenClaw Engine</label>
        <input
          type="text"
          value={config.openclaw.engineUrl}
          onChange={(e) => configManager.updateConfig({
            openclaw: { ...config.openclaw, engineUrl: e.target.value }
          })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="http://localhost:18789"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.openclaw.autoConnect}
            onChange={(e) => configManager.updateConfig({
              openclaw: { ...config.openclaw, autoConnect: e.target.checked }
            })}
            className="rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm">Conectar automáticamente al iniciar</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.openclaw.syncContext}
            onChange={(e) => configManager.updateConfig({
              openclaw: { ...config.openclaw, syncContext: e.target.checked }
            })}
            className="rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm">Sincronizar contexto con OpenClaw</span>
        </label>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Configuración
          </button>

          <label className="flex items-center justify-center px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Importar Configuración
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center justify-center px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Restablecer a Valores por Defecto
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai': return renderAITab()
      case 'vision': return renderVisionTab()
      case 'control': return renderControlTab()
      case 'security': return renderSecurityTab()
      case 'advanced': return renderAdvancedTab()
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Configuración</h2>
            <p className="text-sm text-gray-400">Ajusta el comportamiento de CLAWDESK</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Save className="w-5 h-5 mr-2" />
            Guardar Cambios
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigPanel