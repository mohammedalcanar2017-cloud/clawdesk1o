# INSTRUCCIONES PARA BUILD macOS

## PRERREQUISITOS
1. Node.js 18+ instalado
2. npm instalado
3. Git instalado

## PASO 1: CLONAR REPOSITORIO
```bash
git clone https://github.com/mohammedalcanar2017-cloud/clawdesk1o.git
cd clawdesk1o
```

## PASO 2: INSTALAR DEPENDENCIAS
```bash
npm install
```

## PASO 3: CONSTRUIR FRONTEND
```bash
npm run build
```

## PASO 4: CREAR ICONOS (necesario para macOS)
```bash
# Crear icono .icns desde el PNG existente
mkdir -p build
cd build

# Si tienes iconutil (macOS)
iconutil -c icns -o icon.icns icon.png 2>/dev/null || echo "iconutil not available"

# Si no, usar sips para crear iconos de diferentes tamaños
sips -z 16 16 icon.png --out icons/icon_16x16.png 2>/dev/null || true
sips -z 32 32 icon.png --out icons/icon_32x32.png 2>/dev/null || true
sips -z 64 64 icon.png --out icons/icon_64x64.png 2>/dev/null || true
sips -z 128 128 icon.png --out icons/icon_128x128.png 2>/dev/null || true
sips -z 256 256 icon.png --out icons/icon_256x256.png 2>/dev/null || true
sips -z 512 512 icon.png --out icons/icon_512x512.png 2>/dev/null || true
```

## PASO 5: CONSTRUIR APP macOS
```bash
# Opción A: Crear .dmg (instalador)
npm run dist:mac-dmg

# Opción B: Crear .app (portable)
npm run dist:mac-app
```

## RESULTADOS
- **.dmg**: `dist/CLAWDESK-1.0.0.dmg` (instalador)
- **.app**: `dist/mac/CLAWDESK.app` (aplicación portable)

## SOLUCIÓN DE PROBLEMAS

### Si electron-builder falla:
```bash
# Reinstalar electron-builder
npm install electron-builder --save-dev

# Limpiar cache
rm -rf node_modules package-lock.json
npm install
```

### Si falta algún paquete:
```bash
npm install electron --save-dev
```

## EJECUTAR DESARROLLO
```bash
npm run dev
```

## SUBIR AL RELEASE
Una vez tengas el .dmg o .app, súbelo manualmente al release en GitHub.