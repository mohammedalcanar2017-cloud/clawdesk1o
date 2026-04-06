#!/bin/bash
# Ejecutar CLAWDESK AGENT en modo SIMULADO (sin dependencias complejas)

echo "🤖 CLAWDESK AGENT - MODO SIMULADO"
echo "=================================="

echo "📦 Paso 1: Verificar dependencias básicas..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js primero."
    exit 1
fi

echo "✅ Node.js: $(node --version)"

echo ""
echo "📦 Paso 2: Instalar dependencias SIMPLES (sin módulos nativos)..."
rm -rf node_modules package-lock.json

# Crear package.json simplificado
cat > package.json << 'EOF'
{
  "name": "clawdesk-agent",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "electron": "^28.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF

npm install

echo ""
echo "📦 Paso 3: Construir frontend..."
if ! command -v vite &> /dev/null; then
    echo "⚠️ Vite no encontrado, instalando..."
    npm install -g vite 2>/dev/null || npx vite build
fi

npm run build

if [ $? -ne 0 ]; then
    echo "⚠️ Intentando construir con npx..."
    npx vite build
fi

echo ""
echo "🎯 ¡LISTO PARA EJECUTAR!"
echo ""
echo "🚀 CARACTERÍSTICAS DEL MODO SIMULADO:"
echo "   1. 🤖 AGENTE AUTÓNOMO - Planifica tareas complejas"
echo "   2. 🧠 IA SIMULADA - Sin necesidad de API key"
echo "   3. 🎯 OVERLAY VISUAL - Cruces y guías en pantalla"
echo "   4. 📊 LOGS EN TIEMPO REAL - Ve qué está haciendo"
echo "   5. ⚡ ACCIONES SIMULADAS - Sin control real (pero muestra cómo sería)"
echo ""
echo "💬 EJEMPLOS QUE FUNCIONAN:"
echo "   \"Abre Chrome y busca 'clima en Madrid'\""
echo "   \"Organiza los archivos del escritorio\""
echo "   \"Configura mi correo electrónico\""
echo ""
echo "🔧 PARA CONTROL REAL (opcional):"
echo "   1. Instala Xcode Command Line Tools: xcode-select --install"
echo "   2. Luego ejecuta: ./install-native.sh"
echo ""
echo "🎮 PARA EJECUTAR:"
echo "   npm start"
echo ""
echo "📱 PARA CONSTRUIR APP:"
echo "   ./build-mac-fixed.sh"
echo ""
echo "⚠️ NOTA: Este es el MODO DEMO. Muestra todas las funcionalidades pero simula las acciones."