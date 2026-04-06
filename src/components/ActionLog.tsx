import React from 'react'
import { Clock, Terminal, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'
import { useStore } from '../lib/store'

const ActionLog: React.FC = () => {
  const { logs, clearLogs } = useStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />
      case 'action': return <Terminal className="w-4 h-4 text-green-400" />
      case 'system': return <CheckCircle className="w-4 h-4 text-purple-400" />
      default: return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'Info'
      case 'warning': return 'Advertencia'
      case 'error': return 'Error'
      case 'action': return 'Acción'
      case 'system': return 'Sistema'
      default: return type
    }
  }

  return (
    <div className="glass-panel h-[400px] flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center">
          <Terminal className="w-5 h-5 mr-2" />
          <div>
            <h2 className="text-lg font-semibold">Registro de Acciones</h2>
            <p className="text-sm text-gray-400">Historial de operaciones del sistema</p>
          </div>
        </div>
        
        <button
          onClick={clearLogs}
          className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition"
          disabled={logs.length === 0}
        >
          Limpiar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Terminal className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No hay acciones registradas</p>
            <p className="text-xs mt-1">Las operaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition"
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {getTypeLabel(log.type)}
                      </span>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {log.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <p className="text-sm">{log.message}</p>
                    
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                          Detalles
                        </summary>
                        <pre className="mt-1 p-2 bg-black/30 rounded text-xs overflow-x-auto">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-gray-900/50">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mb-1" />
            <span className="text-gray-400">Acciones</span>
            <span className="font-medium">{logs.filter(l => l.type === 'action').length}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
            <span className="text-gray-400">Info</span>
            <span className="font-medium">{logs.filter(l => l.type === 'info').length}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mb-1" />
            <span className="text-gray-400">Advertencias</span>
            <span className="font-medium">{logs.filter(l => l.type === 'warning').length}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mb-1" />
            <span className="text-gray-400">Errores</span>
            <span className="font-medium">{logs.filter(l => l.type === 'error').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionLog