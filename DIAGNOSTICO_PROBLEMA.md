# 🔍 Diagnóstico del Problema - JovaFilms Azure

## 📊 Estado Actual

### ✅ Lo que SÍ funciona:
- Las 4 VMs están creadas y corriendo
- El Storage Account está configurado
- El frontend carga la página de login
- Nginx está sirviendo archivos estáticos
- La base de datos está configurada

### ❌ Lo que NO funciona:
- El frontend NO puede comunicarse con el backend
- Las peticiones API fallan
- El login no funciona

---

## 🎯 Causa Raíz del Problema

### Problema #1: Archivo .env faltante en Frontend

**Estado actual:**
```
frontend/
  ├── .env.example  ✅ (existe)
  └── .env          ❌ (NO existe)
```

**Consecuencia:**
El frontend usa la URL por defecto: `http://localhost:3000/api`

**Solución:**
Crear archivo `.env` con:
```
VITE_API_URL=http://10.0.2.4:3000/api
```

---

### Problema #2: Configuración incorrecta de Nginx

**Estado actual:**
Nginx probablemente está usando configuración por defecto que NO hace proxy al backend.

**Consecuencia:**
Las peticiones a `/api/*` no se reenvían al backend en `10.0.2.4:3000`

**Solución:**
Configurar Nginx para hacer proxy:
```nginx
location /api {
    proxy_pass http://10.0.2.4:3000;
    # ... headers y configuración
}
```

---

## 🔄 Flujo de Comunicación

### ❌ Flujo ACTUAL (No funciona):

```
Usuario
  ↓
[Navegador] → http://<IP_PUBLICA>/api/auth/login
  ↓
[Nginx en Frontend VM]
  ↓
❌ ERROR: No sabe dónde enviar /api/*
  ↓
[Frontend intenta localhost:3000]
  ↓
❌ FALLA: No hay backend en localhost
```

### ✅ Flujo CORRECTO (Después de la solución):

```
Usuario
  ↓
[Navegador] → http://<IP_PUBLICA>/api/auth/login
  ↓
[Nginx en Frontend VM] (puerto 80)
  ↓
[Proxy Pass] → http://10.0.2.4:3000/api/auth/login
  ↓
[Backend VM] (puerto 3000)
  ↓
[Express API]
  ↓
[Database VM] (puerto 5432)
  ↓
✅ RESPUESTA → Usuario
```

---

## 🏗️ Arquitectura de Red

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└────────────────────────┬────────────────────────────────┘
                         │
                    [IP Pública]
                         │
┌────────────────────────┴────────────────────────────────┐
│                  Frontend VM                             │
│                  10.0.1.4                                │
│  ┌──────────┐         ┌──────────┐                      │
│  │  Nginx   │────────▶│ Frontend │                      │
│  │ (puerto  │         │  (dist)  │                      │
│  │   80)    │         └──────────┘                      │
│  └────┬─────┘                                            │
└───────┼──────────────────────────────────────────────────┘
        │ Proxy Pass
        │ /api → http://10.0.2.4:3000
        ▼
┌────────────────────────────────────────────────────────┐
│                  Backend VM                             │
│                  10.0.2.4                               │
│  ┌──────────┐         ┌──────────┐                     │
│  │   PM2    │────────▶│ Express  │                     │
│  │          │         │   API    │                     │
│  └──────────┘         └────┬─────┘                     │
└────────────────────────────┼───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                  Database VM                            │
│                  10.0.4.4                               │
│  ┌──────────┐                                           │
│  │PostgreSQL│                                           │
│  │ (puerto  │                                           │
│  │  5432)   │                                           │
│  └──────────┘                                           │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 Solución Paso a Paso

### Opción A: Script Automático (Recomendado)

```bash
# 1. Conéctate a la VM de Frontend
ssh azureuser@<IP_PUBLICA_FRONTEND>

# 2. Navega al proyecto
cd /home/azureuser/jovafilms

# 3. Descarga últimos cambios
git pull origin main

# 4. Ejecuta el script
chmod +x azure-deployment/scripts/fix-frontend-connection.sh
./azure-deployment/scripts/fix-frontend-connection.sh
```

**Tiempo:** 5 minutos
**Dificultad:** Baja

---

### Opción B: Manual

Si el script automático falla o prefieres hacerlo manualmente:

#### Paso 1: Crear .env
```bash
cd /home/azureuser/jovafilms/frontend
echo "VITE_API_URL=http://10.0.2.4:3000/api" > .env
```

#### Paso 2: Rebuild Frontend
```bash
npm run build
```

#### Paso 3: Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/jovafilms
# (Pegar configuración del archivo SOLUCION_PROBLEMA_CONEXION.md)
```

#### Paso 4: Habilitar y Reiniciar
```bash
sudo ln -sf /etc/nginx/sites-available/jovafilms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**Tiempo:** 15 minutos
**Dificultad:** Media

---

## 🧪 Pruebas de Verificación

### Test 1: Conectividad Backend
```bash
# Desde VM Frontend
curl http://10.0.2.4:3000/health
```
**Esperado:** `{"status":"OK",...}`

### Test 2: Nginx Proxy
```bash
# Desde VM Frontend
curl http://localhost/api/health
```
**Esperado:** `{"status":"OK",...}`

### Test 3: Desde Internet
```bash
# Desde tu máquina local
curl http://<IP_PUBLICA_FRONTEND>/api/health
```
**Esperado:** `{"status":"OK",...}`

### Test 4: Login desde Navegador
1. Abre `http://<IP_PUBLICA_FRONTEND>`
2. Abre DevTools (F12) → Network
3. Intenta login
4. Verifica petición a `/api/auth/login`
5. Debe devolver status 200 o 201

---

## 📈 Checklist de Verificación

Después de aplicar la solución, verifica:

- [ ] Backend responde en `http://10.0.2.4:3000/health`
- [ ] Archivo `.env` existe en frontend
- [ ] Frontend reconstruido con `npm run build`
- [ ] Nginx configurado correctamente
- [ ] Nginx reiniciado sin errores
- [ ] Página de login carga
- [ ] Login funciona correctamente
- [ ] Puedes ver las películas
- [ ] Puedes crear una reseña

---

## 🚨 Problemas Comunes y Soluciones

### Error: "Network Error"
**Causa:** Nginx no puede alcanzar el backend
**Solución:**
```bash
# Verifica que el backend esté corriendo
ssh azureuser@10.0.2.4 'pm2 status'

# Verifica NSG
az network nsg rule list --resource-group jovafilms-rg --nsg-name jovafilms-backend-vm-nsg
```

### Error: "CORS policy"
**Causa:** Backend no permite peticiones desde el frontend
**Solución:**
```bash
# En VM Backend
cd /home/azureuser/jovafilms/backend
echo "CORS_ORIGIN=http://<IP_PUBLICA_FRONTEND>" >> .env
pm2 restart jovafilms-backend
```

### Error: "502 Bad Gateway"
**Causa:** Nginx configurado pero backend no responde
**Solución:**
```bash
# Verifica logs del backend
ssh azureuser@10.0.2.4 'pm2 logs jovafilms-backend --lines 50'
```

---

## 📝 Resumen

**Problema:** Frontend no conecta con backend
**Causa:** Falta configuración de .env y Nginx
**Solución:** Ejecutar script `fix-frontend-connection.sh`
**Tiempo:** 5-15 minutos
**Resultado:** Aplicación completamente funcional

---

## 🎯 Próximos Pasos

Una vez solucionado:

1. ✅ Probar todas las funcionalidades
2. ✅ Crear datos de prueba
3. ✅ Verificar batch service
4. ✅ Documentar IP pública
5. ✅ Preparar demo

---

**Última actualización:** Noviembre 2024
**Estado:** 🔧 Diagnóstico completo - Solución lista
