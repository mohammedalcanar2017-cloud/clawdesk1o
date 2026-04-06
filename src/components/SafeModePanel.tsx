import React from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle, Lock, Unlock } from 'lucide-react'
import { useStore } from '../lib/store'

const SafeModePanel: React.FC = () => {
  const { safeMode, toggleSafeMode, requireApproval, setRequireApproval } = useStore()

  const actions = [
    { id: 'click', label: 'Clics de ratón', description: 'Hacer clic en cualquier parte' },
    { id: 'type', label: 'Escritura', description: 'Escribir texto' },
    { id: 'key', label: 'Teclas especiales', description: 'Enter, Escape, etc.' },
    { id: 'screen_capture', label: 'Capturas', description: 'Tomar screenshot' },
    { id: 'file_access', label: 'Archivos', description: 'Acceder a archivos' },
    { id: 'network', label: 'Red', description: 'Conexiones de red' },
  ]

  const toggleAction = (actionId: string) => {
    const newActions = requireApproval.includes(actionId)
      ? requireApproval.filter(id => id !== actionId)
      : [...requireApproval, actionId]
    setRequireApproval(newActions)
  }

  return (
    <div className={`glass-panel p-4 ${safeMode ? 'safe-mode-active' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {safeMode ? (
            <Lock className="w-6 h-6 text-yellow-500" />
          ) : (
            <Unlock className="w-6 h-6 text-green-500" />
          )}
          <div>
            <h2 className="text-lg font-semibold">Safe Mode</h2>
            <p className="text-sm text-gray-400">
              {safeMode ? 'Acciones requieren aprobación' : 'Todas las acciones permitidas'}
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleSafeMode}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            safeMode
              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {safeMode ? 'DESACTIVAR' : 'ACTIVAR'}
        </button>
      </div>

      {safeMode ? (
        <>
          <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-300">Modo Seguro Activado</p>
                <p className="text-xs text-yellow-400/80 mt-1">
                  Las acciones marcadas abajo requerirán tu aprobación antes de ejecutarse.
                  Esto previene operaciones no deseadas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Acciones que requieren aprobación:</p>
            {actions.map((action) => {
              const requires = requireApproval.includes(action.id)
              return (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition cursor-pointer"
                  onClick={() => toggleAction(action.id)}
                >
                  <div>
                    <div className="flex items-center">
                      {requires ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{action.description}</p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    requires
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {requires ? 'REQUIERE' : 'PERMITIDO'}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400">
              <Shield className="w-3 h-3 inline mr-1" />
              El Safe Mode protege contra acciones no deseadas. Cuando la IA sugiera una acción crítica,
              verás un diálogo de confirmación antes de que se ejecute.
            </p>
          </div>
        </>
      ) : (
        <div className="p-4 bg-green-500/10 rounded-lg text-center">
          <Unlock className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-green-400">Modo Libre Activado</p>
          <p className="text-sm text-green-400/80 mt-1">
            Todas las acciones se ejecutarán automáticamente sin requerir aprobación.
            Usa con precaución.
          </p>
        </div>
      )}
    </div>
  )
}

export default SafeModePanel