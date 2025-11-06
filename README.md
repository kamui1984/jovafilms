# 🎬 JovaFilms - Sistema de Reseñas Cinematográficas

## Descripción

JovaFilms es una plataforma web que permite a usuarios registrados consultar, agregar y reseñar películas. El sistema implementa una arquitectura 3-tier con un servicio batch para validación de contenido, desplegado en Microsoft Azure.

## 🌐 MVP en la Nube

**URL Pública**: http://158.23.59.126

**Estado**: ✅ Sistema funcionando y disponible públicamente

**Credenciales de Prueba:**
- Email: `test@test.com`
- Password: `password123`

### 🔧 Solución de Problemas de Conexión

Si el frontend carga pero no conecta con el backend, consulta:
- **[RESUMEN_EJECUTIVO_SOLUCION.md](./RESUMEN_EJECUTIVO_SOLUCION.md)** - Resumen ejecutivo
- **[CHECKLIST_RAPIDO.md](./CHECKLIST_RAPIDO.md)** - Solución en 15 minutos
- **[INSTRUCCIONES_VISUALES.md](./INSTRUCCIONES_VISUALES.md)** - Guía paso a paso con comandos
- **[SOLUCION_PROBLEMA_CONEXION.md](./SOLUCION_PROBLEMA_CONEXION.md)** - Guía completa
- **[DIAGNOSTICO_PROBLEMA.md](./DIAGNOSTICO_PROBLEMA.md)** - Análisis técnico detallado

## Arquitectura

### Sprint 1 (On-Premise)
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Base de Datos**: PostgreSQL
- **Batch Service**: Node.js + node-cron

### Sprint 2 (Azure Cloud) ⭐ NUEVO
- **Frontend VM**: Nginx + React (IP Pública)
- **Backend VM**: Node.js + Express API (Privada)
- **Database VM**: PostgreSQL 15 (Privada)
- **Batch VM**: Node.js + Cron + Azure SDK (Privada)
- **Storage**: Azure Blob Storage (Archivos de reseñas)

## Requisitos Previos

- Node.js 20 LTS o superior
- PostgreSQL 15 o superior
- npm o pnpm

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/kamui1984/jovafilms.git
cd Proyecto
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de PostgreSQL

# Batch Service
cp batch-service/.env.example batch-service/.env
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Batch Service
cd batch-service
npm install
cd ..
```

### 4. Configurar Base de Datos

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

## Ejecución

### Opción 1: Script de inicio (Recomendado)

**Windows:**
```bash
.\scripts\start.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### Opción 2: Manual

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Batch Service
cd batch-service
npm start

# Terminal 3 - Frontend
cd frontend
npm run dev
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

## 📚 Documentación

### Sprint 1 (On-Premise)
- [Arquitectura del Sistema](./docs/ARQUITECTURA.md)
- [Documentación de API](./docs/API_DOCUMENTATION.md)
- [Guía de Instalación](./docs/GUIA_INSTALACION.md)

### Sprint 2 (Azure Cloud) ⭐ NUEVO
- [Migración a Azure](./docs/AZURE_MIGRATION.md) - Resumen ejecutivo
- [Guía de Despliegue Azure](./docs/AZURE_DEPLOYMENT_GUIDE.md) - Paso a paso completo
- [Diagramas de Arquitectura](./docs/DIAGRAMAS_ARQUITECTURA.md) - Visualización completa
- [Migración SQL](./docs/ADD_BLOB_STORAGE_MIGRATION.sql) - Script de base de datos

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Equipo

- Jovany Gutierrez Vergara


## 🌩️ Despliegue en Azure (Sprint 2)

### Requisitos Previos
- Cuenta de Azure activa
- Azure CLI instalado
- Suscripción de Azure con créditos

### Despliegue Rápido

#### 1. Crear Infraestructura

**Windows:**
```powershell
cd azure-deployment/scripts
.\create-infrastructure.ps1
```

**Linux/Mac:**
```bash
cd azure-deployment/scripts
chmod +x create-infrastructure.sh
./create-infrastructure.sh
```

#### 2. Configurar VMs

Seguir la guía completa: [AZURE_DEPLOYMENT_GUIDE.md](./docs/AZURE_DEPLOYMENT_GUIDE.md)

#### 3. Actualizar Base de Datos

```bash
# Conectar a Database VM
ssh azureuser@10.0.4.4

# Ejecutar migración
psql -U jovafilms -d jovafilms_db -f ADD_BLOB_STORAGE_MIGRATION.sql
```

#### 4. Instalar Dependencias

```bash
# En cada VM (Backend y Batch)
npm install
npx prisma generate
npm run build
pm2 start dist/index.js
```

### Costos Estimados

| Recurso | Costo Mensual |
|---------|---------------|
| 4 Virtual Machines | $129.07 |
| Storage (Disks + Blob) | $15.50 |
| Networking | $12.35 |
| **Total** | **~$157/mes** |

Ver desglose completo en [AZURE_MIGRATION.md](./docs/AZURE_MIGRATION.md)

### Arquitectura Azure

```
Internet → Frontend VM (Pública) → Backend VM (Privada) → Database VM (Privada)
                                         ↓
                                    Batch VM (Privada) → Azure Blob Storage
```

Ver diagramas completos en [DIAGRAMAS_ARQUITECTURA.md](./docs/DIAGRAMAS_ARQUITECTURA.md)

---

## Licencia

Este proyecto es para el curso de Electiva 1 2025-2 - Universidad Antonio Nariño