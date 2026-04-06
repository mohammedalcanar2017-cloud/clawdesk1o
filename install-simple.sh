#!/bin/bash
# Instalación SIMPLIFICADA de CLAWDESK AGENT (sin módulos nativos complejos)

echo "🔧 INSTALACIÓN SIMPLIFICADA CLAWDESK AGENT"
echo "=========================================="

echo "📦 Paso 1: Instalar Xcode Command Line Tools..."
xcode-select --install 2>/dev/null || echo "✅ Xcode CLI ya instalado o en proceso"

echo "📦 Paso 2: Instalar git (necesario para Homebrew)..."
brew install git 2>/dev/null || echo "✅ Git ya instalado"

echo "📦 Paso 3: Limpiar node_modules..."
rm -rf node_modules package-lock.json

echo "📦 Paso 4: Instalar dependencias básicas (sin módulos nativos)..."
cat > package-simple.json << 'EOF'
{
  "name": "clawdesk-electron",
  "version": "1.0.0",
  "description": "CLAWDESK AGENT - Autonomous AI Assistant",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"npm run vite\" \"npm run electron\"",
    "vite": "vite",
    "electron": "electron .",
    "build": "vite build",
    "preview": "vite preview",
    "dist": "electron-builder",
    "dist:mac": "electron-builder --mac"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "uuid": "^9.0.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.0",
    "concurrently": "^8.2.2",
    "electron": "^41.1.1",
    "electron-builder": "^24.9.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  },
  "build": {
    "appId": "com.clawdesk.agent",
    "productName": "CLAWDESK AGENT",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "dist/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "artifactName": "${productName}-${version}.${ext}"
    }
  }
}
EOF

# Copiar package.json simple
cp package-simple.json package.json

echo "📦 Paso 5: Instalar npm dependencies..."
npm install

echo "📦 Paso 6: Instalar vite globalmente (si no está)..."
npm install -g vite 2>/dev/null || echo "Vite ya instalado"

echo "📦 Paso 7: Construir frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente"
else
    echo "⚠️ Intentando construir con npx..."
    npx vite build
fi

echo ""
echo "🎯 ¡INSTALACIÓN COMPLETADA!"
echo ""
echo "📋 MODO ACTUAL: SIMULADO"
echo "   - IA planifica tareas"
echo "   - Acciones simuladas (no reales)"
echo "   - Overlay visual funciona"
echo "   - Logs en tiempo real"
echo ""
echo "🔧 PARA CONTROL REAL (opcional):"
echo "   1. Instalar Xcode completo desde App Store"
echo "   2. Ejecutar: sudo xcode-select --switch /Applications/Xcode.app"
echo "   3. Luego: ./install-native.sh"
echo ""
echo "🚀 Para ejecutar: npm start"
echo "📱 Para construir app: ./build-mac-fixed.sh"