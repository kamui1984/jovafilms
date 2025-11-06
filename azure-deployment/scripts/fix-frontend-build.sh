#!/bin/bash

# Script para reconstruir el frontend con la configuración correcta
# Ejecutar en Run Command de la VM

set -e

echo "🔧 Reconstruyendo frontend con configuración correcta..."

FRONTEND_DIR="/home/azureuser/jovafilms/frontend"
BACKEND_IP="172.17.0.4"

cd "$FRONTEND_DIR"

echo "1️⃣ Verificando .env actual..."
if [ -f .env ]; then
    echo "Contenido actual de .env:"
    cat .env
else
    echo "⚠️  No existe .env, creándolo..."
fi

echo ""
echo "2️⃣ Creando .env con VITE_API_URL=/api (ruta relativa)..."
cat > .env << 'EOF'
VITE_API_URL=/api
EOF

echo "✅ Nuevo contenido de .env:"
cat .env

echo ""
echo "3️⃣ Limpiando build anterior completamente..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

echo "✅ Limpieza completada"

echo ""
echo "4️⃣ Reconstruyendo frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi

echo ""
echo "5️⃣ Verificando que el build use la ruta relativa..."
# Buscar en los archivos JS del build si hay referencias a localhost:3000
if grep -r "localhost:3000" dist/ 2>/dev/null; then
    echo "⚠️  ADVERTENCIA: Se encontraron referencias a localhost:3000 en el build"
    echo "   Esto puede indicar que la variable de entorno no se aplicó correctamente"
else
    echo "✅ No se encontraron referencias a localhost:3000 en el build"
fi

# Verificar que use /api
if grep -r '"/api"' dist/ 2>/dev/null || grep -r "'/api'" dist/ 2>/dev/null; then
    echo "✅ Se encontraron referencias a /api en el build (correcto)"
else
    echo "⚠️  No se encontraron referencias a /api en el build"
fi

echo ""
echo "6️⃣ Reiniciando Nginx para servir el nuevo build..."
sudo systemctl restart nginx

echo ""
echo "========================================="
echo "✅ Frontend reconstruido"
echo "========================================="
echo ""
echo "Ahora:"
echo "1. Abre tu navegador"
echo "2. Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac) para limpiar cache"
echo "3. Recarga: http://158.23.59.126"
echo "4. Abre la consola del navegador (F12)"
echo "5. Intenta hacer login"
echo ""
echo "En la consola, deberías ver peticiones a:"
echo "  http://158.23.59.126/api/auth/login"
echo "  (NO debería aparecer localhost:3000)"
echo ""

