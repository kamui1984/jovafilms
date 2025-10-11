# 🎬 JovaFilms - Sistema de Reseñas Cinematográficas

## Descripción

JovaFilms es una plataforma web que permite a usuarios registrados consultar, agregar y reseñar películas. El sistema implementa una arquitectura 3-tier con un servicio batch para validación de contenido.

## Arquitectura

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Base de Datos**: PostgreSQL
- **Batch Service**: Node.js + node-cron

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

## Documentación

- [Arquitectura del Sistema](./docs/arquitectura.md)
- [Documentación de API](./docs/api-documentation.md)
- [Diagramas](./docs/diagrams/)

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


## Licencia

Este proyecto es para el curo de electiva 1 2025-2 - Universidad Antonio Nariño