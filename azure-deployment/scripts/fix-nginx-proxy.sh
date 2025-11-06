#!/bin/bash

# Script para corregir el proxy de Nginx
# Ejecutar este script EN LA VM (usando Run Command de Azure)

set -e

echo "🔧 Corrigiendo configuración de Nginx para proxy correcto..."

# Variables
BACKEND_IP="172.17.0.4"  # IP del contenedor Docker del backend
BACKEND_PORT="3000"
FRONTEND_DIR="/home/azureuser/jovafilms/frontend"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1️⃣ Actualizando .env del frontend...${NC}"
cd "$FRONTEND_DIR"

# IMPORTANTE: Usar ruta relativa /api para que pase por Nginx
cat > .env << 'EOF'
VITE_API_URL=/api
EOF

echo -e "${GREEN}✓ .env actualizado:${NC}"
cat .env

echo -e "${YELLOW}2️⃣ Limpiando build anterior...${NC}"
rm -rf dist/ node_modules/.vite/

echo -e "${YELLOW}3️⃣ Reconstruyendo frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build exitoso${NC}"
else
    echo -e "${RED}✗ Error en el build${NC}"
    exit 1
fi

echo -e "${YELLOW}4️⃣ Configurando Nginx con proxy correcto...${NC}"

# Configuración de Nginx que maneja correctamente /api/health y otras rutas
sudo tee /etc/nginx/sites-available/jovafilms > /dev/null << EOF
server {
    listen 80;
    server_name _;

    root ${FRONTEND_DIR}/dist;
    index index.html;

    access_log /var/log/nginx/jovafilms-access.log;
    error_log  /var/log/nginx/jovafilms-error.log;

    # IMPORTANTE: Location específico para /api/health → reescribe a /health
    location = /api/health {
        proxy_pass http://${BACKEND_IP}:${BACKEND_PORT}/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Location general para /api/* → reenvía tal cual (el backend espera /api/auth, /api/movies, etc.)
    location /api/ {
        proxy_pass http://${BACKEND_IP}:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Servir archivos estáticos del frontend (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

echo -e "${GREEN}✓ Configuración de Nginx creada${NC}"

# Habilitar sitio
echo -e "${YELLOW}5️⃣ Habilitando sitio en Nginx...${NC}"
sudo ln -sf /etc/nginx/sites-available/jovafilms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo -e "${YELLOW}6️⃣ Verificando configuración de Nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Configuración válida${NC}"
else
    echo -e "${RED}✗ Error en la configuración${NC}"
    exit 1
fi

echo -e "${YELLOW}7️⃣ Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

echo -e "${YELLOW}8️⃣ Probando conectividad...${NC}"

# Probar desde la VM
echo "Probando /api/health desde la VM:"
curl -s http://localhost/api/health | head -c 200
echo ""

echo "Probando /health directo al backend:"
curl -s http://${BACKEND_IP}:${BACKEND_PORT}/health | head -c 200
echo ""

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Ahora prueba desde tu navegador:"
echo "  1. http://158.23.59.126/api/health (debe responder OK)"
echo "  2. http://158.23.59.126/ (página principal)"
echo "  3. Haz Ctrl+Shift+R para limpiar cache"
echo ""
echo "Si hay problemas, revisa logs:"
echo "  sudo tail -f /var/log/nginx/jovafilms-error.log"

