# 🚀 Azure Quick Reference - JovaFilms

## Comandos Útiles Azure CLI

### Login y Configuración

```bash
# Login en Azure
az login

# Ver suscripciones
az account list --output table

# Seleccionar suscripción
az account set --subscription "<SUBSCRIPTION_ID>"

# Ver cuenta actual
az account show
```

### Resource Groups

```bash
# Listar resource groups
az group list --output table

# Ver detalles de resource group
az group show --name jovafilms-rg

# Eliminar resource group (¡CUIDADO!)
az group delete --name jovafilms-rg --yes
```

### Virtual Machines

```bash
# Listar VMs
az vm list --resource-group jovafilms-rg --output table

# Ver estado de VM
az vm show -d --name jovafilms-frontend-vm --resource-group jovafilms-rg

# Obtener IP pública
az vm show -d --name jovafilms-frontend-vm --resource-group jovafilms-rg --query publicIps -o tsv

# Iniciar VM
az vm start --name jovafilms-frontend-vm --resource-group jovafilms-rg

# Detener VM (ahorra costos)
az vm stop --name jovafilms-frontend-vm --resource-group jovafilms-rg

# Deallocate VM (libera recursos)
az vm deallocate --name jovafilms-frontend-vm --resource-group jovafilms-rg

# Reiniciar VM
az vm restart --name jovafilms-frontend-vm --resource-group jovafilms-rg
```

### Storage Account

```bash
# Listar storage accounts
az storage account list --resource-group jovafilms-rg --output table

# Obtener connection string
az storage account show-connection-string \
  --name jovafilmsstorage \
  --resource-group jovafilms-rg \
  --output tsv

# Listar containers
az storage container list --account-name jovafilmsstorage --output table

# Listar blobs en container
az storage blob list \
  --container-name reviews-files \
  --account-name jovafilmsstorage \
  --output table

# Descargar blob
az storage blob download \
  --container-name reviews-files \
  --name review-1-2024-11-03.txt \
  --file ./review.txt \
  --account-name jovafilmsstorage
```

### Network

```bash
# Listar VNets
az network vnet list --resource-group jovafilms-rg --output table

# Ver subnets
az network vnet subnet list \
  --resource-group jovafilms-rg \
  --vnet-name jovafilms-vnet \
  --output table

# Listar NSGs
az network nsg list --resource-group jovafilms-rg --output table

# Ver reglas de NSG
az network nsg rule list \
  --resource-group jovafilms-rg \
  --nsg-name frontend-nsg \
  --output table

# Listar IPs públicas
az network public-ip list --resource-group jovafilms-rg --output table
```

---

## Conexión SSH a VMs

### Desde Local (solo Frontend tiene IP pública)

```bash
# Conectar a Frontend VM
ssh azureuser@<FRONTEND_PUBLIC_IP>
```

### Desde Frontend a otras VMs (privadas)

```bash
# Ya conectado a Frontend VM, conectar a Backend
ssh azureuser@10.0.2.4

# Conectar a Batch
ssh azureuser@10.0.3.4

# Conectar a Database
ssh azureuser@10.0.4.4
```

---

## Comandos Útiles en VMs

### PM2 (Process Manager)

```bash
# Listar procesos
pm2 list

# Ver logs
pm2 logs jovafilms-backend

# Ver logs en tiempo real
pm2 logs jovafilms-backend --lines 100

# Reiniciar aplicación
pm2 restart jovafilms-backend

# Detener aplicación
pm2 stop jovafilms-backend

# Eliminar aplicación
pm2 delete jovafilms-backend

# Guardar configuración
pm2 save

# Ver monitoreo
pm2 monit
```

### PostgreSQL

```bash
# Conectar a base de datos
psql -U jovafilms -d jovafilms_db

# Conectar desde otra VM
psql -h 10.0.4.4 -U jovafilms -d jovafilms_db

# Ver tablas
\dt

# Describir tabla
\d reviews

# Ver reseñas
SELECT id, rating, validated, blob_storage_path FROM reviews LIMIT 10;

# Salir
\q
```

### Nginx

```bash
# Ver estado
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recargar configuración
sudo systemctl reload nginx

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Probar configuración
sudo nginx -t
```

### Sistema

```bash
# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos
htop  # o top

# Ver puertos abiertos
sudo netstat -tlnp

# Ver logs del sistema
sudo journalctl -u nginx -f
```

---

## Monitoreo de Costos

### Ver costos actuales

```bash
# Instalar extensión de costos
az extension add --name cost-management

# Ver costos del resource group
az costmanagement query \
  --type Usage \
  --scope "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/jovafilms-rg" \
  --timeframe MonthToDate
```

### Portal Azure
1. Ir a https://portal.azure.com
2. Buscar "Cost Management + Billing"
3. Ver "Cost analysis"
4. Filtrar por Resource Group: jovafilms-rg

---

## Troubleshooting Común

### No puedo conectar a Backend desde Frontend

```bash
# Verificar que Backend está corriendo
ssh azureuser@10.0.2.4
pm2 status

# Verificar puerto
curl http://localhost:3000/health

# Verificar NSG
az network nsg rule list \
  --resource-group jovafilms-rg \
  --nsg-name backend-nsg \
  --output table
```

### Batch no puede subir a Blob Storage

```bash
# Verificar connection string
ssh azureuser@10.0.3.4
cat .env | grep AZURE_STORAGE

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
ssh azureuser@<FRONTEND_PUBLIC_IP>
sudo systemctl status nginx
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Verificar archivos
ls -la /home/azureuser/jovafilms/frontend/dist
```

### Database no acepta conexiones

```bash
# Verificar PostgreSQL
ssh azureuser@10.0.4.4
sudo systemctl status postgresql

# Verificar configuración
sudo cat /etc/postgresql/15/main/pg_hba.conf | grep 10.0.0.0

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## Scripts de Mantenimiento

### Backup de Base de Datos

```bash
# Conectar a Database VM
ssh azureuser@10.0.4.4

# Crear backup
pg_dump -U jovafilms jovafilms_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U jovafilms -d jovafilms_db < backup_20241103.sql
```

### Actualizar Aplicación

```bash
# Backend VM
ssh azureuser@10.0.2.4
cd jovafilms/backend
git pull
npm install
npm run build
pm2 restart jovafilms-backend

# Batch VM
ssh azureuser@10.0.3.4
cd jovafilms/batch-service
git pull
npm install
npm run build
pm2 restart jovafilms-batch

# Frontend VM
ssh azureuser@<FRONTEND_PUBLIC_IP>
cd jovafilms/frontend
git pull
npm install
npm run build
sudo systemctl reload nginx
```

---

## Limpieza y Ahorro de Costos

### Detener VMs cuando no se usan

```bash
# Detener todas las VMs (ahorra ~60% de costos)
az vm deallocate --name jovafilms-frontend-vm --resource-group jovafilms-rg
az vm deallocate --name jovafilms-backend-vm --resource-group jovafilms-rg
az vm deallocate --name jovafilms-batch-vm --resource-group jovafilms-rg
az vm deallocate --name jovafilms-db-vm --resource-group jovafilms-rg

# Iniciar todas las VMs
az vm start --name jovafilms-frontend-vm --resource-group jovafilms-rg
az vm start --name jovafilms-backend-vm --resource-group jovafilms-rg
az vm start --name jovafilms-batch-vm --resource-group jovafilms-rg
az vm start --name jovafilms-db-vm --resource-group jovafilms-rg
```

### Eliminar todo (¡CUIDADO!)

```bash
# Eliminar resource group completo
az group delete --name jovafilms-rg --yes --no-wait
```

---

## URLs Importantes

- **Portal Azure**: https://portal.azure.com
- **Azure CLI Docs**: https://docs.microsoft.com/cli/azure/
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/
- **Status Page**: https://status.azure.com/

---

## Contactos de Soporte

- **Azure Support**: https://azure.microsoft.com/support/
- **Stack Overflow**: [azure] tag
- **GitHub Issues**: Repositorio del proyecto

---

**Última actualización**: Noviembre 2024
