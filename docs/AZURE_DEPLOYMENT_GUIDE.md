# 🚀 Guía de Despliegue en Azure - JovaFilms

## Requisitos Previos

- Cuenta de Azure activa
- Azure CLI instalado
- Git instalado
- SSH client
- Acceso al repositorio de GitHub

---

## Fase 1: Configuración Inicial de Azure (30 min)

### 1.1 Instalar Azure CLI

**Windows:**
```powershell
winget install Microsoft.AzureCLI
```

**Linux/Mac:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 1.2 Login en Azure

```bash
az login
az account list --output table
az account set --subscription "<SUBSCRIPTION_ID>"
```

### 1.3 Crear Resource Group

```bash
az group create \
  --name jovafilms-rg \
  --location eastus
```

---

## Fase 2: Crear Red Virtual (15 min)

### 2.1 Crear VNet

```bash
az network vnet create \
  --resource-group jovafilms-rg \
  --name jovafilms-vnet \
  --address-prefix 10.0.0.0/16 \
  --location eastus
```

### 2.2 Crear Subnets

```bash
# Frontend subnet
az network vnet subnet create \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name frontend-subnet \
  --address-prefix 10.0.1.0/24

# Backend subnet
az network vnet subnet create \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name backend-subnet \
  --address-prefix 10.0.2.0/24

# Batch subnet
az network vnet subnet create \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name batch-subnet \
  --address-prefix 10.0.3.0/24

# Database subnet
az network vnet subnet create \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name database-subnet \
  --address-prefix 10.0.4.0/24
```

---

## Fase 3: Crear Storage Account (10 min)

### 3.1 Crear Storage Account

```bash
az storage account create \
  --name jovafilmsstorage \
  --resource-group jovafilms-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

### 3.2 Crear Container

```bash
# Obtener connection string
az storage account show-connection-string \
  --name jovafilmsstorage \
  --resource-group jovafilms-rg \
  --output tsv

# Crear container
az storage container create \
  --name reviews-files \
  --account-name jovafilmsstorage \
  --public-access off
```

**Guardar el connection string para usarlo después**

---

## Fase 4: Crear Virtual Machines (45 min)

### 4.1 VM Database

```bash
az vm create \
  --resource-group jovafilms-rg \
  --name jovafilms-db-vm \
  --image Ubuntu2204 \
  --size Standard_B2ms \
  --vnet-name jovafilms-vnet \
  --subnet database-subnet \
  --private-ip-address 10.0.4.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys \
  --os-disk-size-gb 128
```

### 4.2 VM Backend

```bash
az vm create \
  --resource-group jovafilms-rg \
  --name jovafilms-backend-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name jovafilms-vnet \
  --subnet backend-subnet \
  --private-ip-address 10.0.2.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys
```

### 4.3 VM Batch

```bash
az vm create \
  --resource-group jovafilms-rg \
  --name jovafilms-batch-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --vnet-name jovafilms-vnet \
  --subnet batch-subnet \
  --private-ip-address 10.0.3.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys
```

### 4.4 VM Frontend

```bash
az vm create \
  --resource-group jovafilms-rg \
  --name jovafilms-frontend-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name jovafilms-vnet \
  --subnet frontend-subnet \
  --private-ip-address 10.0.1.4 \
  --public-ip-address-allocation static \
  --admin-username azureuser \
  --generate-ssh-keys
```

**Guardar la IP pública del frontend:**
```bash
az vm show -d \
  --resource-group jovafilms-rg \
  --name jovafilms-frontend-vm \
  --query publicIps -o tsv
```

---

## Fase 5: Configurar Network Security Groups (30 min)

### 5.1 NSG Frontend

```bash
# Crear NSG
az network nsg create \
  --resource-group jovafilms-rg \
  --name frontend-nsg

# Permitir HTTP
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name frontend-nsg \
  --name allow-http \
  --priority 100 \
  --source-address-prefixes Internet \
  --destination-port-ranges 80 \
  --access Allow \
  --protocol Tcp

# Permitir HTTPS
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name frontend-nsg \
  --name allow-https \
  --priority 110 \
  --source-address-prefixes Internet \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp

# Permitir SSH (desde tu IP)
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name frontend-nsg \
  --name allow-ssh \
  --priority 120 \
  --source-address-prefixes <TU_IP> \
  --destination-port-ranges 22 \
  --access Allow \
  --protocol Tcp

# Asociar NSG a subnet
az network vnet subnet update \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name frontend-subnet \
  --network-security-group frontend-nsg
```

### 5.2 NSG Backend

```bash
# Crear NSG
az network nsg create \
  --resource-group jovafilms-rg \
  --name backend-nsg

# Permitir puerto 3000 desde frontend
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name backend-nsg \
  --name allow-api-from-frontend \
  --priority 100 \
  --source-address-prefixes 10.0.1.0/24 \
  --destination-port-ranges 3000 \
  --access Allow \
  --protocol Tcp

# Permitir puerto 3000 desde batch
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name backend-nsg \
  --name allow-api-from-batch \
  --priority 110 \
  --source-address-prefixes 10.0.3.0/24 \
  --destination-port-ranges 3000 \
  --access Allow \
  --protocol Tcp

# Asociar NSG
az network vnet subnet update \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name backend-subnet \
  --network-security-group backend-nsg
```

### 5.3 NSG Database

```bash
# Crear NSG
az network nsg create \
  --resource-group jovafilms-rg \
  --name database-nsg

# Permitir PostgreSQL desde backend
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name database-nsg \
  --name allow-postgres-from-backend \
  --priority 100 \
  --source-address-prefixes 10.0.2.0/24 \
  --destination-port-ranges 5432 \
  --access Allow \
  --protocol Tcp

# Permitir PostgreSQL desde batch
az network nsg rule create \
  --resource-group jovafilms-rg \
  --nsg-name database-nsg \
  --name allow-postgres-from-batch \
  --priority 110 \
  --source-address-prefixes 10.0.3.0/24 \
  --destination-port-ranges 5432 \
  --access Allow \
  --protocol Tcp

# Asociar NSG
az network vnet subnet update \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --name database-subnet \
  --network-security-group database-nsg
```

---

## Fase 6: Configurar Database VM (45 min)

### 6.1 Conectar a Frontend VM (bastion)

```bash
ssh azureuser@<FRONTEND_PUBLIC_IP>
```

### 6.2 Desde Frontend, conectar a Database VM

```bash
ssh azureuser@10.0.4.4
```

### 6.3 Instalar PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 6.4 Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE jovafilms_db;
CREATE USER jovafilms WITH ENCRYPTED PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE jovafilms_db TO jovafilms;
\q

# Configurar acceso remoto
sudo nano /etc/postgresql/15/main/postgresql.conf
# Cambiar: listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Agregar al final:
# host    all             all             10.0.0.0/16             md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 6.5 Verificar conexión

```bash
# Desde backend VM o batch VM
psql -h 10.0.4.4 -U jovafilms -d jovafilms_db
# Ingresar password: SecurePassword123!
```

---

## Fase 7: Configurar Backend VM (1 hora)

### 7.1 Conectar a Backend VM

```bash
# Desde Frontend VM
ssh azureuser@10.0.2.4
```

### 7.2 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

### 7.3 Instalar PM2

```bash
sudo npm install -g pm2
```

### 7.4 Clonar repositorio

```bash
git clone https://github.com/kamui1984/jovafilms.git
cd jovafilms/backend
```

### 7.5 Configurar variables de entorno

```bash
nano .env
```

**Contenido del .env:**
```env
DATABASE_URL="postgresql://jovafilms:SecurePassword123!@10.0.4.4:5432/jovafilms_db"
JWT_SECRET="your_production_jwt_secret_here_min_32_chars"
PORT=3000
NODE_ENV=production
```

### 7.6 Instalar dependencias y ejecutar migraciones

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 7.7 Compilar TypeScript

```bash
npm run build
```

### 7.8 Iniciar con PM2

```bash
pm2 start dist/server.js --name jovafilms-backend
pm2 save
pm2 startup
# Ejecutar el comando que PM2 te muestra
```

### 7.9 Verificar que está corriendo

```bash
pm2 status
pm2 logs jovafilms-backend
curl http://localhost:3000/health
```

---

## Fase 8: Configurar Batch VM (45 min)

### 8.1 Conectar a Batch VM

```bash
# Desde Frontend VM
ssh azureuser@10.0.3.4
```

### 8.2 Instalar Node.js y PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

### 8.3 Clonar repositorio

```bash
git clone https://github.com/kamui1984/jovafilms.git
cd jovafilms/batch-service
```

### 8.4 Configurar variables de entorno

```bash
nano .env
```

**Contenido del .env:**
```env
DATABASE_URL="postgresql://jovafilms:SecurePassword123!@10.0.4.4:5432/jovafilms_db"
AZURE_STORAGE_CONNECTION_STRING="<TU_CONNECTION_STRING_AQUI>"
AZURE_STORAGE_CONTAINER_NAME="reviews-files"
BACKEND_URL="http://10.0.2.4:3000"
```

### 8.5 Instalar dependencias

```bash
npm install
npx prisma generate
```

### 8.6 Compilar y ejecutar

```bash
npm run build
pm2 start dist/index.js --name jovafilms-batch
pm2 save
pm2 startup
```

### 8.7 Verificar

```bash
pm2 status
pm2 logs jovafilms-batch
```

---

## Fase 9: Configurar Frontend VM (1 hora)

### 9.1 Conectar a Frontend VM

```bash
ssh azureuser@<FRONTEND_PUBLIC_IP>
```

### 9.2 Instalar Node.js y Nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
```

### 9.3 Clonar repositorio

```bash
git clone https://github.com/kamui1984/jovafilms.git
cd jovafilms/frontend
```

### 9.4 Configurar variables de entorno

```bash
nano .env
```

**Contenido del .env:**
```env
VITE_API_URL=http://10.0.2.4:3000
```

### 9.5 Build de producción

```bash
npm install
npm run build
```

### 9.6 Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/jovafilms
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name <FRONTEND_PUBLIC_IP>;

    root /home/azureuser/jovafilms/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://10.0.2.4:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.7 Activar sitio

```bash
sudo ln -s /etc/nginx/sites-available/jovafilms /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9.8 Verificar

```bash
curl http://localhost
```

---

## Fase 10: Testing y Verificación (30 min)

### 10.1 Verificar conectividad

```bash
# Desde Frontend VM
ping 10.0.2.4  # Backend
ping 10.0.3.4  # Batch
ping 10.0.4.4  # Database
```

### 10.2 Probar API

```bash
# Health check
curl http://10.0.2.4:3000/health

# Register
curl -X POST http://10.0.2.4:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'
```

### 10.3 Probar aplicación web

Abrir en navegador: `http://<FRONTEND_PUBLIC_IP>`

1. Registrar usuario
2. Iniciar sesión
3. Ver películas
4. Crear reseña con MAYÚSCULAS
5. Esperar 5 minutos
6. Verificar que se validó y convirtió a minúsculas

### 10.4 Verificar Blob Storage

```bash
# Desde Batch VM
az storage blob list \
  --container-name reviews-files \
  --account-name jovafilmsstorage \
  --output table
```

---

## Fase 11: Configurar HTTPS (Opcional - 30 min)

### 11.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 11.2 Obtener certificado

```bash
sudo certbot --nginx -d <TU_DOMINIO>
```

### 11.3 Renovación automática

```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Backend no se conecta a Database

```bash
# Verificar que PostgreSQL está escuchando
sudo netstat -plnt | grep 5432

# Verificar pg_hba.conf
sudo cat /etc/postgresql/15/main/pg_hba.conf | grep 10.0.0.0
```

### Batch no puede subir a Blob Storage

```bash
# Verificar connection string
echo $AZURE_STORAGE_CONNECTION_STRING

# Probar manualmente
az storage blob upload \
  --container-name reviews-files \
  --name test.txt \
  --file test.txt \
  --account-name jovafilmsstorage
```

### Frontend no carga

```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

---

## Comandos Útiles

### PM2
```bash
pm2 list
pm2 logs <app-name>
pm2 restart <app-name>
pm2 stop <app-name>
pm2 delete <app-name>
```

### PostgreSQL
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo -u postgres psql -d jovafilms_db
```

### Nginx
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t
```

---

## Próximos Pasos

1. ✅ Configurar backups automáticos
2. ✅ Implementar monitoreo con Azure Monitor
3. ✅ Configurar alertas
4. ✅ Documentar URL pública
5. ✅ Preparar demo

---

**Tiempo total estimado**: 6-8 horas  
**Dificultad**: Media  
**Costo**: ~$157/mes
