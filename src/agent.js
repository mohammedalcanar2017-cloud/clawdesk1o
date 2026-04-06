// 🤖 CLAWDESK AGENT REAL - Sistema completo como OpenClaw
const { CLAWDESKBrain } = require('./brain');
const { VisionSystem } = require('./vision');
const { SystemControl } = require('./control');

class CLAWDESKAgent {
  constructor(config = {}) {
    // Configuración
    this.config = {
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
      apiProvider: config.apiProvider || 'deepseek',
      safeMode: config.safeMode !== false,
      autoRetry: config.autoRetry !== false,
      maxRetries: config.maxRetries || 3,
      ...config
    };
    
    // Componentes
    this.brain = new CLAWDESKBrain(this.config.apiKey, this.config.apiProvider);
    this.vision = new VisionSystem();
    this.control = new SystemControl();
    
    // Estado
    this.isRunning = false;
    this.currentTask = null;
    this.taskHistory = [];
    this.logs = [];
    
    // Overlay visual
    this.overlay = {
      show: false,
      guides: [],
      highlights: []
    };
    
    console.log('🤖 CLAWDESK AGENT REAL inicializado');
    console.log('📊 Capacidades:', this.getCapabilities());
  }
  
  async executeGoal(goal) {
    if (this.isRunning) {
      throw new Error('El agente ya está ejecutando una tarea');
    }
    
    this.isRunning = true;
    const taskId = `task-${Date.now()}`;
    const startTime = Date.now();
    
    this.currentTask = {
      id: taskId,
      goal,
      status: 'starting',
      steps: [],
      createdAt: new Date(),
      startedAt: new Date()
    };
    
    this.addLog('🎯', `Iniciando tarea: "${goal}"`);
    
    try {
      // 1. CAPTURAR PANTALLA REAL
      this.addLog('📸', 'Capturando pantalla...');
      const screenshot = await this.vision.captureScreen();
      
      if (!screenshot.success) {
        throw new Error(`Error capturando pantalla: ${screenshot.error}`);
      }
      
      // 2. IA PIENSA Y PLANIFICA (como OpenClaw)
      this.addLog('🧠', 'IA pensando y planificando...');
      this.currentTask.status = 'planning';
      
      const plan = await this.brain.think(goal, screenshot.data);
      this.addLog('📋', `Plan generado: ${plan.plan.length} pasos`);
      
      // 3. EJECUTAR PLAN CON SCRIPTS DINÁMICOS
      this.currentTask.status = 'executing';
      this.currentTask.plan = plan;
      this.currentTask.steps = plan.plan.map(step => ({
        ...step,
        status: 'pending',
        result: null,
        startedAt: null,
        completedAt: null
      }));
      
      const executionResults = await this.executePlan(plan, screenshot.data);
      
      // 4. FINALIZAR
      const endTime = Date.now();
      const executionTime = Math.round((endTime - startTime) / 1000);
      
      this.currentTask.status = 'completed';
      this.currentTask.completedAt = new Date();
      this.currentTask.executionTime = executionTime;
      this.currentTask.results = executionResults;
      
      this.taskHistory.push({ ...this.currentTask });
      
      this.addLog('✅', `Tarea completada en ${executionTime}s`);
      
      return {
        success: true,
        taskId,
        executionTime,
        steps: executionResults.steps,
        plan: plan
      };
      
    } catch (error) {
      this.currentTask.status = 'failed';
      this.currentTask.error = error.message;
      this.currentTask.completedAt = new Date();
      
      this.addLog('❌', `Error: ${error.message}`);
      
      return {
        success: false,
        taskId,
        error: error.message,
        steps: this.currentTask.steps
      };
      
    } finally {
      this.isRunning = false;
      this.hideOverlay();
    }
  }
  
  async executePlan(plan, screenshotBase64) {
    const results = {
      steps: [],
      success: true,
      errors: []
    };
    
    for (let i = 0; i < plan.plan.length; i++) {
      const step = plan.plan[i];
      const taskStep = this.currentTask.steps[i];
      
      taskStep.status = 'executing';
      taskStep.startedAt = new Date();
      
      this.addLog('⚡', `Ejecutando paso ${i + 1}: ${step.description}`);
      
      try {
        // Mostrar guía visual
        if (step.params?.x && step.params?.y) {
          this.showGuide(step.params.x, step.params.y, `Paso ${i + 1}: ${step.action}`);
        }
        
        // Ejecutar acción
        const result = await this.executeStep(step, screenshotBase64);
        
        taskStep.status = 'completed';
        taskStep.result = result;
        taskStep.completedAt = new Date();
        
        results.steps.push({
          step: i + 1,
          action: step.action,
          success: true,
          result
        });
        
        this.addLog('✅', `Paso ${i + 1} completado: ${step.verification}`);
        
        // Esperar si hay delay configurado
        if (step.delay_after) {
          await this.control.wait(step.delay_after / 1000);
        }
        
      } catch (error) {
        taskStep.status = 'failed';
        taskStep.result = { error: error.message };
        taskStep.completedAt = new Date();
        
        results.steps.push({
          step: i + 1,
          action: step.action,
          success: false,
          error: error.message
        });
        
        results.errors.push(error.message);
        results.success = false;
        
        this.addLog('❌', `Paso ${i + 1} falló: ${error.message}`);
        
        // Intentar alternativa si existe
        if (step.alternatives && step.alternatives.length > 0) {
          this.addLog('🔄', `Intentando alternativa...`);
          // TODO: Implementar alternativas
        }
        
        // Si no hay auto-retry, continuar con siguiente paso
        if (!this.config.autoRetry) {
          continue;
        }
      }
    }
    
    return results;
  }
  
  async executeStep(step, screenshotBase64) {
    switch (step.action) {
      case 'click':
        return await this.control.click(step.params.x, step.params.y, step.params.button);
        
      case 'type':
        return await this.control.type(step.params.text);
        
      case 'keypress':
        return await this.control.pressKey(step.params.key);
        
      case 'open_app':
        return await this.control.openApp(step.params.app_name);
        
      case 'find_and_click':
        // Script dinámico: encontrar elemento y hacer clic
        const element = await this.vision.findElement(step.params.element, screenshotBase64);
        
        if (!element.success) {
          throw new Error(`No se pudo encontrar elemento: ${element.error}`);
        }
        
        if (!element.found && this.config.safeMode) {
          throw new Error(`Elemento "${step.params.element}" no encontrado. Safe Mode activado.`);
        }
        
        return await this.control.click(element.coordinates.x, element.coordinates.y);
        
      case 'wait':
        return await this.control.wait(step.params.seconds);
        
      case 'capture_screen':
        const screenshot = await this.vision.captureScreen();
        if (!screenshot.success) {
          throw new Error(`Error capturando pantalla: ${screenshot.error}`);
        }
        return screenshot;
        
      case 'analyze_screen':
        return await this.vision.analyzeScreen(screenshotBase64);
        
      default:
        throw new Error(`Acción no soportada: ${step.action}`);
    }
  }
  
  showGuide(x, y, label) {
    this.overlay.show = true;
    this.overlay.guides.push({
      x, y, label,
      color: '#3b82f6',
      timestamp: Date.now()
    });
    
    // Quitar después de 2 segundos
    setTimeout(() => {
      this.overlay.guides = this.overlay.guides.filter(g => g.timestamp !== this.overlay.guides[0]?.timestamp);
      if (this.overlay.guides.length === 0) {
        this.overlay.show = false;
      }
    }, 2000);
  }
  
  hideOverlay() {
    this.overlay = {
      show: false,
      guides: [],
      highlights: []
    };
  }
  
  addLog(emoji, message, data = null) {
    const log = {
      timestamp: new Date(),
      emoji,
      message,
      data,
      taskId: this.currentTask?.id
    };
    
    this.logs.push(log);
    
    // Mantener máximo 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    
    console.log(`[${emoji}] ${message}`);
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask,
      capabilities: this.getCapabilities(),
      memory: this.brain.getMemorySummary(),
      logs: this.logs.slice(-10),
      overlay: this.overlay
    };
  }
  
  getCapabilities() {
    return {
      brain: {
        provider: this.config.apiProvider,
        hasApiKey: !!this.config.apiKey,
        memorySize: this.brain.memory.length
      },
      vision: this.vision.getCapabilities(),
      control: this.control.getCapabilities(),
      platform: process.platform,
      version: '1.0.0-REAL'
    };
  }
  
  stop() {
    this.isRunning = false;
    this.hideOverlay();
    this.addLog('⏹️', 'Agente detenido');
  }
  
  clearHistory() {
    this.taskHistory = [];
    this.logs = [];
    this.brain.memory = [];
    this.addLog('🧹', 'Historial limpiado');
  }
}

module.exports = { CLAWDESKAgent };