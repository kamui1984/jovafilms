#!/bin/bash

# Script para actualizar App.tsx con React Router
# Ejecutar en Run Command de la VM

set -e

FRONTEND_DIR="/home/azureuser/jovafilms/frontend"
cd "$FRONTEND_DIR"

echo "========================================="
echo "🔧 ACTUALIZANDO App.tsx CON REACT ROUTER"
echo "========================================="
echo ""

echo "1️⃣ Creando nuevo App.tsx con React Router..."
cat > src/App.tsx << 'EOF'
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { AddMoviePage } from './pages/AddMoviePage';
import { MyReviewsPage } from './pages/MyReviewsPage';

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <MovieDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-movie"
          element={
            <ProtectedRoute>
              <AddMoviePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto - redirigir a home si está autenticado, sino a login */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
EOF

echo "✅ App.tsx actualizado"

echo ""
echo "2️⃣ Verificando que api.ts esté correcto..."
if ! grep -q "import.meta.env.DEV" src/services/api.ts; then
    echo "Actualizando api.ts..."
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
else
    echo "✅ api.ts ya está correcto"
fi

echo ""
echo "3️⃣ Verificando .env..."
echo "VITE_API_URL=/api" > .env
cat .env

echo ""
echo "4️⃣ Limpieza completa..."
rm -rf dist/ node_modules/.vite/ .vite/ .cache/

echo ""
echo "5️⃣ Reconstruyendo frontend..."
export VITE_API_URL=/api
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi

echo ""
echo "6️⃣ Verificando build..."
if grep -r "localhost:3000" dist/ 2>/dev/null; then
    echo "⚠️  Aplicando parche final..."
    find dist/ -name "*.js" -type f -exec sed -i 's|http://localhost:3000/api|/api|g' {} \;
    echo "✅ Parche aplicado"
else
    echo "✅ No hay localhost:3000 en el build"
fi

echo ""
echo "7️⃣ Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "========================================="
echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Ahora la aplicación debería:"
echo "1. Mostrar el catálogo de películas al hacer login"
echo "2. Tener opciones en el header: Películas, Agregar Película, Mis Reseñas"
echo "3. Permitir buscar películas"
echo "4. Permitir ver detalles y agregar reseñas"
echo ""
echo "Prueba:"
echo "1. Abre http://158.23.59.126"
echo "2. Presiona Ctrl+Shift+R (hard refresh)"
echo "3. Haz login"
echo "4. Deberías ver el catálogo completo"
echo ""

