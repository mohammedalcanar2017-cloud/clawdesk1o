# 🦀 CLAWDESK Ultimate - AI Desktop Assistant

![CLAWDESK Banner](https://img.shields.io/badge/CLAWDESK-Ultimate-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

**Controla tu PC con inteligencia artificial.** CLAWDESK es un asistente de escritorio que te permite interactuar con tu computadora usando comandos naturales, visión por computadora local y control total del sistema.

## ✨ Características Principales

### 🎯 **Control Inteligente del PC**
- **Comandos naturales**: "Haz clic en 500,300", "Escribe 'Hola Mundo'", "Captura pantalla"
- **Control de ratón/teclado**: Coordenadas precisas, escritura automática
- **Capturas optimizadas**: Compresión inteligente para ahorrar tokens

### 🛡️ **Modo Seguro con Aprobaciones**
- **Safe Mode**: Activa/desactiva aprobaciones para acciones críticas
- **Configuración granular**: Decide qué acciones requieren confirmación
- **Registro completo**: Historial detallado de todas las operaciones

### 🔍 **Visión Local Avanzada**
- **Análisis en tu PC**: TensorFlow.js + Tesseract.js integrados
- **Optimización de tokens**: Solo envía a IA lo necesario
- **Detección de cambios**: Captura solo regiones modificadas

### 💬 **Chat Inteligente Integrado**
- **Análisis de comandos**: Entiende lenguaje natural
- **Ejecución automática**: Detecta y ejecuta acciones
- **Guías visuales**: Overlay con coordenadas en pantalla

## 🚀 Instalación Rápida

### Windows
1. Descarga `CLAWDESK-Setup.exe` desde [Releases](https://github.com/tuusuario/clawdesk/releases)
2. Ejecuta el instalador
3. ¡Listo! No requiere OpenClaw ni dependencias externas

### macOS
1. Descarga `CLAWDESK.dmg`
2. Arrastra a la carpeta Aplicaciones
3. Ejecuta desde Launchpad

### Linux
```bash
# Descarga el AppImage
chmod +x CLAWDESK-x86_64.AppImage
./CLAWDESK-x86_64.AppImage
```

## ⚙️ Configuración

### Primer Uso
Al iniciar por primera vez, un wizard te guiará:
1. **Configurar IA**: DeepSeek (gratis), OpenAI, o modelos locales
2. **Ajustar seguridad**: Activar Safe Mode, definir aprobaciones
3. **Optimizar visión**: Calidad de capturas, procesamiento local
4. **Probar conexiones**: Verificar que todo funcione

### Configuración Avanzada
Accede al panel de configuración para:
- **Cambiar proveedor de IA** (DeepSeek, OpenAI, Anthropic, Local)
- **Ajustar calidad/compresión** de capturas
- **Definir aplicaciones permitidas**
- **Exportar/importar** configuración

## 🎯 Uso Básico

### Comandos de Ejemplo
```
"Captura la pantalla"
"Haz clic en 800,400"
"Escribe 'correo@ejemplo.com'"
"Presiona Enter"
"Mostrar coordenadas 300,200"
```

### Características Avanzadas
- **Guías visuales**: Bordes parpadeantes para coordenadas
- **Cache inteligente**: Almacena capturas para análisis rápido
- **OCR integrado**: Extrae texto de imágenes localmente
- **Soporte multi-pantalla**: Detecta y usa todos los monitores

## 🔧 Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Tauri (Rust) para control nativo del sistema
- **IA**: DeepSeek API, OpenAI, modelos locales (Ollama)
- **Visión**: TensorFlow.js, Tesseract.js, optimización WebP
- **Empaquetado**: Ejecutables nativos para Windows/macOS/Linux

## 📦 Build desde Código

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/clawdesk.git
cd clawdesk

# Instalar dependencias
npm install

# Desarrollo
npm run tauri dev

# Build para producción
npm run tauri build

# Build específico
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo licencia MIT. Ver `LICENSE` para más información.

## 🐛 Reportar Issues

Encuentras un bug o tienes una sugerencia? [Abre un issue](https://github.com/tuusuario/clawdesk/issues).

## 🌟 Características Próximas

- [ ] Plugin system para extensibilidad
- [ ] Soporte para más proveedores de IA
- [ ] Reconocimiento de voz
- [ ] Automatización de workflows
- [ ] Integración con APIs populares

---

**CLAWDESK Ultimate** - Tu asistente de IA para controlar el PC. 🦀

*¿Preguntas?* Abre un issue o únete a nuestra comunidad.