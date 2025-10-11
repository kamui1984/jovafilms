# 📖 Guía de Instalación - JovaFilms

## 📋 Requisitos Previos

### Software Necesario
- **Node.js**: v18 o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL**: v15 o superior ([Descargar](https://www.postgresql.org/download/))
- **Git**: Para clonar el repositorio ([Descargar](https://git-scm.com/))
- **Editor de Código**: VS Code recomendado

### Verificar Instalaciones
```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
psql --version    # Debe mostrar PostgreSQL 15.x o superior
```

---

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Proyecto
```

### Paso 2: Configurar PostgreSQL

1. **Iniciar PostgreSQL**
   - Windows: Buscar "pgAdmin" o "PostgreSQL" en el menú inicio
   - Linux/Mac: `sudo service postgresql start`

2. **Crear Base de Datos**
   ```sql
   -- Conectarse a PostgreSQL
   psql -U postgres

   -- Crear base de datos
   CREATE DATABASE jovafilms_db;

   -- Crear usuario (opcional)
   CREATE USER jovafilms_user WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE jovafilms_db TO jovafilms_user;
   ```

### Paso 3: Configurar Variables de Entorno

1. **Backend**
   ```bash
   cd backend
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

   Editar `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/jovafilms_db"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=tu_clave_secreta_muy_segura_cambiala
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   ```

2. **Batch Service**
   ```bash
   cd batch-service
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

   Editar `batch-service/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/jovafilms_db"
   BATCH_INTERVAL_MINUTES=5
   NODE_ENV=development
   ```

3. **Frontend**
   ```bash
   cd frontend
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

   Editar `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Paso 4: Instalar Dependencias

**Opción A: Script Automático (Recomendado)**
```bash
# Windows
scripts\setup.bat

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Opción B: Manual**
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

# Batch Service
cd batch-service
npm install
npx prisma generate
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Paso 5: Verificar Instalación

1. **Verificar Base de Datos**
   ```bash
   cd backend
   npx prisma studio
   ```
   Esto abrirá una interfaz web en `http://localhost:5555` donde puedes ver las tablas y datos.

2. **Verificar que las películas se cargaron**
   - En Prisma Studio, ve a la tabla `Movie`
   - Deberías ver 15 películas precargadas

---

## ▶️ Ejecutar el Sistema

### Opción A: Script Automático (Recomendado)
```bash
# Windows
scripts\start.bat

# Linux/Mac
chmod +x scripts/start.sh
./scripts/start.sh
```

### Opción B: Manual (3 terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Batch Service:**
```bash
cd batch-service
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### URLs de Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 🧪 Probar el Sistema

### 1. Crear Usuario
1. Abre http://localhost:5173
2. Haz clic en "Regístrate"
3. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: tu@email.com
   - Contraseña: password123
4. Haz clic en "Registrarse"

### 2. Explorar Películas
- Verás el catálogo con 15 películas precargadas
- Usa la barra de búsqueda para filtrar

### 3. Ver Detalle y Reseñar
1. Haz clic en cualquier película
2. Lee la información completa
3. Escribe una reseña con calificación
4. Observa que la reseña se marca como "no validada"

### 4. Verificar Batch Service
1. Espera 5 minutos (o el intervalo configurado)
2. Recarga la página de la película
3. La reseña ahora debe estar marcada como "✓ Validado"
4. Las palabras en mayúsculas se habrán convertido a minúsculas

### 5. Agregar Película
1. Ve a "Agregar Película"
2. Completa el formulario
3. Intenta agregar la misma película dos veces
4. Deberías ver un error de duplicado

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos exista

### Error: "Port 3000 already in use"
**Solución:**
1. Detén cualquier proceso usando el puerto 3000
2. O cambia el puerto en `backend/.env`

### Error: "Module not found"
**Solución:**
```bash
# Reinstalar dependencias
cd backend && npm install
cd ../batch-service && npm install
cd ../frontend && npm install
```

### Error: "Prisma Client not generated"
**Solución:**
```bash
cd backend
npx prisma generate
cd ../batch-service
npx prisma generate
```

### Frontend no carga estilos
**Solución:**
```bash
cd frontend
npm install tailwindcss postcss autoprefixer
```

---

## 🔄 Reiniciar el Sistema

### Detener Servicios
- **Windows**: Cerrar las ventanas de comando
- **Linux/Mac**: `Ctrl+C` en cada terminal o usar los PIDs mostrados

### Limpiar y Reiniciar Base de Datos
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

---

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)

---

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v18+)
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `jovafilms_db` creada
- [ ] Archivos `.env` configurados en los 3 proyectos
- [ ] Dependencias instaladas (`npm install`)
- [ ] Migraciones ejecutadas (`prisma migrate`)
- [ ] Seed ejecutado (15 películas cargadas)
- [ ] Backend corriendo en puerto 3000
- [ ] Batch Service corriendo
- [ ] Frontend corriendo en puerto 5173
- [ ] Usuario de prueba creado
- [ ] Reseña de prueba creada y validada

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en las consolas
2. Verifica que todos los servicios estén corriendo
3. Consulta la sección de solución de problemas
4. Contacta al equipo de desarrollo
