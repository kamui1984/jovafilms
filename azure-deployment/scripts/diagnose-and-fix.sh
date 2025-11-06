#!/bin/bash

# Script de diagnóstico y corrección agresiva
# Ejecutar en Run Command de la VM

set -e

FRONTEND_DIR="/home/azureuser/jovafilms/frontend"

cd "$FRONTEND_DIR"

echo "========================================="
echo "🔍 DIAGNÓSTICO COMPLETO"
echo "========================================="
echo ""

echo "1️⃣ Verificando código fuente actual..."
echo "Archivo: src/services/api.ts"
echo "---"
if [ -f src/services/api.ts ]; then
    cat src/services/api.ts | head -10
    echo "---"
    if grep -q "localhost:3000" src/services/api.ts; then
        echo "❌ PROBLEMA: El código fuente todavía tiene localhost:3000"
    else
        echo "✅ El código fuente NO tiene localhost:3000"
    fi
else
    echo "❌ El archivo no existe!"
fi

echo ""
echo "2️⃣ Verificando .env..."
if [ -f .env ]; then
    echo "Contenido:"
    cat .env
else
    echo "⚠️  No existe .env"
fi

echo ""
echo "3️⃣ Verificando build actual (dist/)..."
if [ -d dist ]; then
    echo "Buscando localhost:3000 en dist/..."
    if grep -r "localhost:3000" dist/ 2>/dev/null | head -5; then
        echo ""
        echo "❌ PROBLEMA ENCONTRADO: El build tiene localhost:3000"
        echo ""
        echo "Archivos afectados:"
        grep -r "localhost:3000" dist/ 2>/dev/null | cut -d: -f1 | sort -u
    else
        echo "✅ No se encontró localhost:3000 en el build"
    fi
    
    echo ""
    echo "Buscando /api en dist/..."
    if grep -r '"/api"' dist/ 2>/dev/null | head -3 || grep -r "'/api'" dist/ 2>/dev/null | head -3; then
        echo "✅ Se encontró /api en el build"
    else
        echo "⚠️  No se encontró /api en el build"
    fi
else
    echo "⚠️  No existe directorio dist/"
fi

echo ""
echo "========================================="
echo "🔧 APLICANDO CORRECCIÓN"
echo "========================================="
echo ""

echo "4️⃣ Actualizando código fuente..."
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

// Usar ruta relativa por defecto para producción (funciona con Nginx proxy)
// En desarrollo, usar VITE_API_URL si está definida, sino localhost
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
EOF

echo "✅ Código actualizado"

echo ""
echo "5️⃣ Verificando que el cambio se aplicó..."
if grep -q "import.meta.env.DEV" src/services/api.ts; then
    echo "✅ El código tiene la lógica correcta"
else
    echo "❌ Error: El código no se actualizó correctamente"
    exit 1
fi

echo ""
echo "6️⃣ Creando .env..."
cat > .env << 'EOF'
VITE_API_URL=/api
EOF
echo "✅ .env creado"

echo ""
echo "7️⃣ LIMPIEZA AGRESIVA..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/
rm -rf .cache/
rm -rf dist-*/
# Limpiar cualquier cache de npm también
npm cache clean --force 2>/dev/null || true

echo "✅ Limpieza completada"

echo ""
echo "8️⃣ Reconstruyendo frontend (esto puede tardar)..."
export VITE_API_URL=/api
export NODE_ENV=production

# Forzar rebuild completo
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ VERIFICACIÓN FINAL"
echo "========================================="
echo ""

echo "9️⃣ Verificando build resultante..."
if grep -r "localhost:3000" dist/ 2>/dev/null; then
    echo ""
    echo "❌❌❌ PROBLEMA PERSISTE ❌❌❌"
    echo ""
    echo "El build todavía contiene localhost:3000"
    echo ""
    echo "Archivos afectados:"
    grep -r "localhost:3000" dist/ 2>/dev/null | cut -d: -f1 | sort -u | head -5
    echo ""
    echo "Contenido de ejemplo:"
    grep -r "localhost:3000" dist/ 2>/dev/null | head -2
    echo ""
    echo "⚠️  Esto puede ser un problema de cache de Vite"
    echo "   Intenta eliminar node_modules y reinstalar:"
    echo "   cd $FRONTEND_DIR"
    echo "   rm -rf node_modules package-lock.json"
    echo "   npm install"
    echo "   npm run build"
else
    echo "✅✅✅ ÉXITO: No se encontró localhost:3000 en el build"
fi

echo ""
echo "Verificando que /api esté presente..."
if grep -r '"/api"' dist/ 2>/dev/null | head -1 || grep -r "'/api'" dist/ 2>/dev/null | head -1; then
    echo "✅ Se encontró /api en el build (correcto)"
else
    echo "⚠️  No se encontró /api explícitamente (puede estar en variables)"
fi

echo ""
echo "🔟 Reiniciando Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "========================================="
echo "📋 RESUMEN"
echo "========================================="
echo ""
echo "Si todavía ves localhost:3000 después de esto:"
echo "1. El problema puede ser cache del navegador (prueba modo incógnito)"
echo "2. Puede haber un problema con node_modules (reinstalar)"
echo "3. Verifica los logs de Nginx: sudo tail -f /var/log/nginx/jovafilms-error.log"
echo ""
echo "Para verificar manualmente:"
echo "  cd $FRONTEND_DIR"
echo "  grep -r 'localhost:3000' dist/ || echo 'OK - No hay localhost:3000'"
echo ""

