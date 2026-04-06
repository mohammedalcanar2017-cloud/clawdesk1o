// 🛠️ CLAWDESK CONTROL - Control REAL del sistema
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class SystemControl {
  constructor() {
    this.robot = null;
    this.platform = process.platform;
    this.init();
  }
  
  async init() {
    try {
      this.robot = require('robotjs');
      console.log('✅ robotjs loaded');
    } catch (error) {
      console.log('⚠️ robotjs not available (simulated control)');
      this.robot = {
        moveMouse: (x, y) => console.log(`🖱️ Simulated move to (${x}, ${y})`),
        mouseClick: (button = 'left') => console.log(`🖱️ Simulated ${button} click`),
        typeString: (text) => console.log(`⌨️ Simulated type: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`),
        keyTap: (key) => console.log(`⌨️ Simulated key press: ${key}`),
        scrollMouse: (x, y) => console.log(`🔄 Simulated scroll: x=${x}, y=${y}`)
      };
    }
  }
  
  async click(x, y, button = 'left') {
    console.log(`🖱️ Click at (${x}, ${y}) with ${button} button`);
    
    try {
      if (this.robot && typeof this.robot.moveMouse === 'function') {
        // Control REAL con robotjs
        this.robot.moveMouse(x, y);
        this.robot.mouseClick(button);
        return { success: true, real: true, coordinates: { x, y } };
        
      } else if (this.platform === 'darwin') {
        // macOS con AppleScript
        await execAsync(`osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`);
        return { success: true, real: true, method: 'applescript', coordinates: { x, y } };
        
      } else {
        // Simulación
        console.log(`🖱️ Simulated click at (${x}, ${y})`);
        return { success: true, real: false, simulated: true, coordinates: { x, y } };
      }
      
    } catch (error) {
      console.error('❌ Error en click:', error);
      return { success: false, error: error.message };
    }
  }
  
  async type(text) {
    console.log(`⌨️ Typing: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    try {
      if (this.robot && typeof this.robot.typeString === 'function') {
        // Escritura REAL con robotjs
        this.robot.typeString(text);
        return { success: true, real: true, text };
        
      } else if (this.platform === 'darwin') {
        // macOS con AppleScript
        const escaped = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
        await execAsync(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`);
        return { success: true, real: true, method: 'applescript', text };
        
      } else {
        // Simulación
        console.log(`⌨️ Simulated typing: "${text}"`);
        return { success: true, real: false, simulated: true, text };
      }
      
    } catch (error) {
      console.error('❌ Error en type:', error);
      return { success: false, error: error.message };
    }
  }
  
  async pressKey(key) {
    console.log(`⌨️ Pressing key: ${key}`);
    
    try {
      if (this.robot && typeof this.robot.keyTap === 'function') {
        // Tecla REAL con robotjs
        this.robot.keyTap(key.toLowerCase());
        return { success: true, real: true, key };
        
      } else if (this.platform === 'darwin') {
        // macOS con AppleScript
        await execAsync(`osascript -e 'tell application "System Events" to keystroke "${key}"'`);
        return { success: true, real: true, method: 'applescript', key };
        
      } else {
        // Simulación
        console.log(`⌨️ Simulated key press: ${key}`);
        return { success: true, real: false, simulated: true, key };
      }
      
    } catch (error) {
      console.error('❌ Error en pressKey:', error);
      return { success: false, error: error.message };
    }
  }
  
  async openApp(appName) {
    console.log(`🚀 Opening app: ${appName}`);
    
    try {
      if (this.platform === 'darwin') {
        // macOS: abrir con open -a
        await execAsync(`open -a "${appName}"`);
        return { success: true, real: true, appName };
        
      } else if (this.platform === 'win32') {
        // Windows: usar start
        await execAsync(`start "" "${appName}"`);
        return { success: true, real: true, appName };
        
      } else if (this.platform === 'linux') {
        // Linux: intentar con xdg-open
        await execAsync(`xdg-open "${appName}"`);
        return { success: true, real: true, appName };
        
      } else {
        // Simulación
        console.log(`🚀 Simulated: Opening ${appName}`);
        return { success: true, real: false, simulated: true, appName };
      }
      
    } catch (error) {
      console.error('❌ Error opening app:', error);
      return { success: false, error: error.message };
    }
  }
  
  async executeAppleScript(script) {
    if (this.platform !== 'darwin') {
      return { success: false, error: 'AppleScript solo disponible en macOS' };
    }
    
    console.log(`🍎 Executing AppleScript: ${script.substring(0, 100)}...`);
    
    try {
      const { stdout, stderr } = await execAsync(`osascript -e '${script}'`);
      return { 
        success: true, 
        real: true, 
        stdout: stdout.trim(), 
        stderr: stderr.trim() 
      };
    } catch (error) {
      console.error('❌ Error en AppleScript:', error);
      return { success: false, error: error.message };
    }
  }
  
  async dragAndDrop(fromX, fromY, toX, toY) {
    console.log(`↔️ Drag from (${fromX}, ${fromY}) to (${toX}, ${toY})`);
    
    try {
      if (this.robot && typeof this.robot.dragMouse === 'function') {
        // Arrastre REAL con robotjs
        this.robot.moveMouse(fromX, fromY);
        this.robot.mouseToggle('down');
        this.robot.moveMouse(toX, toY);
        this.robot.mouseToggle('up');
        return { success: true, real: true };
        
      } else {
        // Simulación
        console.log(`↔️ Simulated drag and drop`);
        return { success: true, real: false, simulated: true };
      }
      
    } catch (error) {
      console.error('❌ Error en dragAndDrop:', error);
      return { success: false, error: error.message };
    }
  }
  
  async scroll(direction, amount = 1) {
    console.log(`🔄 Scroll ${direction} ${amount} times`);
    
    try {
      if (this.robot && typeof this.robot.scrollMouse === 'function') {
        // Scroll REAL con robotjs
        const y = direction === 'up' ? 1 : -1;
        for (let i = 0; i < amount; i++) {
          this.robot.scrollMouse(0, y);
          await this.delay(100);
        }
        return { success: true, real: true };
        
      } else {
        // Simulación
        console.log(`🔄 Simulated scroll ${direction}`);
        return { success: true, real: false, simulated: true };
      }
      
    } catch (error) {
      console.error('❌ Error en scroll:', error);
      return { success: false, error: error.message };
    }
  }
  
  async wait(seconds) {
    console.log(`⏳ Waiting ${seconds} seconds`);
    await this.delay(seconds * 1000);
    return { success: true };
  }
  
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async getMousePosition() {
    try {
      if (this.robot && typeof this.robot.getMousePos === 'function') {
        const pos = this.robot.getMousePos();
        return { success: true, x: pos.x, y: pos.y, real: true };
      } else {
        // Posición simulada
        return { success: true, x: 500, y: 300, real: false, simulated: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async getScreenInfo() {
    try {
      if (this.robot && typeof this.robot.getScreenSize === 'function') {
        const size = this.robot.getScreenSize();
        return { 
          success: true, 
          width: size.width, 
          height: size.height,
          real: true 
        };
      } else {
        // Información simulada
        return { 
          success: true, 
          width: 1440, 
          height: 900,
          real: false,
          simulated: true 
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  getCapabilities() {
    return {
      platform: this.platform,
      robotjs_available: !!this.robot && typeof this.robot.moveMouse === 'function',
      applescript_available: this.platform === 'darwin',
      real_control: !!this.robot && typeof this.robot.moveMouse === 'function',
      simulated: !this.robot || typeof this.robot.moveMouse !== 'function'
    };
  }
}

module.exports = { SystemControl };