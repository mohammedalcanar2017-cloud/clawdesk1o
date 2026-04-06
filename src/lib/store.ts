import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LogEntry {
  id: string
  timestamp: Date
  message: string
  type: 'info' | 'warning' | 'error' | 'action' | 'system'
  details?: any
}

interface StoreState {
  // Safe Mode
  safeMode: boolean
  requireApproval: string[]
  toggleSafeMode: () => void
  setRequireApproval: (actions: string[]) => void
  
  // Action Log
  logs: LogEntry[]
  addLog: (message: string, type: LogEntry['type'], details?: any) => void
  clearLogs: () => void
  
  // Screen Guides
  guides: Array<{id: string, x: number, y: number, width: number, height: number, label: string}>
  addGuide: (x: number, y: number, width: number, height: number, label: string) => void
  removeGuide: (id: string) => void
  clearGuides: () => void
  
  // AI Context
  aiContext: string[]
  addContext: (context: string) => void
  clearContext: () => void
  
  // Connection
  connected: boolean
  setConnected: (connected: boolean) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Safe Mode
      safeMode: true,
      requireApproval: ['click', 'type', 'key', 'screen_capture', 'file_access', 'network'],
      
      toggleSafeMode: () => set(state => ({ safeMode: !state.safeMode })),
      setRequireApproval: (actions) => set({ requireApproval: actions }),
      
      // Action Log
      logs: [],
      addLog: (message, type, details) => set(state => ({
        logs: [
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            message,
            type,
            details
          },
          ...state.logs.slice(0, 49) // Mantener solo 50 entradas
        ]
      })),
      clearLogs: () => set({ logs: [] }),
      
      // Screen Guides
      guides: [],
      addGuide: (x, y, width, height, label) => set(state => ({
        guides: [
          ...state.guides,
          {
            id: Math.random().toString(36).substr(2, 9),
            x, y, width, height, label
          }
        ]
      })),
      removeGuide: (id) => set(state => ({
        guides: state.guides.filter(guide => guide.id !== id)
      })),
      clearGuides: () => set({ guides: [] }),
      
      // AI Context
      aiContext: [],
      addContext: (context) => set(state => ({
        aiContext: [...state.aiContext, context].slice(-10) // Mantener 10 últimos
      })),
      clearContext: () => set({ aiContext: [] }),
      
      // Connection
      connected: false,
      setConnected: (connected) => set({ connected }),
    }),
    {
      name: 'clawdesk-storage',
      partialize: (state) => ({
        safeMode: state.safeMode,
        requireApproval: state.requireApproval,
        aiContext: state.aiContext,
      })
    }
  )
)

// Helper para verificar si una acción necesita aprobación
export const needsApproval = (action: string): boolean => {
  const { safeMode, requireApproval } = useStore.getState()
  return safeMode && requireApproval.includes(action)
}

// Helper para acciones seguras
export const safeInvoke = async <T>(
  action: string,
  command: string,
  args: any = {}
): Promise<T> => {
  const { addLog } = useStore.getState()
  
  if (needsApproval(action)) {
    addLog(`⏳ Necesita aprobación: ${action}`, 'warning', args)
    
    // En una implementación real, mostraría un modal de aprobación
    const approved = window.confirm(`¿Aprobar acción: ${action}?\n${JSON.stringify(args, null, 2)}`)
    
    if (!approved) {
      addLog(`❌ Acción rechazada: ${action}`, 'warning')
      throw new Error(`Action ${action} was not approved`)
    }
    
    addLog(`✅ Aprobado: ${action}`, 'action', args)
  }
  
  addLog(`▶️ Ejecutando: ${action}`, 'action', args)
  
  try {
    // @ts-ignore - invoke viene de Tauri
    const result = await window.__TAURI__.invoke(command, args)
    addLog(`✅ Completado: ${action}`, 'info', result)
    return result
  } catch (error) {
    addLog(`❌ Error en ${action}: ${error}`, 'error')
    throw error
  }
}