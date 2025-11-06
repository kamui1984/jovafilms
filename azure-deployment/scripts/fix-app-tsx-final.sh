#!/bin/bash

# Script final para corregir App.tsx y reconstruir
# Ejecutar en Run Command de la VM

set -e

FRONTEND_DIR="/home/azureuser/jovafilms/frontend"
cd "$FRONTEND_DIR"

echo "========================================="
echo "🔧 CORRECCIÓN FINAL DE App.tsx"
echo "========================================="
echo ""

echo "1️⃣ Actualizando App.tsx con rutas relativas..."
# Reemplazar todas las URLs de localhost:3000 por rutas relativas
sed -i 's|http://localhost:3000/api|/api|g' src/App.tsx

echo "✅ App.tsx actualizado"

echo ""
echo "2️⃣ Verificando cambios..."
if grep -q "localhost:3000" src/App.tsx; then
    echo "❌ Aún hay referencias a localhost:3000"
    grep -n "localhost:3000" src/App.tsx
    exit 1
else
    echo "✅ No hay referencias a localhost:3000 en App.tsx"
fi

echo ""
echo "3️⃣ Verificando que api.ts esté correcto..."
if grep -q "import.meta.env.DEV" src/services/api.ts; then
    echo "✅ api.ts está correcto"
else
    echo "⚠️  Actualizando api.ts..."
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
    echo "✅ api.ts actualizado"
fi

echo ""
echo "4️⃣ Creando .env..."
echo "VITE_API_URL=/api" > .env
cat .env

echo ""
echo "5️⃣ Limpieza completa..."
rm -rf dist/ node_modules/.vite/ .vite/ .cache/

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
echo "7️⃣ Verificación final del build..."
if grep -r "localhost:3000" dist/ 2>/dev/null; then
    echo "❌ PROBLEMA: Aún hay localhost:3000 en el build"
    echo "Aplicando parche directo..."
    find dist/ -name "*.js" -type f -exec sed -i 's|http://localhost:3000/api|/api|g' {} \;
    find dist/ -name "*.js" -type f -exec sed -i "s|http://localhost:3000/api|/api|g" {} \;
    echo "✅ Parche aplicado"
    
    # Verificar de nuevo
    if grep -r "localhost:3000" dist/ 2>/dev/null; then
        echo "❌ El parche no funcionó completamente"
    else
        echo "✅ Parche exitoso - no hay localhost:3000"
    fi
else
    echo "✅✅✅ PERFECTO: No hay localhost:3000 en el build"
fi

echo ""
echo "8️⃣ Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "========================================="
echo "✅ CORRECCIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Ahora:"
echo "1. Abre http://158.23.59.126"
echo "2. Presiona Ctrl+Shift+R (hard refresh)"
echo "3. Abre la consola (F12)"
echo "4. Intenta hacer login"
echo ""
echo "Deberías ver peticiones a:"
echo "  http://158.23.59.126/api/auth/login"
echo "  (NO debería aparecer localhost:3000)"
echo ""

