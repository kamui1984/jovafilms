# Script para crear la infraestructura completa en Azure
# Autor: JovaFilms Team
# Fecha: Noviembre 2024

$ErrorActionPreference = "Stop"

# Configuración
$RESOURCE_GROUP = "jovafilms-rg"
$LOCATION = "eastus"
$VNET_NAME = "jovafilms-vnet"
$STORAGE_ACCOUNT = "jovafilmsstorage"
$CONTAINER_NAME = "reviews-files"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  JovaFilms - Azure Infrastructure Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar login en Azure
Write-Host "Verificando login en Azure..." -ForegroundColor Yellow
try {
    az account show | Out-Null
    Write-Host "✓ Login verificado" -ForegroundColor Green
} catch {
    Write-Host "Error: No estás logueado en Azure. Ejecuta 'az login'" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Crear Resource Group
Write-Host "Creando Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output table
Write-Host "✓ Resource Group creado" -ForegroundColor Green
Write-Host ""

# Crear Virtual Network
Write-Host "Creando Virtual Network..." -ForegroundColor Yellow
az network vnet create `
  --resource-group $RESOURCE_GROUP `
  --name $VNET_NAME `
  --address-prefix 10.0.0.0/16 `
  --location $LOCATION `
  --output table
Write-Host "✓ VNet creada" -ForegroundColor Green
Write-Host ""

# Crear Subnets
Write-Host "Creando Subnets..." -ForegroundColor Yellow

az network vnet subnet create `
  --resource-group $RESOURCE_GROUP `
  --vnet-name $VNET_NAME `
  --name frontend-subnet `
  --address-prefix 10.0.1.0/24 `
  --output table

az network vnet subnet create `
  --resource-group $RESOURCE_GROUP `
  --vnet-name $VNET_NAME `
  --name backend-subnet `
  --address-prefix 10.0.2.0/24 `
  --output table

az network vnet subnet create `
  --resource-group $RESOURCE_GROUP `
  --vnet-name $VNET_NAME `
  --name batch-subnet `
  --address-prefix 10.0.3.0/24 `
  --output table

az network vnet subnet create `
  --resource-group $RESOURCE_GROUP `
  --vnet-name $VNET_NAME `
  --name database-subnet `
  --address-prefix 10.0.4.0/24 `
  --output table

Write-Host "✓ Subnets creadas" -ForegroundColor Green
Write-Host ""

# Crear Storage Account
Write-Host "Creando Storage Account..." -ForegroundColor Yellow
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2 `
  --output table
Write-Host "✓ Storage Account creado" -ForegroundColor Green
Write-Host ""

# Crear Container
Write-Host "Creando Blob Container..." -ForegroundColor Yellow
az storage container create `
  --name $CONTAINER_NAME `
  --account-name $STORAGE_ACCOUNT `
  --public-access off `
  --output table
Write-Host "✓ Container creado" -ForegroundColor Green
Write-Host ""

# Obtener Connection String
Write-Host "Obteniendo Connection String..." -ForegroundColor Yellow
$CONNECTION_STRING = az storage account show-connection-string `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --output tsv
Write-Host "✓ Connection String obtenido" -ForegroundColor Green
Write-Host ""

# Crear VMs
Write-Host "Creando Virtual Machines..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Yellow
Write-Host ""

# VM Database
Write-Host "Creando VM Database..." -ForegroundColor Yellow
az vm create `
  --resource-group $RESOURCE_GROUP `
  --name jovafilms-db-vm `
  --image Ubuntu2204 `
  --size Standard_B2ms `
  --vnet-name $VNET_NAME `
  --subnet database-subnet `
  --private-ip-address 10.0.4.4 `
  --public-ip-address '""' `
  --admin-username azureuser `
  --generate-ssh-keys `
  --os-disk-size-gb 128 `
  --output table
Write-Host "✓ VM Database creada" -ForegroundColor Green
Write-Host ""

# VM Backend
Write-Host "Creando VM Backend..." -ForegroundColor Yellow
az vm create `
  --resource-group $RESOURCE_GROUP `
  --name jovafilms-backend-vm `
  --image Ubuntu2204 `
  --size Standard_B2s `
  --vnet-name $VNET_NAME `
  --subnet backend-subnet `
  --private-ip-address 10.0.2.4 `
  --public-ip-address '""' `
  --admin-username azureuser `
  --generate-ssh-keys `
  --output table
Write-Host "✓ VM Backend creada" -ForegroundColor Green
Write-Host ""

# VM Batch
Write-Host "Creando VM Batch..." -ForegroundColor Yellow
az vm create `
  --resource-group $RESOURCE_GROUP `
  --name jovafilms-batch-vm `
  --image Ubuntu2204 `
  --size Standard_B1s `
  --vnet-name $VNET_NAME `
  --subnet batch-subnet `
  --private-ip-address 10.0.3.4 `
  --public-ip-address '""' `
  --admin-username azureuser `
  --generate-ssh-keys `
  --output table
Write-Host "✓ VM Batch creada" -ForegroundColor Green
Write-Host ""

# VM Frontend
Write-Host "Creando VM Frontend..." -ForegroundColor Yellow
az vm create `
  --resource-group $RESOURCE_GROUP `
  --name jovafilms-frontend-vm `
  --image Ubuntu2204 `
  --size Standard_B2s `
  --vnet-name $VNET_NAME `
  --subnet frontend-subnet `
  --private-ip-address 10.0.1.4 `
  --public-ip-address-allocation static `
  --admin-username azureuser `
  --generate-ssh-keys `
  --output table
Write-Host "✓ VM Frontend creada" -ForegroundColor Green
Write-Host ""

# Obtener IP Pública del Frontend
$FRONTEND_PUBLIC_IP = az vm show -d `
  --resource-group $RESOURCE_GROUP `
  --name jovafilms-frontend-vm `
  --query publicIps -o tsv

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Infraestructura creada exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Información importante:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Resource Group: " -NoNewline; Write-Host $RESOURCE_GROUP -ForegroundColor Green
Write-Host "Location: " -NoNewline; Write-Host $LOCATION -ForegroundColor Green
Write-Host "Frontend Public IP: " -NoNewline; Write-Host $FRONTEND_PUBLIC_IP -ForegroundColor Green
Write-Host ""
Write-Host "Connection String (guardar en .env):" -ForegroundColor Yellow
Write-Host $CONNECTION_STRING -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configurar Network Security Groups (ejecutar configure-nsg.ps1)"
Write-Host "2. Instalar software en cada VM (ver AZURE_DEPLOYMENT_GUIDE.md)"
Write-Host "3. Configurar variables de entorno"
Write-Host "4. Desplegar aplicaciones"
Write-Host ""
