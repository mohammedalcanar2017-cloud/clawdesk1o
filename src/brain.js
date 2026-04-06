// 🧠 CLAWDESK BRAIN - IA REAL como OpenClaw
const axios = require('axios');

class CLAWDESKBrain {
  constructor(apiKey, provider = 'deepseek') {
    this.apiKey = apiKey;
    this.provider = provider;
    this.memory = [];
    this.context = {};
    this.maxMemory = 50;
  }
  
  async think(goal, screenshotBase64 = null) {
    console.log('🧠 IA pensando...');
    
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(goal, screenshotBase64);
    
    try {
      const response = await this.callVisionAI(systemPrompt, userPrompt, screenshotBase64);
      const plan = this.parsePlan(response);
      
      // Guardar en memoria
      this.memory.push({
        timestamp: new Date(),
        goal,
        plan,
        success: null
      });
      
      if (this.memory.length > this.maxMemory) {
        this.memory.shift();
      }
      
      return plan;
      
    } catch (error) {
      console.error('❌ Error en IA:', error);
      return this.fallbackPlan(goal);
    }
  }
  
  buildSystemPrompt() {
    return `Eres CLAWDESK, un agente autónomo de IA que CONTROLA ORDENADORES.

TU MISIÓN: Ejecutar objetivos complejos de manera autónoma.

REGLAS:
1. Analiza la imagen de pantalla (si se proporciona)
2. Piensa en los pasos necesarios para lograr el objetivo
3. Genera un plan de acción DETALLADO y EJECUTABLE
4. Incluye coordenadas ESPECÍFICAS cuando sea posible
5. Considera tiempos de espera entre acciones
6. Planifica verificaciones para cada paso
7. Incluye alternativas por si algo falla

FORMATO DE RESPUESTA (JSON):
{
  "thought": "Tu análisis y razonamiento",
  "plan": [
    {
      "step": 1,
      "action": "tipo_de_accion",
      "description": "Descripción humana del paso",
      "params": { ...parámetros específicos... },
      "verification": "Cómo verificar que este paso tuvo éxito",
      "alternatives": ["acción_alternativa_si_falla"],
      "delay_after": 1000
    }
  ],
  "estimated_time": "Tiempo estimado en segundos",
  "risk_level": "bajo|medio|alto",
  "requires_confirmation": true|false
}

TIPOS DE ACCIÓN DISPONIBLES:
- "click": { "x": número, "y": número }
- "type": { "text": "texto a escribir" }
- "keypress": { "key": "nombre_tecla" }
- "open_app": { "app_name": "NombreApp" }
- "find_and_click": { "element": "descripción del elemento" }
- "wait": { "seconds": número }
- "capture_screen": {}
- "analyze_screen": { "looking_for": "qué buscar" }

CONTEXTO ACTUAL DEL SISTEMA:
- Plataforma: ${process.platform}
- Hora: ${new Date().toLocaleTimeString()}
- Memoria de acciones previas: ${this.memory.length} registros`;
  }
  
  buildUserPrompt(goal, screenshotBase64) {
    let prompt = `OBJETIVO DEL USUARIO: "${goal}"\n\n`;
    
    if (screenshotBase64) {
      prompt += `SE HA PROPORCIONADO UNA CAPTURA DE PANTALLA ACTUAL.\n`;
      prompt += `Analiza la imagen para entender el estado actual del sistema.\n`;
    } else {
      prompt += `NO hay captura de pantalla disponible. Basa tu plan en conocimiento general.\n`;
    }
    
    // Añadir contexto de memoria reciente
    if (this.memory.length > 0) {
      prompt += `\nACCIONES RECIENTES:\n`;
      const recent = this.memory.slice(-3);
      recent.forEach((entry, i) => {
        prompt += `${i+1}. "${entry.goal}" - ${entry.success ? '✅' : '❌'}\n`;
      });
    }
    
    prompt += `\nGENERA UN PLAN INTELIGENTE PARA: "${goal}"`;
    
    return prompt;
  }
  
  async callVisionAI(systemPrompt, userPrompt, screenshotBase64) {
    const url = this.provider === 'deepseek' 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: []
      }
    ];
    
    // Añadir texto
    messages[1].content.push({ type: 'text', text: userPrompt });
    
    // Añadir imagen si existe
    if (screenshotBase64 && screenshotBase64 !== 'simulated') {
      messages[1].content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${screenshotBase64}`,
          detail: 'high'
        }
      });
    }
    
    const data = {
      model: this.provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o',
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return response.data.choices[0].message.content;
  }
  
  parsePlan(aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validar estructura básica
      if (!parsed.plan || !Array.isArray(parsed.plan)) {
        throw new Error('Plan inválido de IA');
      }
      
      // Añadir IDs a los pasos
      parsed.plan = parsed.plan.map((step, index) => ({
        id: `step-${Date.now()}-${index}`,
        ...step,
        status: 'pending',
        result: null,
        startedAt: null,
        completedAt: null
      }));
      
      return parsed;
      
    } catch (error) {
      console.error('❌ Error parseando plan de IA:', error);
      console.log('Respuesta cruda de IA:', aiResponse.substring(0, 500));
      return this.fallbackPlan('Error parsing AI response');
    }
  }
  
  fallbackPlan(goal) {
    console.log('🔄 Usando plan de respaldo...');
    
    return {
      thought: "Modo de respaldo activado. Generando plan básico.",
      plan: [
        {
          id: 'step-1',
          step: 1,
          action: 'capture_screen',
          description: 'Capturar pantalla para análisis',
          params: {},
          verification: 'Screenshot capturado',
          alternatives: ['wait'],
          delay_after: 1000,
          status: 'pending'
        },
        {
          id: 'step-2',
          step: 2,
          action: 'wait',
          description: 'Esperar 2 segundos',
          params: { seconds: 2 },
          verification: 'Espera completada',
          alternatives: [],
          delay_after: 0,
          status: 'pending'
        }
      ],
      estimated_time: '5',
      risk_level: 'bajo',
      requires_confirmation: false
    };
  }
  
  async learnFromExecution(goal, plan, results) {
    const learning = {
      timestamp: new Date(),
      goal,
      plan: plan.plan.map(step => ({
        action: step.action,
        success: results.steps.find(s => s.id === step.id)?.success || false
      })),
      total_success: results.success,
      execution_time: results.executionTime
    };
    
    this.memory.push(learning);
    
    // Si fue exitoso, reforzar este tipo de plan
    if (results.success) {
      console.log('📈 Aprendiendo de ejecución exitosa');
    } else {
      console.log('📉 Aprendiendo de errores');
    }
  }
  
  getMemorySummary() {
    const total = this.memory.length;
    const successful = this.memory.filter(m => m.total_success).length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    
    return {
      total_executions: total,
      successful_executions: successful,
      success_rate: `${successRate}%`,
      recent_goals: this.memory.slice(-5).map(m => m.goal.substring(0, 50) + '...')
    };
  }
}

module.exports = { CLAWDESKBrain };