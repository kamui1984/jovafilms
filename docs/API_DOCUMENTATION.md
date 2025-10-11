# 📡 Documentación de API - JovaFilms

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Autenticación

### Registro de Usuario
**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Juan Pérez"
}
```

**Respuesta Exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `409`: Email ya registrado

---

### Iniciar Sesión
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales incorrectas

---

### Obtener Perfil
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

**Errores:**
- `401`: Token inválido o expirado

---

## 🎬 Películas

### Listar Películas
**Endpoint:** `GET /movies`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20, max: 100)

**Ejemplo:**
```
GET /movies?page=1&limit=20
```

**Respuesta Exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "hashCode": "a1b2c3d4e5f6g7h8",
      "title": "The Shawshank Redemption",
      "year": 1994,
      "director": "Frank Darabont",
      "cast": "[\"Tim Robbins\",\"Morgan Freeman\",\"Bob Gunton\"]",
      "synopsis": "Dos hombres encarcelados...",
      "genre": "Drama",
      "posterUrl": "https://image.tmdb.org/t/p/w500/...",
      "createdAt": "2025-10-10T15:00:00.000Z",
      "updatedAt": "2025-10-10T15:00:00.000Z",
      "averageRating": 4.5,
      "reviewCount": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### Obtener Película por ID
**Endpoint:** `GET /movies/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplo:**
```
GET /movies/1
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "hashCode": "a1b2c3d4e5f6g7h8",
  "title": "The Shawshank Redemption",
  "year": 1994,
  "director": "Frank Darabont",
  "cast": "[\"Tim Robbins\",\"Morgan Freeman\",\"Bob Gunton\"]",
  "synopsis": "Dos hombres encarcelados se unen a lo largo de varios años...",
  "genre": "Drama",
  "posterUrl": "https://image.tmdb.org/t/p/w500/...",
  "createdAt": "2025-10-10T15:00:00.000Z",
  "updatedAt": "2025-10-10T15:00:00.000Z",
  "averageRating": 4.5,
  "reviewCount": 10
}
```

**Errores:**
- `404`: Película no encontrada

---

### Crear Película
**Endpoint:** `POST /movies`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
  "synopsis": "Un ladrón que roba secretos corporativos...",
  "genre": "Sci-Fi",
  "posterUrl": "https://example.com/poster.jpg"
}
```

**Validaciones:**
- `title`: Requerido, mínimo 1 carácter
- `year`: Requerido, entre 1888 y año actual + 5
- `director`: Requerido, mínimo 1 carácter
- `cast`: Requerido, array con al menos 1 actor
- `synopsis`: Requerido, mínimo 10 caracteres
- `genre`: Requerido, mínimo 1 carácter
- `posterUrl`: Opcional, debe ser URL válida

**Respuesta Exitosa (201):**
```json
{
  "id": 16,
  "hashCode": "x9y8z7w6v5u4t3s2",
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "cast": "[\"Leonardo DiCaprio\",\"Joseph Gordon-Levitt\",\"Ellen Page\"]",
  "synopsis": "Un ladrón que roba secretos corporativos...",
  "genre": "Sci-Fi",
  "posterUrl": "https://example.com/poster.jpg",
  "createdAt": "2025-10-10T16:00:00.000Z",
  "updatedAt": "2025-10-10T16:00:00.000Z",
  "averageRating": 0,
  "reviewCount": 0
}
```

**Errores:**
- `400`: Datos inválidos
- `409`: Película ya existe (mismo título y año)

---

### Buscar Películas
**Endpoint:** `GET /movies/search`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `title` (opcional): Búsqueda parcial por título
- `year` (opcional): Año exacto
- `director` (opcional): Búsqueda parcial por director
- `genre` (opcional): Búsqueda parcial por género
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)

**Ejemplo:**
```
GET /movies/search?title=matrix&genre=sci-fi&page=1&limit=10
```

**Respuesta Exitosa (200):**
```json
{
  "data": [
    {
      "id": 7,
      "hashCode": "...",
      "title": "The Matrix",
      "year": 1999,
      "director": "Lana Wachowski, Lilly Wachowski",
      "cast": "[\"Keanu Reeves\",\"Laurence Fishburne\"]",
      "synopsis": "Un hacker de computadoras aprende...",
      "genre": "Sci-Fi",
      "posterUrl": "https://...",
      "createdAt": "2025-10-10T15:00:00.000Z",
      "updatedAt": "2025-10-10T15:00:00.000Z",
      "averageRating": 4.8,
      "reviewCount": 25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## ⭐ Reseñas

### Crear Reseña
**Endpoint:** `POST /reviews`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "movieId": 1,
  "rating": 5,
  "comment": "Excelente película, una obra maestra del cine."
}
```

**Validaciones:**
- `movieId`: Requerido, debe existir
- `rating`: Requerido, entre 1 y 5
- `comment`: Requerido, mínimo 10 caracteres

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "rating": 5,
  "comment": "Excelente película, una obra maestra del cine.",
  "validated": false,
  "createdAt": "2025-10-10T16:30:00.000Z",
  "user": {
    "id": 1,
    "name": "Juan Pérez"
  }
}
```

**Nota:** La reseña se crea con `validated: false`. El servicio batch la validará automáticamente.

**Errores:**
- `400`: Datos inválidos
- `404`: Película no encontrada

---

### Obtener Reseñas de una Película
**Endpoint:** `GET /reviews/movie/:movieId`

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplo:**
```
GET /reviews/movie/1
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "excelente película, una obra maestra del cine.",
    "validated": true,
    "createdAt": "2025-10-10T16:30:00.000Z",
    "user": {
      "id": 1,
      "name": "Juan Pérez"
    }
  },
  {
    "id": 2,
    "rating": 4,
    "comment": "Muy buena, aunque un poco larga.",
    "validated": true,
    "createdAt": "2025-10-10T17:00:00.000Z",
    "user": {
      "id": 2,
      "name": "María García"
    }
  }
]
```

---

### Obtener Mis Reseñas
**Endpoint:** `GET /reviews/user/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "excelente película, una obra maestra del cine.",
    "validated": true,
    "createdAt": "2025-10-10T16:30:00.000Z",
    "updatedAt": "2025-10-10T16:35:00.000Z",
    "movie": {
      "id": 1,
      "title": "The Shawshank Redemption",
      "year": 1994,
      "posterUrl": "https://..."
    }
  }
]
```

---

## 🏥 Health Check

### Verificar Estado del Servidor
**Endpoint:** `GET /health`

**Sin autenticación requerida**

**Respuesta Exitosa (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-10T16:45:00.000Z",
  "uptime": 3600.5
}
```

---

## ❌ Códigos de Error

### Estructura de Error
```json
{
  "error": "Nombre del Error",
  "message": "Descripción del error",
  "statusCode": 400,
  "details": {}
}
```

### Códigos HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | Token inválido, expirado o faltante |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Recurso duplicado (email, película) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## 🔒 Autenticación JWT

### Formato del Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvQGV4YW1wbGUuY29tIiwibmFtZSI6Ikp1YW4gUMOpcmV6IiwiaWF0IjoxNjk2OTU2MDAwLCJleHAiOjE2OTcwNDI0MDB9.signature
```

### Payload del Token
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "iat": 1696956000,
  "exp": 1697042400
}
```

### Expiración
- **Duración:** 24 horas
- **Renovación:** El cliente debe hacer login nuevamente

---

## 🚦 Rate Limiting

**Límite:** 100 peticiones por 15 minutos por IP

**Headers de Respuesta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696957200
```

**Respuesta al exceder límite (429):**
```json
{
  "error": "Too Many Requests",
  "message": "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
  "statusCode": 429
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo con cURL

**Registro:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Listar Películas:**
```bash
curl -X GET http://localhost:3000/api/movies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Crear Reseña:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 1,
    "rating": 5,
    "comment": "Increíble película, altamente recomendada."
  }'
```

### Ejemplo con JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Login
const login = async () => {
  const response = await api.post('/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  const token = response.data.token;
  
  // Configurar token para futuras peticiones
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  return response.data;
};

// Obtener películas
const getMovies = async () => {
  const response = await api.get('/movies?page=1&limit=20');
  return response.data;
};

// Crear reseña
const createReview = async (movieId, rating, comment) => {
  const response = await api.post('/reviews', {
    movieId,
    rating,
    comment
  });
  return response.data;
};
```

---

## 🧪 Testing de API

### Postman Collection
Importa esta colección en Postman para probar todos los endpoints:

```json
{
  "info": {
    "name": "JovaFilms API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"name\": \"Test User\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 📚 Notas Adicionales

### Hash Code de Películas
El `hashCode` se genera automáticamente usando:
```
hash(titulo_sin_espacios_minusculas + año)
```

Ejemplo:
- Título: "The Matrix"
- Año: 1999
- Input: "thematrix1999"
- Hash: SHA-256 (primeros 16 caracteres)

### Validación de Reseñas (Batch)
- Las reseñas se crean con `validated: false`
- El servicio batch se ejecuta cada 5 minutos
- Convierte palabras en MAYÚSCULAS a minúsculas
- Actualiza `validated: true`
- Ejemplo: "EXCELENTE película" → "excelente película"

### Formato de Cast
El campo `cast` se almacena como JSON string:
```json
"[\"Tim Robbins\",\"Morgan Freeman\",\"Bob Gunton\"]"
```

Para usarlo en el frontend:
```javascript
const castArray = JSON.parse(movie.cast);
// ["Tim Robbins", "Morgan Freeman", "Bob Gunton"]
```
