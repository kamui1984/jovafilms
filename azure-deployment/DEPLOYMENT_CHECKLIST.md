# ✅ Checklist de Despliegue Azure - JovaFilms

## Pre-Despliegue

### Requisitos Locales
- [ ] Node.js 20 LTS instalado
- [ ] Azure CLI instalado y configurado
- [ ] Git configurado
- [ ] Cuenta de Azure activa con créditos
- [ ] SSH keys generadas

### Preparación del Código
- [ ] Código actualizado en repositorio local
- [ ] Dependencias instaladas (`npm install` en todos los proyectos)
- [ ] Build exitoso (`npm run build` en backend y batch)
- [ ] Tests pasando (opcional)
- [ ] Variables de entorno configuradas localmente

---

## Fase 1: Infraestructura Azure (1-2 horas)

### Login y Configuración
- [ ] `az login` ejecutado exitosamente
- [ ] Suscripción correcta seleccionada
- [ ] Región elegida (recomendado: eastus)

### Creación de Recursos
- [ ] Resource Group creado (`jovafilms-rg`)
- [ ] Virtual Network creada (`jovafilms-vnet`)
- [ ] 4 Subnets creadas (frontend, backend, batch, database)
- [ ] Storage Account creado (`jovafilmsstorage`)
- [ ] Blob Container creado (`reviews-files`)
- [ ] Connection String guardado de forma segura

### Virtual Machines
- [ ] VM Frontend creada (Standard_B2s)
- [ ] VM Backend creada (Standard_B2s)
- [ ] VM Batch creada (Standard_B1s)
- [ ] VM Database creada (Standard_B2ms)
- [ ] IP Pública del Frontend anotada: `___________________`
- [ ] SSH keys configuradas para todas las VMs

### Network Security Groups
- [ ] NSG Frontend configurado (HTTP, HTTPS, SSH)
- [ ] NSG Backend configurado (Port 3000 desde Frontend/Batch)
- [ ] NSG Batch configurado (solo outbound)
- [ ] NSG Database configurado (Port 5432 desde Backend/Batch)

---

## Fase 2: Configuración Database VM (45 min)

### Conexión
- [ ] SSH a Frontend VM exitoso
- [ ] SSH desde Frontend a Database VM (10.0.4.4) exitoso

### Instalación PostgreSQL
- [ ] `apt update` ejecutado
- [ ] PostgreSQL 15 instalado
- [ ] Servicio PostgreSQL iniciado

### Configuración
- [ ] Base de datos `jovafilms_db` creada
- [ ] Usuario `jovafilms` creado
- [ ] Permisos otorgados
- [ ] `postgresql.conf` editado (`listen_addresses = '*'`)
- [ ] `pg_hba.conf` editado (permitir 10.0.0.0/16)
- [ ] PostgreSQL reiniciado
- [ ] Conexión desde Backend VM probada

### Migración
- [ ] Schema de Prisma aplicado
- [ ] Migración `ADD_BLOB_STORAGE_MIGRATION.sql` ejecutada
- [ ] Seed data cargado (15 películas)
- [ ] Verificación de tablas exitosa

---

## Fase 3: Configuración Backend VM (1 hora)

### Conexión
- [ ] SSH desde Frontend a Backend VM (10.0.2.4) exitoso

### Instalación Software
- [ ] Node.js 20 instalado
- [ ] PM2 instalado globalmente
- [ ] Git instalado

### Despliegue Aplicación
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado con:
  - [ ] DATABASE_URL configurado (10.0.4.4)
  - [ ] JWT_SECRET configurado (producción)
  - [ ] PORT=3000
  - [ ] NODE_ENV=production
  - [ ] CORS_ORIGIN configurado
- [ ] Prisma client generado (`npx prisma generate`)
- [ ] Build exitoso (`npm run build`)
- [ ] PM2 iniciado (`pm2 start dist/server.js --name jovafilms-backend`)
- [ ] PM2 guardado (`pm2 save`)
- [ ] PM2 startup configurado
- [ ] Health check exitoso (`curl http://localhost:3000/health`)

---

## Fase 4: Configuración Batch VM (45 min)

### Conexión
- [ ] SSH desde Frontend a Batch VM (10.0.3.4) exitoso

### Instalación Software
- [ ] Node.js 20 instalado
- [ ] PM2 instalado globalmente
- [ ] Git instalado

### Despliegue Aplicación
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado con:
  - [ ] DATABASE_URL configurado (10.0.4.4)
  - [ ] AZURE_STORAGE_CONNECTION_STRING configurado
  - [ ] AZURE_STORAGE_CONTAINER_NAME=reviews-files
- [ ] Prisma client generado (`npx prisma generate`)
- [ ] Build exitoso (`npm run build`)
- [ ] PM2 iniciado (`pm2 start dist/index.js --name jovafilms-batch`)
- [ ] PM2 guardado (`pm2 save`)
- [ ] PM2 startup configurado
- [ ] Logs verificados (`pm2 logs jovafilms-batch`)
- [ ] Conexión a Blob Storage exitosa

---

## Fase 5: Configuración Frontend VM (1 hora)

### Conexión
- [ ] SSH a Frontend VM (IP pública) exitoso

### Instalación Software
- [ ] Node.js 20 instalado
- [ ] Nginx instalado
- [ ] Git instalado

### Despliegue Aplicación
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado con:
  - [ ] VITE_API_URL=http://10.0.2.4:3000
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Archivos en `dist/` verificados

### Configuración Nginx
- [ ] Archivo `/etc/nginx/sites-available/jovafilms` creado
- [ ] Configuración incluye:
  - [ ] Root path correcto
  - [ ] Proxy pass a Backend (10.0.2.4:3000)
  - [ ] Try files para SPA
- [ ] Symlink creado en `sites-enabled`
- [ ] Default site deshabilitado
- [ ] Configuración probada (`nginx -t`)
- [ ] Nginx reiniciado
- [ ] Puerto 80 abierto en NSG
- [ ] Acceso desde navegador exitoso

---

## Fase 6: Testing Completo (30 min)

### Conectividad
- [ ] Frontend accesible desde internet
- [ ] Frontend puede comunicarse con Backend
- [ ] Backend puede comunicarse con Database
- [ ] Batch puede comunicarse con Database
- [ ] Batch puede subir a Blob Storage

### Funcionalidad
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Ver películas funciona
- [ ] Ver detalle de película funciona
- [ ] Crear reseña funciona
- [ ] Reseña aparece como "no validada"
- [ ] Búsqueda de películas funciona
- [ ] Agregar película funciona

### Batch Service
- [ ] Crear reseña con MAYÚSCULAS
- [ ] Esperar 5 minutos
- [ ] Verificar en logs que batch procesó
- [ ] Verificar archivo en Blob Storage
- [ ] Verificar reseña marcada como "validada"
- [ ] Verificar MAYÚSCULAS convertidas a minúsculas
- [ ] Verificar `blob_storage_path` en base de datos

---

## Fase 7: Seguridad y Optimización (30 min)

### Seguridad
- [ ] Cambiar passwords por defecto
- [ ] Verificar NSG rules
- [ ] Verificar acceso privado a VMs internas
- [ ] Verificar Blob Storage privado
- [ ] Configurar firewall en VMs (opcional)

### Optimización
- [ ] Configurar logs rotation
- [ ] Configurar backups de base de datos
- [ ] Configurar alertas de Azure Monitor (opcional)
- [ ] Documentar IP pública en README

### HTTPS (Opcional)
- [ ] Dominio configurado (si aplica)
- [ ] Certbot instalado
- [ ] Certificado SSL obtenido
- [ ] Nginx configurado para HTTPS
- [ ] Redirección HTTP → HTTPS

---

## Fase 8: Documentación Final (15 min)

### Actualizar Documentación
- [ ] IP pública agregada a README.md
- [ ] URL pública probada y documentada
- [ ] Connection strings guardados de forma segura
- [ ] Credenciales documentadas (en lugar seguro)
- [ ] Diagrama de arquitectura actualizado (si cambió algo)

### Repositorio
- [ ] Todos los cambios commiteados
- [ ] README actualizado con URL pública
- [ ] Push a GitHub
- [ ] Verificar que `.env` NO está en el repo

---

## Fase 9: Preparación para Demo (30 min)

### Datos de Prueba
- [ ] Al menos 5 usuarios registrados
- [ ] Al menos 10 reseñas creadas
- [ ] Algunas reseñas validadas
- [ ] Archivos en Blob Storage verificados

### Casos de Uso para Demo
- [ ] Flujo de registro/login preparado
- [ ] Flujo de crear reseña preparado
- [ ] Flujo de validación batch preparado
- [ ] Screenshots tomados (opcional)
- [ ] Video demo grabado (opcional)

### Presentación
- [ ] Slides preparados
- [ ] Diagramas de arquitectura incluidos
- [ ] Tabla de costos incluida
- [ ] Demo en vivo probada

---

## Post-Despliegue

### Monitoreo
- [ ] Configurar alertas de costos
- [ ] Revisar logs diariamente
- [ ] Monitorear uso de recursos

### Mantenimiento
- [ ] Plan de backups definido
- [ ] Plan de actualizaciones definido
- [ ] Documentación de troubleshooting

---

## Troubleshooting

### Si algo falla:

1. **Verificar logs**
   ```bash
   pm2 logs jovafilms-backend
   pm2 logs jovafilms-batch
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verificar conectividad**
   ```bash
   ping 10.0.2.4
   curl http://10.0.2.4:3000/health
   ```

3. **Verificar NSG**
   ```bash
   az network nsg rule list --resource-group jovafilms-rg --nsg-name backend-nsg --output table
   ```

4. **Reiniciar servicios**
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   sudo systemctl restart postgresql
   ```

---

## Costos a Monitorear

- [ ] Verificar costos diarios en Azure Portal
- [ ] Configurar presupuesto mensual
- [ ] Apagar VMs cuando no se usen (para ahorrar)

**Costo estimado mensual**: ~$157 USD

---

## Notas Importantes

⚠️ **NUNCA commitear archivos `.env` al repositorio**

⚠️ **Guardar Connection Strings en lugar seguro**

⚠️ **Documentar todas las IPs y credenciales**

⚠️ **Hacer backup de base de datos regularmente**

⚠️ **Monitorear costos para evitar sorpresas**

---

## Contacto de Emergencia

- **Azure Support**: https://portal.azure.com (Support + troubleshooting)
- **Documentación**: Ver carpeta `docs/`
- **Quick Reference**: `azure-deployment/AZURE_QUICK_REFERENCE.md`

---

**Tiempo total estimado**: 6-8 horas

**Última actualización**: Noviembre 2024

**Estado**: ✅ Listo para iniciar despliegue
