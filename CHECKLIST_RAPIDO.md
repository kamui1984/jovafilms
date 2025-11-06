# ✅ Checklist Rápido - Solución Conexión Frontend-Backend

## 🎯 Objetivo
Hacer que el frontend se conecte correctamente con el backend en Azure.

## 📋 Pasos a Seguir (15 minutos)

### 1. Verificar que el Backend esté funcionando
```bash
# Conéctate a la VM de Frontend
ssh azureuser@<IP_PUBLICA_FRONTEND>

# Prueba conectividad con el backend
ping 10.0.2.4

# Verifica que el backend responda
curl http://10.0.2.4:3000/health
```

**✅ Resultado esperado:** Debe devolver JSON con `"status": "OK"`

**❌ Si falla:** Conéctate al backend y verifica PM2:
```bash
ssh azureuser@10.0.2.4
pm2 status
pm2 logs jovafilms-backend
```

---

### 2. Ejecutar el Script de Solución Automática

```bash
# En la VM de Frontend
cd /home/azureuser/jovafilms

# Descargar últimos cambios
git pull origin main

# Dar permisos de ejecución al script
chmod +x azure-deployment/scripts/fix-frontend-connection.sh

# Ejecutar el script
./azure-deployment/scripts/fix-frontend-connection.sh
```

**✅ El script hará:**
- ✓ Crear archivo `.env` con la URL correcta del backend
- ✓ Reconstruir el frontend
- ✓ Configurar Nginx correctamente
- ✓ Reiniciar Nginx

---

### 3. Verificar en el Navegador

1. Abre tu navegador
2. Ve a: `http://<IP_PUBLICA_FRONTEND>`
3. Deberías ver la página de login
4. Abre la consola del navegador (F12)
5. Intenta hacer login con:
   - Email: `admin@jovafilms.com`
   - Password: `admin123`

**✅ Resultado esperado:** Login exitoso y redirección al dashboard

**❌ Si ves "Network Error":**
- Revisa logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
- Verifica que el backend esté corriendo

**❌ Si ves "CORS Error":**
- Conéctate al backend
- Edita `.env` y agrega: `CORS_ORIGIN=http://<IP_PUBLICA_FRONTEND>`
- Reinicia: `pm2 restart jovafilms-backend`

---

## 🔍 Verificación Rápida de Problemas Comunes

### Problema 1: Backend no responde
```bash
# En VM Backend
pm2 status
pm2 restart jovafilms-backend
pm2 logs jovafilms-backend
```

### Problema 2: Nginx no funciona
```bash
# En VM Frontend
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Problema 3: NSG bloqueando tráfico
```bash
# Desde tu máquina local
az network nsg rule list \
  --resource-group jovafilms-rg \
  --nsg-name jovafilms-backend-vm-nsg \
  --output table
```

---

## 📊 Estado Actual del Proyecto

Basándome en las imágenes que compartiste, tienes:

✅ **Recursos creados:**
- 4 VMs (frontend, backend, batch, database)
- 1 Storage Account
- Redes virtuales y NSGs

❌ **Problema actual:**
- Frontend carga pero no conecta con backend
- Falta configuración de `.env` en frontend
- Falta configuración correcta de Nginx

🔧 **Solución:**
- Ejecutar el script `fix-frontend-connection.sh`
- Esto configurará todo automáticamente

---

## 🚀 Después de Solucionar

Una vez que funcione el login:

1. **Registra un usuario nuevo**
2. **Navega por las películas**
3. **Crea una reseña con MAYÚSCULAS**
4. **Espera 5 minutos**
5. **Verifica que el batch service procesó la reseña**

---

## 📞 Si Necesitas Ayuda

### Comandos de diagnóstico:

```bash
# Ver todos los logs en tiempo real
# En VM Frontend:
sudo tail -f /var/log/nginx/error.log

# En VM Backend:
ssh azureuser@10.0.2.4 'pm2 logs jovafilms-backend'

# En VM Batch:
ssh azureuser@10.0.3.4 'pm2 logs jovafilms-batch'
```

### Reiniciar todo:

```bash
# Frontend (Nginx)
sudo systemctl restart nginx

# Backend
ssh azureuser@10.0.2.4 'pm2 restart jovafilms-backend'

# Batch
ssh azureuser@10.0.3.4 'pm2 restart jovafilms-batch'
```

---

## 🎯 Próximos Pasos (Después de Solucionar)

1. ✅ Verificar que todas las funcionalidades trabajen
2. ✅ Crear datos de prueba para la demo
3. ✅ Documentar la IP pública en el README
4. ✅ Preparar la presentación
5. ✅ Configurar HTTPS (opcional)

---

**Tiempo estimado:** 15-30 minutos

**Dificultad:** Baja (script automático)

**Estado:** 🔧 Listo para ejecutar
