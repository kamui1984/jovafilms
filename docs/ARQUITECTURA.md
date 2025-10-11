# 🏗️ Documentación de Arquitectura - JovaFilms

## 📊 Visión General

JovaFilms es un sistema de reseñas cinematográficas implementado con una **arquitectura 3-tier** más un **servicio batch** para procesamiento asíncrono.

### Características Principales
- ✅ Registro y autenticación de usuarios
- ✅ Catálogo de películas con búsqueda avanzada
- ✅ Sistema de reseñas con calificaciones (1-5 estrellas)
- ✅ Validación automática de contenido (batch)
- ✅ Prevención de duplicados mediante hash codes
- ✅ API REST completa
- ✅ Interfaz web moderna y responsiva

---

## 🎯 Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA 1: FRONTEND                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + TailwindCSS            │   │
│  │  - Componentes reutilizables                        │   │
│  │  - State management (Zustand)                       │   │
│  │  - Routing (React Router)                           │   │
│  │  - Validación de formularios (Zod + React Hook Form)│   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA 2: BACKEND                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express + TypeScript                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  Controllers (Endpoints REST)                 │ │   │
│  │  ├───────────────────────────────────────────────┤ │   │
│  │  │  Services (Lógica de negocio)                 │ │   │
│  │  ├───────────────────────────────────────────────┤ │   │
│  │  │  Middlewares (Auth, Validación, Errores)      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA 3: BASE DE DATOS                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                          │   │
│  │  - users (Usuarios)                                  │   │
│  │  - movies (Películas)                                │   │
│  │  - reviews (Reseñas)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICIO BATCH                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + node-cron                                 │   │
│  │  - Validación de reseñas (cada 5 min)               │   │
│  │  - Conversión de mayúsculas a minúsculas            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Detallados

### 1. Frontend (Presentation Layer)

**Tecnologías:**
- React 19 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- Zustand (State management)
- React Router (Routing)
- Axios (HTTP client)
- React Hook Form + Zod (Validación)

**Estructura:**
```
frontend/src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── movies/          # MovieCard, SearchBar
│   ├── reviews/         # ReviewCard, ReviewForm
│   └── ProtectedRoute   # Guard de autenticación
├── pages/
│   ├── LoginPage        # Inicio de sesión
│   ├── RegisterPage     # Registro
│   ├── HomePage         # Catálogo de películas
│   ├── MovieDetailPage  # Detalle + reseñas
│   ├── AddMoviePage     # Agregar película
│   └── MyReviewsPage    # Mis reseñas
├── services/
│   ├── api              # Configuración Axios
│   ├── authService      # Servicios de autenticación
│   ├── movieService     # Servicios de películas
│   └── reviewService    # Servicios de reseñas
├── store/
│   └── authStore        # Estado global de autenticación
├── types/               # Tipos TypeScript
└── lib/
    └── utils            # Utilidades (formateo, etc.)
```

**Flujos Principales:**
1. **Autenticación**: Login → JWT guardado en localStorage → Header con token
2. **Navegación**: Rutas protegidas verifican autenticación
3. **Datos**: Axios interceptor agrega token automáticamente
4. **Estado**: Zustand maneja usuario autenticado globalmente

---

### 2. Backend (Business Logic Layer)

**Tecnologías:**
- Node.js 20 LTS
- Express.js (Framework web)
- TypeScript
- Prisma (ORM)
- JWT (Autenticación)
- Bcrypt (Hash de contraseñas)
- Zod (Validación)
- Winston (Logging)

**Estructura:**
```
backend/src/
├── controllers/
│   ├── authController    # POST /register, /login
│   ├── movieController   # CRUD películas
│   └── reviewController  # CRUD reseñas
├── services/
│   ├── authService       # Lógica de autenticación
│   ├── movieService      # Lógica de películas
│   ├── reviewService     # Lógica de reseñas
│   └── hashService       # Generación de hash codes
├── middlewares/
│   ├── authMiddleware    # Verificación JWT
│   ├── errorHandler      # Manejo de errores
│   └── validateRequest   # Validación Zod
├── routes/
│   ├── authRoutes        # Rutas de autenticación
│   ├── movieRoutes       # Rutas de películas
│   └── reviewRoutes      # Rutas de reseñas
├── config/
│   ├── env               # Variables de entorno
│   └── database          # Configuración Prisma
├── utils/
│   └── logger            # Winston logger
└── types/                # Tipos TypeScript
```

**API Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Perfil usuario | Sí |
| GET | `/api/movies` | Listar películas | Sí |
| GET | `/api/movies/:id` | Detalle película | Sí |
| POST | `/api/movies` | Crear película | Sí |
| GET | `/api/movies/search` | Buscar películas | Sí |
| POST | `/api/reviews` | Crear reseña | Sí |
| GET | `/api/reviews/movie/:id` | Reseñas de película | Sí |
| GET | `/api/reviews/user/me` | Mis reseñas | Sí |

**Seguridad:**
- JWT con expiración de 24h
- Bcrypt con 10 salt rounds
- Rate limiting (100 req/15min)
- Helmet.js para headers seguros
- CORS configurado
- Validación de inputs con Zod

---

### 3. Base de Datos (Data Layer)

**Tecnología:** PostgreSQL 15

**Esquema:**

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de películas
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  hash_code VARCHAR(16) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  director VARCHAR(255) NOT NULL,
  cast TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  genre VARCHAR(100) NOT NULL,
  poster_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_director ON movies(director);
CREATE INDEX idx_movies_genre ON movies(genre);

-- Tabla de reseñas
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_validated ON reviews(validated);
```

**Relaciones:**
- `users` 1:N `reviews` (Un usuario puede tener muchas reseñas)
- `movies` 1:N `reviews` (Una película puede tener muchas reseñas)

**Datos Iniciales:**
- 15 películas precargadas mediante seed
- Géneros: Drama, Crime, Action, Sci-Fi, Thriller, Mystery

---

### 4. Servicio Batch (Background Processing)

**Tecnología:**
- Node.js + TypeScript
- node-cron (Scheduler)
- Prisma (Acceso a BD)

**Funcionalidad:**
```javascript
// Cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  // 1. Buscar reseñas no validadas
  const reviews = await prisma.review.findMany({
    where: { validated: false }
  });

  // 2. Para cada reseña
  for (const review of reviews) {
    // 3. Convertir palabras en MAYÚSCULAS a minúsculas
    const validatedComment = convertUppercase(review.comment);
    
    // 4. Actualizar reseña
    await prisma.review.update({
      where: { id: review.id },
      data: {
        comment: validatedComment,
        validated: true
      }
    });
  }
});
```

**Lógica de Validación:**
- Detecta palabras completamente en mayúsculas
- Las convierte a minúsculas
- Mantiene capitalización normal (ej: "Película" permanece igual)
- Marca la reseña como validada

---

## 🔐 Seguridad

### Autenticación y Autorización
1. **Registro**: Password hasheado con bcrypt (10 rounds)
2. **Login**: Verificación de hash + generación de JWT
3. **Token JWT**: Incluye `{ id, email, name }`, expira en 24h
4. **Protección de Rutas**: Middleware verifica token en cada request
5. **Logout**: Cliente elimina token de localStorage

### Validación de Datos
- **Frontend**: React Hook Form + Zod (validación en tiempo real)
- **Backend**: Zod schemas en controllers
- **Base de Datos**: Constraints y tipos de Prisma

### Prevención de Ataques
- **SQL Injection**: Prisma usa queries parametrizadas
- **XSS**: React escapa HTML automáticamente
- **CSRF**: SameSite cookies + CORS configurado
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet.js**: Headers de seguridad HTTP

---

## 📈 Escalabilidad

### Limitaciones Actuales (Diseño Inicial)
- **Servidor Único**: Todos los componentes en una máquina
- **Base de Datos**: Una instancia de PostgreSQL
- **Sin Caché**: Queries directos a BD
- **Batch Síncrono**: Procesa todas las reseñas en un loop

### Mejoras Futuras
1. **Separar Servicios**: Contenedores Docker independientes
2. **Load Balancer**: Nginx para múltiples instancias backend
3. **Caché**: Redis para películas populares y sesiones
4. **CDN**: Para pósters de películas
5. **Queue System**: RabbitMQ/Bull para procesamiento batch
6. **Microservicios**: Separar auth, movies, reviews
7. **Réplicas BD**: Master-slave para lectura/escritura
8. **Monitoring**: Prometheus + Grafana

---

## 🔄 Flujos de Datos Principales

### Flujo 1: Registro de Usuario
```
1. Usuario completa formulario → Frontend valida con Zod
2. POST /api/auth/register → Backend recibe datos
3. authService.register() → Verifica email único
4. bcrypt.hash() → Hashea contraseña
5. prisma.user.create() → Guarda en BD
6. jwt.sign() → Genera token
7. Response { token, user } → Frontend guarda en localStorage
8. Redirect a "/" → Usuario autenticado
```

### Flujo 2: Agregar Película
```
1. Usuario completa formulario → Frontend valida
2. POST /api/movies → Backend recibe datos
3. hashService.generateMovieHash() → Genera hash único
4. prisma.movie.findUnique() → Verifica si existe
5. Si no existe → prisma.movie.create()
6. Si existe → Error 409 Conflict
7. Response { movie } → Frontend muestra película
```

### Flujo 3: Crear Reseña
```
1. Usuario escribe reseña → Frontend valida (rating 1-5)
2. POST /api/reviews → Backend recibe datos
3. reviewService.createReview() → Valida película existe
4. prisma.review.create({ validated: false }) → Guarda
5. Response { review } → Frontend muestra reseña
6. [5 minutos después]
7. Batch Service → Busca validated: false
8. Convierte mayúsculas → Actualiza validated: true
9. Usuario recarga → Ve reseña validada
```

---

## 🎨 Decisiones de Diseño

### ¿Por qué esta arquitectura?

**3-Tier:**
- ✅ Separación clara de responsabilidades
- ✅ Fácil de entender y mantener
- ✅ Permite escalar cada capa independientemente
- ✅ Cumple con requerimientos del proyecto

**Batch Service Separado:**
- ✅ No bloquea requests del usuario
- ✅ Procesa en background
- ✅ Fácil de escalar o reemplazar
- ✅ Logs independientes

**PostgreSQL:**
- ✅ Relacional (usuarios, películas, reseñas)
- ✅ ACID compliant
- ✅ Excelente para búsquedas (índices)
- ✅ Gratuito y robusto

**React + TypeScript:**
- ✅ Componentes reutilizables
- ✅ Type safety
- ✅ Ecosistema maduro
- ✅ Fácil de aprender

**Prisma ORM:**
- ✅ Type-safe queries
- ✅ Migraciones automáticas
- ✅ Excelente DX
- ✅ Previene SQL injection

---

## 📊 Métricas y Monitoreo

### Logs
- **Backend**: Winston (logs/all.log, logs/error.log)
- **Batch**: Winston (logs/batch.log, logs/batch-error.log)
- **Frontend**: Console (desarrollo)

### Health Checks
- `GET /health` → Status del backend
- Prisma `$connect()` → Verifica BD

### Métricas Importantes
- Tiempo de respuesta de API
- Tasa de errores
- Número de usuarios activos
- Reseñas creadas por día
- Películas más populares

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```
- Tests unitarios de services
- Tests de integración de endpoints
- Coverage con Jest

### Frontend
```bash
cd frontend
npm test
```
- Tests de componentes
- Tests de hooks
- Tests E2E (opcional con Playwright)

---

## 📚 Referencias

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Architecture](https://react.dev/learn/thinking-in-react)
- [3-Tier Architecture](https://en.wikipedia.org/wiki/Multitier_architecture)
