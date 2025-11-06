# 🔧 Solución al Problema de Conexión Frontend-Backend

## Problema Identificado

El frontend carga correctamente (página de login visible), pero **NO puede conectarse con el backend** porque:

1. ❌ No existe archivo `.env` en el frontend con la URL correcta del backend
2. ❌ La configuración de Nginx no está haciendo proxy correctamente al backend
3. ❌ El frontend está intentando conectarse a `localhost` en lugar de la IP privada del backend

## Solución Rápida (Opción 1 - Recomendada)

### Ejecutar el script automático

1. **Conéctate a la VM de Frontend:**
   ```bash
   ssh azureuser@<IP_PUBLICA_FRONTEND>
   ```

2. **Navega al directorio del proyecto:**
   ```bash
   cd /home/azureuser/jovafilms
   ```

3. **Descarga los últimos cambios:**
   ```bash
   git pull origin main
   ```

4. **Ejecuta el script de solución:**
   ```bash
   chmod +x azure-deployment/scripts/fix-frontend-connection.sh
   ./azure-deployment/scripts/fix-frontend-connection.sh
   ```

5. **Verifica que todo funcione:**
   - Abre tu navegador
   - Accede a `http://<IP_PUBLICA_FRONTEND>`
   - Intenta hacer login

## Solución Manual (Opción 2)

Si prefieres hacerlo paso a paso:

### Paso 1: Verificar Backend

Primero, asegúrate de que el backend esté funcionando:

```bash
# Desde la VM de Frontend, prueba conectarte al backend
ping 10.0.2.4

# Verifica que el backend responda
curl http://10.0.2.4:3000/health
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-06T...",
  "uptime": 12345
}
```

Si esto NO funciona:
1. Conéctate a la VM del backend: `ssh azureuser@10.0.2.4`
2. Verifica que PM2 esté corriendo: `pm2 status`
3. Revisa los logs: `pm2 logs jovafilms-backend`

### Paso 2: Crear archivo .env en Frontend

```bash
cd /home/azureuser/jovafilms/frontend

# Crear archivo .env
cat > .env << 'EOF'
VITE_API_URL=http://10.0.2.4:3000/api
EOF

# Verificar que se creó correctamente
cat .env
```

### Paso 3: Reconstruir el Frontend

```bash
cd /home/azureuser/jovafilms/frontend

# Instalar dependencias (si no están instaladas)
npm install

# Construir para producción
npm run build

# Verificar que la carpeta dist existe
ls -la dist/
```

### Paso 4: Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/jovafilms
```

Pega esta configuración:

```nginx
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
```

Guarda el archivo (Ctrl+O, Enter, Ctrl+X)

### Paso 5: Habilitar el sitio y reiniciar Nginx

```bash
# Crear symlink
sudo ln -sf /etc/nginx/sites-available/jovafilms /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar que esté corriendo
sudo systemctl status nginx
```

### Paso 6: Verificar NSG (Network Security Group)

Asegúrate de que el NSG del backend permita tráfico desde el frontend:

```bash
# Desde tu máquina local (con Azure CLI instalado)
az network nsg rule list \
  --resource-group jovafilms-rg \
  --nsg-name jovafilms-backend-vm-nsg \
  --output table
```

**Debe existir una regla que permita:**
- Source: 10.0.1.0/24 (subnet del frontend)
- Destination Port: 3000
- Protocol: TCP
- Action: Allow

Si no existe, créala:

```bash
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name jovafilms-backend-vm-nsg \
  --name Allow-Frontend-To-Backend \
  --priority 100 \
  --source-address-prefixes 10.0.1.0/24 \
  --destination-port-ranges 3000 \
  --access Allow \
  --protocol Tcp
```

## Verificación Final

### 1. Desde tu navegador:

```
http://<IP_PUBLICA_FRONTEND>
```

Deberías ver la página de login.

### 2. Abre la consola del navegador (F12):

- Ve a la pestaña "Network"
- Intenta hacer login
- Verifica que las peticiones a `/api/auth/login` se hagan correctamente
- Deberían ir a `http://<IP_PUBLICA_FRONTEND>/api/auth/login`
- Nginx hará proxy a `http://10.0.2.4:3000/api/auth/login`

### 3. Si ves errores de CORS:

Verifica que en el backend (`/home/azureuser/jovafilms/backend/.env`) esté configurado:

```bash
CORS_ORIGIN=http://<IP_PUBLICA_FRONTEND>
```

Si no está, agrégalo y reinicia el backend:

```bash
# En la VM del backend
pm2 restart jovafilms-backend
```

## Troubleshooting

### Error: "Network Error" en el frontend

**Causa:** El frontend no puede alcanzar el backend.

**Solución:**
1. Verifica que Nginx esté corriendo: `sudo systemctl status nginx`
2. Revisa logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verifica conectividad: `curl http://10.0.2.4:3000/health`

### Error: "CORS policy"

**Causa:** El backend no permite peticiones desde el frontend.

**Solución:**
1. Conéctate al backend: `ssh azureuser@10.0.2.4`
2. Edita `.env`: `nano /home/azureuser/jovafilms/backend/.env`
3. Agrega/modifica: `CORS_ORIGIN=http://<IP_PUBLICA_FRONTEND>`
4. Reinicia: `pm2 restart jovafilms-backend`

### Error: "502 Bad Gateway"

**Causa:** Nginx no puede conectarse al backend.

**Solución:**
1. Verifica que el backend esté corriendo: `ssh azureuser@10.0.2.4 'pm2 status'`
2. Verifica NSG rules (ver arriba)
3. Verifica que el puerto 3000 esté abierto en el backend

### El login carga pero no responde

**Causa:** El frontend está usando la URL incorrecta del API.

**Solución:**
1. Verifica el archivo `.env` en el frontend
2. Reconstruye el frontend: `npm run build`
3. Reinicia Nginx: `sudo systemctl restart nginx`
4. Limpia la caché del navegador (Ctrl+Shift+R)

## Comandos Útiles

### Ver logs en tiempo real:

```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Logs del backend (desde VM backend)
pm2 logs jovafilms-backend

# Logs del batch (desde VM batch)
pm2 logs jovafilms-batch
```

### Reiniciar servicios:

```bash
# Nginx (en VM frontend)
sudo systemctl restart nginx

# Backend (en VM backend)
pm2 restart jovafilms-backend

# Batch (en VM batch)
pm2 restart jovafilms-batch
```

### Verificar conectividad:

```bash
# Desde VM frontend al backend
curl http://10.0.2.4:3000/health

# Desde VM backend a la base de datos
psql -h 10.0.4.4 -U jovafilms -d jovafilms_db -c "SELECT 1;"
```

## Resumen de IPs

- **Frontend VM:** `<IP_PUBLICA>` (pública) / `10.0.1.4` (privada)
- **Backend VM:** `10.0.2.4` (privada)
- **Batch VM:** `10.0.3.4` (privada)
- **Database VM:** `10.0.4.4` (privada)

## Próximos Pasos

Una vez que el login funcione:

1. ✅ Registra un nuevo usuario
2. ✅ Inicia sesión
3. ✅ Navega por las películas
4. ✅ Crea una reseña
5. ✅ Verifica que el batch service procese la reseña (espera 5 minutos)

---

**Última actualización:** Noviembre 2024

**Estado:** 🔧 Solución lista para aplicar
