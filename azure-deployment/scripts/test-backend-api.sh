#!/bin/bash

# Script para probar que el backend responda correctamente
# Ejecutar en Run Command de la VM del Frontend

set -e

BACKEND_IP="172.17.0.4"
BACKEND_PORT="3000"

echo "========================================="
echo "🔍 PROBANDO BACKEND API"
echo "========================================="
echo ""

echo "1️⃣ Probando health check..."
curl -s http://${BACKEND_IP}:${BACKEND_PORT}/health | jq . || curl -s http://${BACKEND_IP}:${BACKEND_PORT}/health
echo ""

echo "2️⃣ Probando endpoint raíz..."
curl -s http://${BACKEND_IP}:${BACKEND_PORT}/ | jq . || curl -s http://${BACKEND_IP}:${BACKEND_PORT}/
echo ""

echo "3️⃣ Probando login (para obtener token)..."
TOKEN_RESPONSE=$(curl -s -X POST http://${BACKEND_IP}:${BACKEND_PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}')

echo "Respuesta de login:"
echo "$TOKEN_RESPONSE" | jq . || echo "$TOKEN_RESPONSE"
echo ""

# Extraer token
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener el token"
    echo "Verifica que el usuario test@test.com exista en la base de datos"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

echo "4️⃣ Probando obtener películas (sin autenticación - debería fallar)..."
curl -s http://${BACKEND_IP}:${BACKEND_PORT}/api/movies | head -c 200
echo ""
echo ""

echo "5️⃣ Probando obtener películas (con token)..."
MOVIES_RESPONSE=$(curl -s http://${BACKEND_IP}:${BACKEND_PORT}/api/movies \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta de películas:"
echo "$MOVIES_RESPONSE" | jq . | head -50 || echo "$MOVIES_RESPONSE" | head -50
echo ""

# Verificar si hay películas
MOVIE_COUNT=$(echo "$MOVIES_RESPONSE" | grep -o '"data":\[' | wc -l || echo "0")
if echo "$MOVIES_RESPONSE" | grep -q '"data":\[\]'; then
    echo "⚠️  ADVERTENCIA: No hay películas en la base de datos"
    echo "   Necesitas ejecutar el seed:"
    echo "   cd /home/azureuser/jovafilms/backend"
    echo "   npx prisma db seed"
else
    echo "✅ Hay películas en la base de datos"
fi

echo ""
echo "6️⃣ Probando a través de Nginx (desde localhost)..."
curl -s http://localhost/api/health | jq . || curl -s http://localhost/api/health
echo ""

echo ""
echo "========================================="
echo "📋 RESUMEN"
echo "========================================="
echo ""
echo "Si el backend responde pero no hay películas:"
echo "1. Conéctate a la VM del backend"
echo "2. cd /home/azureuser/jovafilms/backend"
echo "3. npx prisma db seed"
echo ""
echo "Si el login falla:"
echo "1. Verifica que el usuario test@test.com exista"
echo "2. O crea un nuevo usuario desde /register"
echo ""

