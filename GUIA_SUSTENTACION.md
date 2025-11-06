# 🎬 Guía de Sustentación - JovaFilms

## 📋 Checklist de Requisitos

### ✅ 1. Sistema Funcionando con Requerimientos Funcionales (30%)

**Requerimientos Implementados:**

1. ✅ **Registro y Login de Usuarios**
   - Registro con email, contraseña y nombre
   - Login con JWT
   - Protección de rutas

2. ✅ **Catálogo de Películas**
   - Listar películas con paginación
   - Ver detalles de película
   - Búsqueda por título, año, director, género

3. ✅ **Sistema de Reseñas**
   - Agregar reseñas con calificación 1-5
   - Ver reseñas de películas
   - Ver mis reseñas

4. ✅ **Agregar Películas**
   - Formulario completo con validación
   - Prevención de duplicados (hash code)

5. ✅ **Validación Automática**
   - Servicio batch que valida reseñas cada 5 minutos
   - Conversión de mayúsculas a minúsculas

**Demostración:**
- Mostrar login/registro
- Mostrar catálogo de películas
- Mostrar búsqueda
- Agregar una película
- Agregar una reseña
- Ver reseñas

---

### ✅ 2. Enlace Público al MVP (30%)

**URL Pública:** `http://158.23.59.126`

**Incluir en:**
- README.md (actualizar)
- Documentación de arquitectura
- Video de sustentación

**Credenciales de Prueba:**
- Email: `test@test.com`
- Password: `password123`

---

### ✅ 3. Documentación de Arquitectura (20%)

**Documentos Disponibles:**

1. **ARQUITECTURA.md** - Documentación técnica completa
   - Arquitectura 3-tier
   - Componentes detallados
   - Flujos de datos
   - Tecnologías utilizadas

2. **DIAGRAMAS_ARQUITECTURA.md** - Diagramas visuales
   - Diagrama de despliegue Azure
   - Diagrama de componentes
   - Diagrama de flujo de datos
   - Diagrama de secuencia

3. **API_DOCUMENTATION.md** - Documentación de endpoints

4. **AZURE_DEPLOYMENT_GUIDE.md** - Guía de despliegue

**Verificar que incluya:**
- ✅ Diagrama de despliegue (Azure)
- ✅ Diagrama de componentes
- ✅ Documento técnico completo

---

### ✅ 4. Repositorio en GitHub (20%)

**Verificar:**
- ✅ Código fuente completo
- ✅ README.md actualizado
- ✅ Documentación en carpeta `docs/`
- ✅ Scripts de despliegue
- ✅ .gitignore configurado
- ✅ Commits organizados

**Estructura del Repositorio:**
```
jovafilms/
├── backend/          # API REST
├── frontend/         # React App
├── batch-service/    # Servicio batch
├── docs/            # Documentación
├── azure-deployment/ # Scripts Azure
├── scripts/         # Scripts de desarrollo
└── README.md        # Documentación principal
```

---

### ✅ 5. Video de Sustentación/Demo (30%)

**Duración sugerida:** 10-15 minutos

**Estructura del Video:**

#### Parte 1: Introducción (2 min)
- Presentación del proyecto
- Objetivo y alcance
- Arquitectura general

#### Parte 2: Demo Funcional (5-7 min)
1. **Acceso al sistema**
   - Mostrar URL pública: http://158.23.59.126
   - Login con credenciales de prueba

2. **Funcionalidades principales**
   - Ver catálogo de películas
   - Buscar películas (título, año, director, género)
   - Ver detalles de una película
   - Agregar una nueva película
   - Agregar una reseña con calificación
   - Ver mis reseñas

3. **Validación automática**
   - Mostrar reseña pendiente
   - Explicar proceso batch (cada 5 min)

#### Parte 3: Arquitectura y Tecnologías (3-4 min)
1. **Arquitectura 3-tier**
   - Frontend (React + TypeScript)
   - Backend (Node.js + Express)
   - Base de datos (PostgreSQL)

2. **Despliegue en Azure**
   - Mostrar diagrama de despliegue
   - Explicar VMs y networking
   - Servicio batch

3. **Tecnologías utilizadas**
   - Stack tecnológico completo
   - Justificación de elecciones

#### Parte 4: Cierre (1-2 min)
- Resumen de logros
- Enlace al repositorio
- Conclusiones

---

## 🎥 Guión Detallado para el Video

### Introducción (2 minutos)

```
"Hola, mi nombre es [Tu Nombre] y hoy les presento JovaFilms, 
un sistema de reseñas cinematográficas desarrollado como parte 
del curso de Electiva 1.

JovaFilms es una plataforma web que permite a usuarios registrados:
- Consultar un catálogo de películas
- Agregar nuevas películas al sistema
- Escribir reseñas con calificaciones del 1 al 5
- Buscar películas por múltiples criterios

El sistema implementa una arquitectura 3-tier más un servicio 
batch para validación automática de contenido, y está desplegado 
en Microsoft Azure."
```

### Demo Funcional (5-7 minutos)

```
"Ahora voy a mostrar el sistema en funcionamiento. 
La aplicación está disponible públicamente en: http://158.23.59.126

[Mostrar navegador]

Primero, voy a iniciar sesión con las credenciales de prueba:
- Email: test@test.com
- Password: password123

[Login]

Una vez dentro, podemos ver el catálogo de películas. 
El sistema muestra las películas en formato de tarjetas con:
- Título y año
- Director
- Género
- Calificación promedio
- Número de reseñas

[Mostrar catálogo]

Ahora voy a buscar una película. El sistema permite buscar por:
- Título
- Año
- Director
- Género

[Buscar]

Al hacer clic en una película, vemos los detalles completos:
- Información completa
- Lista de reseñas existentes
- Formulario para agregar una nueva reseña

[Mostrar detalles]

Voy a agregar una reseña. El sistema permite:
- Calificación del 1 al 5
- Comentario
- La reseña será validada automáticamente por el servicio batch

[Agregar reseña]

También puedo agregar una nueva película al sistema. 
El formulario incluye validación y previene duplicados.

[Agregar película]

Finalmente, puedo ver todas mis reseñas en la sección 
'Mis Reseñas'.

[Mostrar mis reseñas]"
```

### Arquitectura (3-4 minutos)

```
"Ahora voy a explicar la arquitectura del sistema.

[Mostrar diagrama de despliegue]

El sistema está desplegado en Azure con la siguiente estructura:

1. Frontend VM (IP Pública)
   - Nginx como servidor web
   - React app compilada
   - Reverse proxy al backend

2. Backend VM (IP Privada)
   - Node.js + Express API
   - Autenticación JWT
   - Lógica de negocio

3. Database VM (IP Privada)
   - PostgreSQL 15
   - Datos de usuarios, películas y reseñas

4. Batch VM (IP Privada)
   - Servicio que valida reseñas cada 5 minutos
   - Convierte mayúsculas a minúsculas

[Mostrar diagrama de componentes]

A nivel de componentes, el sistema sigue una arquitectura 3-tier:

- Capa de Presentación: React con TypeScript
- Capa de Aplicación: Express API REST
- Capa de Datos: PostgreSQL con Prisma ORM

[Mostrar tecnologías]

Stack tecnológico:
- Frontend: React, TypeScript, Vite, TailwindCSS, Zustand
- Backend: Node.js, Express, TypeScript, Prisma
- Base de datos: PostgreSQL
- Despliegue: Azure VMs, Nginx"
```

### Cierre (1-2 minutos)

```
"En resumen, JovaFilms es un sistema completo que cumple 
todos los requerimientos funcionales solicitados:

✅ Registro y autenticación de usuarios
✅ Catálogo de películas con búsqueda avanzada
✅ Sistema de reseñas con calificaciones
✅ Validación automática de contenido
✅ Prevención de duplicados

El código fuente está disponible en GitHub: [URL del repositorio]

La documentación completa incluye:
- Arquitectura del sistema
- Diagramas de despliegue y componentes
- Documentación de API
- Guías de instalación y despliegue

Gracias por su atención."
```

---

## 📝 Puntos Clave a Mencionar

1. **Arquitectura 3-tier** bien definida
2. **Despliegue en la nube** (Azure)
3. **Seguridad** (JWT, rutas protegidas, VMs privadas)
4. **Escalabilidad** (separación de capas, servicios independientes)
5. **Validación automática** (servicio batch)
6. **Búsqueda avanzada** (múltiples criterios)
7. **Prevención de duplicados** (hash codes)

---

## 🔗 Enlaces Importantes

- **MVP Público:** http://158.23.59.126
- **Repositorio GitHub:** [Tu URL]
- **Documentación:** Ver carpeta `docs/`

---

## ✅ Checklist Final Antes de Grabar

- [ ] Sistema funcionando correctamente
- [ ] URL pública accesible
- [ ] Credenciales de prueba funcionando
- [ ] Documentación actualizada
- [ ] Repositorio GitHub actualizado
- [ ] Diagramas incluidos en documentación
- [ ] Script de demo preparado
- [ ] Capturas de pantalla listas (opcional)

---

## 💡 Tips para el Video

1. **Preparación:**
   - Prueba todas las funcionalidades antes de grabar
   - Ten las credenciales a mano
   - Abre los diagramas en otra ventana

2. **Grabación:**
   - Usa buena iluminación
   - Habla claro y pausado
   - Muestra el código/diagramas cuando sea relevante

3. **Edición:**
   - Añade títulos/transiciones si es necesario
   - Asegúrate de que el audio sea claro
   - Verifica que las URLs sean visibles

---

¡Éxito en tu sustentación! 🚀

