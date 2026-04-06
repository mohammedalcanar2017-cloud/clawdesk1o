import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { emit, listen } from '@tauri-apps/api/event'

export interface AIConfig {
  provider: 'deepseek' | 'openai' | 'anthropic' | 'local' | 'custom'
  apiKey: string
  model: string
  endpoint?: string
  maxTokens: number
  temperature: number
}

export interface VisionConfig {
  localAnalysis: boolean
  screenshotQuality: number
  maxWidth: number
  detectChanges: boolean
  useOCR: boolean
}

export interface ControlConfig {
  safeMode: boolean
  requireConfirmation: boolean
  clickDelay: number
  typingSpeed: number
  allowedApps: string[]
}

export interface EngineConfig {
  useLocalProcessing: boolean
  cacheScreenshots: boolean
  maxCacheSizeMB: number
}

export interface AppConfig {
  version: string
  ai: AIConfig
  vision: VisionConfig
  control: ControlConfig
  engine: EngineConfig
  firstRun: boolean
}

const DEFAULT_CONFIG: AppConfig = {
  version: '1.0.0',
  ai: {
    provider: 'deepseek', // Producto independiente
    apiKey: '',
    model: 'deepseek-chat',
    endpoint: 'https://api.deepseek.com',
    maxTokens: 4000,
    temperature: 0.7
  },
  vision: {
    localAnalysis: true,
    screenshotQuality: 40,
    maxWidth: 640,
    detectChanges: true,
    useOCR: true
  },
  control: {
    safeMode: true,
    requireConfirmation: true,
    clickDelay: 100,
    typingSpeed: 50,
    allowedApps: ['chrome', 'vscode', 'terminal', 'firefox', 'edge']
  },
  engine: {
    useLocalProcessing: true,
    cacheScreenshots: true,
    maxCacheSizeMB: 100
  },
  firstRun: true
}

class ConfigManager {
  private config: AppConfig = DEFAULT_CONFIG
  private configPath = 'clawdesk-config.json'
  private listeners: Array<(config: AppConfig) => void> = []

  constructor() {
    this.loadConfig()
  }

  async loadConfig() {
    try {
      // Primero intentar cargar configuración existente
      if (await exists(this.configPath, { dir: BaseDirectory.AppConfig })) {
        const content = await readTextFile(this.configPath, { dir: BaseDirectory.AppConfig })
        const saved = JSON.parse(content)
        
        // Merge con defaults (para nuevas propiedades)
        this.config = { ...DEFAULT_CONFIG, ...saved, version: DEFAULT_CONFIG.version }
        
        // Si es primera ejecución, intentar importar de OpenClaw
        if (this.config.firstRun && this.config.openclaw.useExistingConfig) {
          await this.importFromOpenClaw()
        }
      } else {
        this.config = DEFAULT_CONFIG
        await this.saveConfig()
      }
      
      this.notifyListeners()
    } catch (error) {
      console.error('Error loading config:', error)
      this.config = DEFAULT_CONFIG
    }
  }

  async saveConfig() {
    try {
      await createDir('', { dir: BaseDirectory.AppConfig, recursive: true })
      await writeTextFile(this.configPath, JSON.stringify(this.config, null, 2), {
        dir: BaseDirectory.AppConfig
      })
      
      this.notifyListeners()
      emit('config:updated', this.config)
      
      return true
    } catch (error) {
      console.error('Error saving config:', error)
      return false
    }
  }

  async importFromOpenClaw() {
    // Este método ya no es necesario para producto independiente
    // Se mantiene por compatibilidad pero no hace nada
    console.log('Producto independiente - sin importación de OpenClaw')
    return false
  }

  private async readOpenClawConfig(): Promise<any> {
    // No leer configuración de OpenClaw
    return null
  }

  getConfig(): AppConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AppConfig>) {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
  }

  updateAIConfig(updates: Partial<AIConfig>) {
    this.config.ai = { ...this.config.ai, ...updates }
    this.saveConfig()
  }

  updateControlConfig(updates: Partial<ControlConfig>) {
    this.config.control = { ...this.config.control, ...updates }
    this.saveConfig()
  }

  resetToDefaults() {
    this.config = DEFAULT_CONFIG
    this.saveConfig()
  }

  subscribe(listener: (config: AppConfig) => void) {
    this.listeners.push(listener)
    listener(this.config) // Llamar inmediatamente con config actual
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.config)
    }
  }

  // Helper para verificar si está configurado
  isConfigured(): boolean {
    return !this.config.firstRun && this.config.ai.apiKey !== ''
  }

  // Helper para obtener proveedor configurado
  getProviderName(): string {
    switch (this.config.ai.provider) {
      case 'openai': return 'OpenAI GPT'
      case 'anthropic': return 'Anthropic Claude'
      case 'deepseek': return 'DeepSeek'
      case 'local': return 'Modelo Local (Ollama)'
      case 'custom': return 'Endpoint Personalizado'
      default: return 'DeepSeek (por defecto)'
    }
  }
}

// Singleton global
export const configManager = new ConfigManager()

// Helper para uso en componentes
export const useConfig = () => {
  return configManager
}