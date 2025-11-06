# 🎨 Instrucciones Visuales - Solución JovaFilms

## 🚀 Guía Paso a Paso con Comandos Exactos

### Paso 1: Conectarse a la VM de Frontend

```bash
# Reemplaza <IP_PUBLICA_FRONTEND> con tu IP pública
# La puedes encontrar en Azure Portal → jovafilms-vm → Overview
ssh azureuser@<IP_PUBLICA_FRONTEND>
```

**Ejemplo:**
```bash
ssh azureuser@20.10.123.45
```

**¿Qué verás?**
```
Welcome to Ubuntu 22.04.3 LTS
...
azureuser@jovafilms-vm:~$
```

---

### Paso 2: Navegar al Proyecto

```bash
cd /home/azureuser/jovafilms
```

**Verificar que estás en el lugar correcto:**
```bash
ls -la
```

**Deberías ver:**
```
drwxr-xr-x  backend/
drwxr-xr-x  frontend/
drwxr-xr-x  batch-service/
drwxr-xr-x  azure-deployment/
-rw-r--r--  README.md
...
```

---

### Paso 3: Descargar Últimos Cambios

```bash
git pull origin main
```

**¿Qué verás?**
```
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
...
Updating 1a2b3c4..5d6e7f8
Fast-forward
 azure-deployment/scripts/fix-frontend-connection.sh | 150 +++++++++++++++++++
 SOLUCION_PROBLEMA_CONEXION.md                       | 300 ++++++++++++++++++++++++++++++++++
 ...
```

---

### Paso 4: Dar Permisos al Script

```bash
chmod +x azure-deployment/scripts/fix-frontend-connection.sh
```

**Verificar permisos:**
```bash
ls -la azure-deployment/scripts/fix-frontend-connection.sh
```

**Deberías ver:**
```
-rwxr-xr-x 1 azureuser azureuser 5432 Nov  6 10:00 fix-frontend-connection.sh
```
(La 'x' indica que es ejecutable)

---

### Paso 5: Ejecutar el Script

```bash
./azure-deployment/scripts/fix-frontend-connection.sh
```

**¿Qué verás?**

El script mostrará su progreso paso a paso:

```
🔧 Solucionando problema de conexión Frontend-Backend...

Paso 1: Verificando conectividad con el backend...
✓ Conectividad con backend OK

Paso 2: Verificando que el backend esté respondiendo...
✓ Backend responde correctamente

Paso 3: Creando archivo .env para el frontend...
✓ Archivo .env creado
VITE_API_URL=http://10.0.2.4:3000/api

Paso 4: Reconstruyendo el frontend con la nueva configuración...
> jovafilms-frontend@0.0.0 build
> vite build
...
✓ Build exitoso

Paso 5: Configurando Nginx...
✓ Configuración de Nginx creada

Paso 6: Habilitando sitio en Nginx...

Paso 7: Verificando configuración de Nginx...
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
✓ Configuración de Nginx válida

Paso 8: Reiniciando Nginx...
✓ Nginx reiniciado correctamente

Paso 9: Verificando que Nginx esté corriendo...
✓ Nginx está corriendo

========================================
✅ Configuración completada exitosamente
========================================

Próximos pasos:
1. Abre tu navegador y accede a la IP pública de esta VM
2. Deberías ver la página de login de JovaFilms
3. Intenta hacer login con un usuario existente
```

---

### Paso 6: Verificar en el Navegador

1. **Abre tu navegador** (Chrome, Firefox, Edge, etc.)

2. **Ve a la IP pública de tu VM Frontend:**
   ```
   http://<IP_PUBLICA_FRONTEND>
   ```
   Ejemplo: `http://20.10.123.45`

3. **Deberías ver la página de login de JovaFilms**

4. **Abre las DevTools (F12)**
   - Click derecho → Inspeccionar
   - O presiona F12

5. **Ve a la pestaña "Network"**

6. **Intenta hacer login:**
   - Email: `admin@jovafilms.com`
   - Password: `admin123`

7. **Verifica en Network:**
   - Deberías ver una petición a `/api/auth/login`
   - Status: 200 o 201
   - Response: JSON con token y datos del usuario

---

## 🎯 Verificación Visual

### ✅ Si TODO está bien:

**En el navegador:**
```
┌─────────────────────────────────────┐
│  JovaFilms - Login                  │
│                                     │
│  Email: [admin@jovafilms.com    ]  │
│  Password: [••••••••••••        ]  │
│                                     │
│  [        Login        ]            │
└─────────────────────────────────────┘
```

**Después de login exitoso:**
```
┌─────────────────────────────────────┐
│  JovaFilms - Dashboard              │
│  ┌─────────────────────────────┐   │
│  │  Películas Disponibles      │   │
│  │  - The Shawshank Redemption │   │
│  │  - The Godfather            │   │
│  │  - The Dark Knight          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**En DevTools → Network:**
```
Name                    Status  Type    Size
api/auth/login          201     xhr     1.2 KB
api/movies              200     xhr     5.4 KB
```

---

### ❌ Si hay problemas:

**Error: "Network Error"**

**En DevTools → Console:**
```
❌ Error: Network Error
   at createError (axios.js:123)
   ...
```

**Solución:**
```bash
# Verifica logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verifica que el backend esté corriendo
ssh azureuser@10.0.2.4 'pm2 status'
```

---

**Error: "CORS policy"**

**En DevTools → Console:**
```
❌ Access to XMLHttpRequest at 'http://10.0.2.4:3000/api/auth/login' 
   from origin 'http://20.10.123.45' has been blocked by CORS policy
```

**Solución:**
```bash
# Conéctate al backend
ssh azureuser@10.0.2.4

# Edita el archivo .env
nano /home/azureuser/jovafilms/backend/.env

# Agrega o modifica:
CORS_ORIGIN=http://20.10.123.45

# Guarda (Ctrl+O, Enter, Ctrl+X)

# Reinicia el backend
pm2 restart jovafilms-backend
```

---

## 📊 Comandos de Diagnóstico

### Ver logs en tiempo real:

```bash
# Logs de Nginx (en VM Frontend)
sudo tail -f /var/log/nginx/error.log
```

```bash
# Logs del Backend (desde VM Frontend)
ssh azureuser@10.0.2.4 'pm2 logs jovafilms-backend --lines 50'
```

### Verificar estado de servicios:

```bash
# Estado de Nginx (en VM Frontend)
sudo systemctl status nginx
```

```bash
# Estado del Backend (desde VM Frontend)
ssh azureuser@10.0.2.4 'pm2 status'
```

### Probar conectividad:

```bash
# Desde VM Frontend al Backend
curl http://10.0.2.4:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "uptime": 12345.67
}
```

---

## 🔄 Reiniciar Servicios

### Si necesitas reiniciar algo:

```bash
# Reiniciar Nginx (en VM Frontend)
sudo systemctl restart nginx
```

```bash
# Reiniciar Backend (desde VM Frontend)
ssh azureuser@10.0.2.4 'pm2 restart jovafilms-backend'
```

```bash
# Reiniciar Batch Service (desde VM Frontend)
ssh azureuser@10.0.3.4 'pm2 restart jovafilms-batch'
```

---

## 🎯 Flujo Completo de Prueba

### 1. Registro de Usuario

```
http://<IP_PUBLICA>/register

Nombre: Test User
Email: test@example.com
Password: test123
```

### 2. Login

```
http://<IP_PUBLICA>/login

Email: test@example.com
Password: test123
```

### 3. Ver Películas

```
http://<IP_PUBLICA>/movies

Deberías ver la lista de películas
```

### 4. Ver Detalle de Película

```
Click en cualquier película
Deberías ver:
- Título
- Descripción
- Género
- Año
- Reseñas
```

### 5. Crear Reseña

```
En el detalle de una película:

Rating: 5 estrellas
Comentario: ESTA ES UNA PRUEBA CON MAYÚSCULAS

[Enviar Reseña]
```

### 6. Verificar Batch Service (Espera 5 minutos)

```bash
# Ver logs del batch service
ssh azureuser@10.0.3.4 'pm2 logs jovafilms-batch --lines 100'
```

**Deberías ver:**
```
[Batch Service] Procesando reseñas no validadas...
[Batch Service] Reseña encontrada: ID 123
[Batch Service] Convirtiendo a minúsculas...
[Batch Service] Subiendo a Blob Storage...
[Batch Service] Reseña validada exitosamente
```

---

## 📈 Checklist Final

Después de aplicar la solución, verifica:

- [ ] ✅ Backend responde en `http://10.0.2.4:3000/health`
- [ ] ✅ Página de login carga en `http://<IP_PUBLICA>`
- [ ] ✅ Login funciona correctamente
- [ ] ✅ Puedes ver las películas
- [ ] ✅ Puedes ver el detalle de una película
- [ ] ✅ Puedes crear una reseña
- [ ] ✅ La reseña aparece como "no validada"
- [ ] ✅ Después de 5 minutos, la reseña se marca como "validada"
- [ ] ✅ El texto en MAYÚSCULAS se convierte a minúsculas
- [ ] ✅ El archivo se sube a Blob Storage

---

## 🎉 ¡Éxito!

Si todos los checks están marcados, **¡tu aplicación está funcionando correctamente!**

**Próximos pasos:**
1. ✅ Crear más datos de prueba
2. ✅ Preparar la demo
3. ✅ Documentar todo en el README
4. ✅ Tomar screenshots para la presentación

---

**Última actualización:** Noviembre 2024

**Estado:** 🚀 Listo para usar
