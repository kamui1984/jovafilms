#!/bin/bash

# Script para solucionar el problema de conexión Frontend-Backend en Azure
# Ejecutar este script EN LA VM DE FRONTEND

echo "🔧 Solucionando problema de conexión Frontend-Backend..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
BACKEND_IP="10.0.2.4"
BACKEND_PORT="3000"
PROJECT_DIR="/home/azureuser/jovafilms"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${YELLOW}Paso 1: Verificando conectividad con el backend...${NC}"
if ping -c 3 $BACKEND_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conectividad con backend OK${NC}"
else
    echo -e "${RED}✗ No hay conectividad con el backend${NC}"
    echo "Verifica que:"
    echo "  1. La VM del backend esté encendida"
    echo "  2. El NSG permita tráfico desde Frontend subnet"
    exit 1
fi

echo -e "${YELLOW}Paso 2: Verificando que el backend esté respondiendo...${NC}"
if curl -s http://$BACKEND_IP:$BACKEND_PORT/health > /dev/null; then
    echo -e "${GREEN}✓ Backend responde correctamente${NC}"
else
    echo -e "${RED}✗ Backend no responde${NC}"
    echo "Conéctate a la VM del backend y verifica:"
    echo "  ssh azureuser@$BACKEND_IP"
    echo "  pm2 status"
    echo "  pm2 logs jovafilms-backend"
    exit 1
fi

echo -e "${YELLOW}Paso 3: Creando archivo .env para el frontend...${NC}"
cd $FRONTEND_DIR

# Crear archivo .env con la configuración correcta
cat > .env << EOF
# Configuración para Azure Production
VITE_API_URL=http://$BACKEND_IP:$BACKEND_PORT/api
EOF

echo -e "${GREEN}✓ Archivo .env creado${NC}"
cat .env

echo -e "${YELLOW}Paso 4: Reconstruyendo el frontend con la nueva configuración...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build exitoso${NC}"
else
    echo -e "${RED}✗ Error en el build${NC}"
    exit 1
fi

echo -e "${YELLOW}Paso 5: Configurando Nginx...${NC}"

# Crear configuración de Nginx
sudo tee /etc/nginx/sites-available/jovafilms > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Root directory para archivos estáticos del frontend
    root /home/azureuser/jovafilms/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/jovafilms-access.log;
    error_log /var/log/nginx/jovafilms-error.log;

    # Proxy para API requests al backend
    location /api {
        proxy_pass http://10.0.2.4:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Servir archivos estáticos del frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deshabilitar cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

echo -e "${GREEN}✓ Configuración de Nginx creada${NC}"

echo -e "${YELLOW}Paso 6: Habilitando sitio en Nginx...${NC}"
sudo ln -sf /etc/nginx/sites-available/jovafilms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo -e "${YELLOW}Paso 7: Verificando configuración de Nginx...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuración de Nginx válida${NC}"
else
    echo -e "${RED}✗ Error en la configuración de Nginx${NC}"
    exit 1
fi

echo -e "${YELLOW}Paso 8: Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reiniciado correctamente${NC}"
else
    echo -e "${RED}✗ Error al reiniciar Nginx${NC}"
    exit 1
fi

echo -e "${YELLOW}Paso 9: Verificando que Nginx esté corriendo...${NC}"
sudo systemctl status nginx | grep "active (running)"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx está corriendo${NC}"
else
    echo -e "${RED}✗ Nginx no está corriendo${NC}"
    sudo systemctl status nginx
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Configuración completada exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Abre tu navegador y accede a la IP pública de esta VM"
echo "2. Deberías ver la página de login de JovaFilms"
echo "3. Intenta hacer login con un usuario existente"
echo ""
echo "Si aún hay problemas, revisa los logs:"
echo "  - Logs de Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  - Logs del backend: ssh azureuser@$BACKEND_IP 'pm2 logs jovafilms-backend'"
echo ""
