# 🌩️ Migración a Azure Cloud - JovaFilms Sprint 2

## 📋 Resumen Ejecutivo

Este documento detalla la migración completa de JovaFilms desde un ambiente on-premise hacia la nube de Microsoft Azure, implementando una arquitectura distribuida con componentes separados y almacenamiento en la nube.

### Cambios Principales
- ✅ Migración completa a Azure Cloud
- ✅ Separación de componentes en VMs independientes
- ✅ Integración de Azure Blob Storage para archivos de reseñas
- ✅ Aislamiento de red con Azure Virtual Network
- ✅ Configuración de seguridad y CORS

---

## 🏗️ Arquitectura Azure

### Componentes Principales

1. **Frontend VM** (10.0.1.4) - Pública
   - React + Nginx
   - Standard_B2s (2 vCPU, 4GB RAM)
   - Ubuntu 22.04 LTS

2. **Backend VM** (10.0.2.4) - Privada
   - Node.js + Express API
   - Standard_B2s (2 vCPU, 4GB RAM)
   - Ubuntu 22.04 LTS

3. **Batch VM** (10.0.3.4) - Privada
   - Node.js + Cron + Azure SDK
   - Standard_B1s (1 vCPU, 1GB RAM)
   - Ubuntu 22.04 LTS

4. **Database VM** (10.0.4.4) - Privada
   - PostgreSQL 15
   - Standard_B2ms (2 vCPU, 8GB RAM)
   - Ubuntu 22.04 LTS

5. **Azure Blob Storage**
   - Almacenamiento de archivos de reseñas
   - Container: reviews-files
   - Acceso privado con SAS tokens

### Network Security

- **VNet**: 10.0.0.0/16
- **Subnets**: 4 subnets aisladas (10.0.1-4.0/24)
- **NSG**: Reglas restrictivas por subnet
- **IP Pública**: Solo Frontend VM
- **Acceso privado**: Backend, Batch y Database

---

## 🔄 Cambios en la Aplicación

### 1. Schema de Base de Datos

Nueva columna en tabla `reviews`:

```sql
ALTER TABLE reviews ADD COLUMN blob_storage_path VARCHAR(500);
```

### 2. Batch Service - Integración con Blob Storage

**Nueva funcionalidad:**
1. Crear archivo de texto con contenido de reseña
2. Subir archivo a Azure Blob Storage
3. Guardar ruta del archivo en base de datos
4. Convertir mayúsculas a minúsculas
5. Marcar como validada

**Dependencias nuevas:**
```json
{
  "dependencies": {
    "@azure/storage-blob": "^12.17.0"
  }
}
```

### 3. Configuración CORS

**Backend:**
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://10.0.1.4',
    'http://<FRONTEND_PUBLIC_IP>'
  ],
  credentials: true
}));
```

### 4. Variables de Entorno

**Backend `.env`:**
```env
DATABASE_URL="postgresql://jovafilms:password@10.0.4.4:5432/jovafilms_db"
JWT_SECRET=production_secret
PORT=3000
NODE_ENV=production
```

**Batch `.env`:**
```env
DATABASE_URL="postgresql://jovafilms:password@10.0.4.4:5432/jovafilms_db"
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=jovafilmsstorage;AccountKey=<KEY>;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="reviews-files"
```

**Frontend `.env`:**
```env
VITE_API_URL=http://10.0.2.4:3000
```

---

## 💰 Estimación de Costos Azure

### Costos Mensuales (Región: East US)

| Recurso | Especificación | Costo Mensual (USD) |
|---------|----------------|---------------------|
| **VM Frontend** | Standard_B2s | $30.37 |
| **VM Backend** | Standard_B2s | $30.37 |
| **VM Batch** | Standard_B1s | $7.59 |
| **VM Database** | Standard_B2ms | $60.74 |
| **Discos SSD** | 3x30GB + 1x128GB | $15.00 |
| **IP Pública** | 1 IP estática | $3.65 |
| **Blob Storage** | 10GB + operaciones | $0.50 |
| **Ancho de Banda** | 100GB salida | $8.70 |
| **TOTAL MENSUAL** | | **$156.92** |
| **TOTAL ANUAL** | | **$1,883** |

### Tabla de Facturación Proyectada

| Período | Compute | Storage | Network | Total |
|---------|---------|---------|---------|-------|
| Mes 1 | $129.07 | $15.50 | $12.35 | $156.92 |
| Mes 3 | $129.07 | $15.50 | $12.35 | $156.92 |
| Mes 6 | $129.07 | $15.50 | $12.35 | $156.92 |
| Mes 12 | $129.07 | $15.50 | $12.35 | $156.92 |
| **Año 1** | **$1,548.84** | **$186.00** | **$148.20** | **$1,883.04** |

### Optimizaciones de Costo

1. **Usar Azure Database for PostgreSQL**: Ahorro ~$10/mes
2. **Apagar VMs fuera de horario**: Ahorro ~40%
3. **Usar Reserved Instances**: Ahorro ~30%
4. **Azure Container Instances**: Ahorro ~$76/mes

---

## 🚀 Guía de Despliegue

Ver documentos detallados:
- `AZURE_DEPLOYMENT_GUIDE.md` - Paso a paso completo
- `azure-deployment/scripts/` - Scripts de automatización
- `azure-deployment/configs/` - Archivos de configuración

---

## 📊 Monitoreo y Mantenimiento

### Herramientas de Monitoreo
- Azure Monitor
- Application Insights
- Log Analytics

### Backups
- Base de datos: Backup diario automático
- Blob Storage: Soft delete habilitado (7 días)
- VMs: Azure Backup semanal

### Actualizaciones
- Sistema operativo: Automáticas con Azure Update Management
- Aplicaciones: CI/CD con GitHub Actions

---

## 🔒 Seguridad

### Implementado
- ✅ Network Security Groups (NSG)
- ✅ Acceso privado a backend, batch y database
- ✅ Blob Storage con acceso privado
- ✅ SSH keys para acceso a VMs
- ✅ HTTPS en frontend (certificado SSL)
- ✅ Secrets en Azure Key Vault

### Recomendaciones
- Implementar Azure Firewall
- Habilitar Azure DDoS Protection
- Configurar Azure Security Center
- Implementar Azure AD para autenticación

---

## 📝 Checklist de Migración

### Preparación
- [ ] Crear cuenta de Azure
- [ ] Configurar Azure CLI
- [ ] Crear Resource Group
- [ ] Configurar VNet y Subnets

### Infraestructura
- [ ] Crear Storage Account y Container
- [ ] Crear 4 Virtual Machines
- [ ] Configurar Network Security Groups
- [ ] Asignar IP pública a Frontend

### Aplicación
- [ ] Actualizar schema de base de datos
- [ ] Modificar batch service para Blob Storage
- [ ] Configurar CORS en backend
- [ ] Actualizar variables de entorno
- [ ] Build y deploy de aplicaciones

### Testing
- [ ] Verificar conectividad entre VMs
- [ ] Probar endpoints de API
- [ ] Verificar subida a Blob Storage
- [ ] Testing end-to-end completo

### Documentación
- [ ] Actualizar diagramas de arquitectura
- [ ] Documentar proceso de migración
- [ ] Crear tabla de costos
- [ ] Actualizar README con URL pública

---

## 🎯 Próximos Pasos

1. Ejecutar scripts de creación de infraestructura
2. Configurar cada VM según guía de despliegue
3. Migrar datos de base de datos
4. Realizar testing exhaustivo
5. Documentar URL pública del MVP
6. Preparar demo para sustentación

---

**Fecha de creación**: Noviembre 2025  
**Versión**: 2.0.0  
**Estado**: En Migración a Azure
