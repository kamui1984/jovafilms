#!/bin/bash

# Script final para corregir el frontend
# Ejecutar en Run Command de la VM

set -e

echo "🔧 Solución final para el frontend..."

FRONTEND_DIR="/home/azureuser/jovafilms/frontend"
BACKEND_IP="172.17.0.4"

cd "$FRONTEND_DIR"

echo "1️⃣ Verificando código actual..."
echo "Buscando referencias a localhost:3000 en el código fuente..."
if grep -r "localhost:3000" src/ 2>/dev/null; then
    echo "⚠️  Se encontraron referencias a localhost:3000 en el código"
    echo "   Esto se corregirá con el nuevo código"
else
    echo "✅ No se encontraron referencias problemáticas"
fi

echo ""
echo "2️⃣ Verificando .env..."
if [ -f .env ]; then
    echo "Contenido actual:"
    cat .env
else
    echo "⚠️  No existe .env"
fi

echo ""
echo "3️⃣ Creando .env con VITE_API_URL=/api..."
cat > .env << 'EOF'
VITE_API_URL=/api
EOF

echo "✅ .env creado:"
cat .env

echo ""
echo "4️⃣ Limpiando completamente..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/
rm -rf .cache/

echo ""
echo "5️⃣ Verificando que el código fuente use /api por defecto..."
# Verificar que api.ts tenga el código correcto
if grep -q "import.meta.env.DEV" src/services/api.ts 2>/dev/null; then
    echo "✅ El código fuente ya está actualizado"
else
    echo "⚠️  El código fuente necesita actualización"
    echo "   (Esto debería haberse hecho en el repositorio)"
fi

echo ""
echo "6️⃣ Reconstruyendo frontend..."
export VITE_API_URL=/api
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi

echo ""
echo "7️⃣ Verificando el build resultante..."
echo "Buscando localhost:3000 en dist/..."
if grep -r "localhost:3000" dist/ 2>/dev/null; then
    echo "❌ PROBLEMA: Se encontró localhost:3000 en el build"
    echo ""
    echo "Archivos que contienen localhost:3000:"
    grep -r "localhost:3000" dist/ 2>/dev/null | head -5
    echo ""
    echo "⚠️  Esto significa que el código fuente todavía tiene el fallback"
    echo "   Necesitas actualizar el código en el repositorio"
else
    echo "✅ No se encontró localhost:3000 en el build"
fi

echo ""
echo "Buscando /api en dist/..."
if grep -r '"/api"' dist/ 2>/dev/null || grep -r "'/api'" dist/ 2>/dev/null; then
    echo "✅ Se encontró /api en el build (correcto)"
    echo ""
    echo "Ejemplos:"
    grep -r '"/api"' dist/ 2>/dev/null | head -3 || grep -r "'/api'" dist/ 2>/dev/null | head -3
else
    echo "⚠️  No se encontró /api en el build"
fi

echo ""
echo "8️⃣ Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "========================================="
echo "✅ Proceso completado"
echo "========================================="
echo ""
echo "Si todavía ves localhost:3000:"
echo "1. El código fuente necesita actualización"
echo "2. Verifica que src/services/api.ts use '/api' por defecto"
echo "3. Haz commit y push del cambio"
echo "4. Vuelve a ejecutar este script"
echo ""
echo "Para verificar el build actual:"
echo "  grep -r 'localhost:3000' $FRONTEND_DIR/dist/ || echo 'OK'"
echo ""

