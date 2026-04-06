import React, { useEffect, useState } from 'react'
import { Target, X } from 'lucide-react'
import { useStore } from '../lib/store'

const ScreenGuideOverlay: React.FC = () => {
  const { guides, removeGuide, clearGuides } = useStore()
  const [visible, setVisible] = useState(true)

  if (!visible || guides.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {guides.map((guide) => (
        <div
          key={guide.id}
          className="screen-guide animate-pulse-slow"
          style={{
            left: `${guide.x}px`,
            top: `${guide.y}px`,
            width: `${guide.width}px`,
            height: `${guide.height}px`,
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-auto">
            <div className="flex items-center">
              <Target className="w-3 h-3 mr-1" />
              {guide.label}
              <button
                onClick={() => removeGuide(guide.id)}
                className="ml-2 hover:bg-blue-700 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Punto central */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
          
          {/* Coordenadas */}
          <div className="absolute bottom-0 left-0 transform translate-y-full bg-black/70 text-white text-xs px-2 py-1 rounded-br">
            {guide.x + guide.width / 2}, {guide.y + guide.height / 2}
          </div>
        </div>
      ))}
      
      {/* Panel de control flotante */}
      <div className="fixed bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium">Guías de Pantalla</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-300 mb-2">
          {guides.length} guía(s) activa(s)
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={clearGuides}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1 rounded transition"
          >
            Limpiar Todas
          </button>
          <button
            onClick={() => setVisible(!visible)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-1 rounded transition"
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScreenGuideOverlay