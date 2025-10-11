#!/bin/bash

echo ""
echo "========================================"
echo "  🎬 JovaFilms - Iniciando Sistema"
echo "========================================"
echo ""

# Verificar PostgreSQL
echo "[1/4] Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL no está corriendo"
    echo "   Por favor inicia PostgreSQL antes de continuar"
    exit 1
fi
echo "✅ PostgreSQL está corriendo"
echo ""

# Iniciar Backend
echo "[2/4] Iniciando Backend API..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3
echo "✅ Backend iniciado en http://localhost:3000 (PID: $BACKEND_PID)"
echo ""

# Iniciar Batch Service
echo "[3/4] Iniciando Batch Service..."
cd batch-service
npm start > ../logs/batch.log 2>&1 &
BATCH_PID=$!
cd ..
sleep 2
echo "✅ Batch Service iniciado (PID: $BATCH_PID)"
echo ""

# Iniciar Frontend
echo "[4/4] Iniciando Frontend..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3
echo "✅ Frontend iniciado en http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""

echo "========================================"
echo "  ✨ Sistema JovaFilms Iniciado"
echo "========================================"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:3000"
echo "⏰ Batch:     Ejecutándose cada 5 minutos"
echo ""
echo "PIDs: Backend=$BACKEND_PID, Batch=$BATCH_PID, Frontend=$FRONTEND_PID"
echo ""
echo "Para detener todos los servicios:"
echo "kill $BACKEND_PID $BATCH_PID $FRONTEND_PID"
echo ""
