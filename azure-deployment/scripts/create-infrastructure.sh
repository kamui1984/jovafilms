#!/bin/bash

# Script para crear la infraestructura completa en Azure
# Autor: JovaFilms Team
# Fecha: Noviembre 2024

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
RESOURCE_GROUP="jovafilms-rg"
LOCATION="eastus"
VNET_NAME="jovafilms-vnet"
STORAGE_ACCOUNT="jovafilmsstorage"
CONTAINER_NAME="reviews-files"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  JovaFilms - Azure Infrastructure Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar login en Azure
echo -e "${YELLOW}Verificando login en Azure...${NC}"
az account show > /dev/null 2>&1 || { echo -e "${RED}Error: No estás logueado en Azure. Ejecuta 'az login'${NC}"; exit 1; }
echo -e "${GREEN}✓ Login verificado${NC}"
echo ""

# Crear Resource Group
echo -e "${YELLOW}Creando Resource Group...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --output table
echo -e "${GREEN}✓ Resource Group creado${NC}"
echo ""

# Crear Virtual Network
echo -e "${YELLOW}Creando Virtual Network...${NC}"
az network vnet create \
  --resource-group $RESOURCE_GROUP \
  --name $VNET_NAME \
  --address-prefix 10.0.0.0/16 \
  --location $LOCATION \
  --output table
echo -e "${GREEN}✓ VNet creada${NC}"
echo ""

# Crear Subnets
echo -e "${YELLOW}Creando Subnets...${NC}"

az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name frontend-subnet \
  --address-prefix 10.0.1.0/24 \
  --output table

az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name backend-subnet \
  --address-prefix 10.0.2.0/24 \
  --output table

az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name batch-subnet \
  --address-prefix 10.0.3.0/24 \
  --output table

az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name database-subnet \
  --address-prefix 10.0.4.0/24 \
  --output table

echo -e "${GREEN}✓ Subnets creadas${NC}"
echo ""

# Crear Storage Account
echo -e "${YELLOW}Creando Storage Account...${NC}"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --output table
echo -e "${GREEN}✓ Storage Account creado${NC}"
echo ""

# Crear Container
echo -e "${YELLOW}Creando Blob Container...${NC}"
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT \
  --public-access off \
  --output table
echo -e "${GREEN}✓ Container creado${NC}"
echo ""

# Obtener Connection String
echo -e "${YELLOW}Obteniendo Connection String...${NC}"
CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv)
echo -e "${GREEN}✓ Connection String obtenido${NC}"
echo ""

# Crear VMs
echo -e "${YELLOW}Creando Virtual Machines...${NC}"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
echo ""

# VM Database
echo -e "${YELLOW}Creando VM Database...${NC}"
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name jovafilms-db-vm \
  --image Ubuntu2204 \
  --size Standard_B2ms \
  --vnet-name $VNET_NAME \
  --subnet database-subnet \
  --private-ip-address 10.0.4.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys \
  --os-disk-size-gb 128 \
  --output table
echo -e "${GREEN}✓ VM Database creada${NC}"
echo ""

# VM Backend
echo -e "${YELLOW}Creando VM Backend...${NC}"
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name jovafilms-backend-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name $VNET_NAME \
  --subnet backend-subnet \
  --private-ip-address 10.0.2.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys \
  --output table
echo -e "${GREEN}✓ VM Backend creada${NC}"
echo ""

# VM Batch
echo -e "${YELLOW}Creando VM Batch...${NC}"
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name jovafilms-batch-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --vnet-name $VNET_NAME \
  --subnet batch-subnet \
  --private-ip-address 10.0.3.4 \
  --public-ip-address "" \
  --admin-username azureuser \
  --generate-ssh-keys \
  --output table
echo -e "${GREEN}✓ VM Batch creada${NC}"
echo ""

# VM Frontend
echo -e "${YELLOW}Creando VM Frontend...${NC}"
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name jovafilms-frontend-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name $VNET_NAME \
  --subnet frontend-subnet \
  --private-ip-address 10.0.1.4 \
  --public-ip-address-allocation static \
  --admin-username azureuser \
  --generate-ssh-keys \
  --output table
echo -e "${GREEN}✓ VM Frontend creada${NC}"
echo ""

# Obtener IP Pública del Frontend
FRONTEND_PUBLIC_IP=$(az vm show -d \
  --resource-group $RESOURCE_GROUP \
  --name jovafilms-frontend-vm \
  --query publicIps -o tsv)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Infraestructura creada exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Información importante:${NC}"
echo ""
echo -e "Resource Group: ${GREEN}$RESOURCE_GROUP${NC}"
echo -e "Location: ${GREEN}$LOCATION${NC}"
echo -e "Frontend Public IP: ${GREEN}$FRONTEND_PUBLIC_IP${NC}"
echo ""
echo -e "${YELLOW}Connection String (guardar en .env):${NC}"
echo -e "${GREEN}$CONNECTION_STRING${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Configurar Network Security Groups (ejecutar configure-nsg.sh)"
echo "2. Instalar software en cada VM (ver AZURE_DEPLOYMENT_GUIDE.md)"
echo "3. Configurar variables de entorno"
echo "4. Desplegar aplicaciones"
echo ""
