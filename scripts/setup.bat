@echo off
echo.
echo ========================================
echo   🎬 JovaFilms - Instalación Inicial
echo ========================================
echo.

echo [1/5] Instalando dependencias del Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend
    pause
    exit /b 1
)
cd ..
echo ✅ Backend configurado
echo.

echo [2/5] Instalando dependencias del Batch Service...
cd batch-service
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del batch service
    pause
    exit /b 1
)
cd ..
echo ✅ Batch Service configurado
echo.

echo [3/5] Instalando dependencias del Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del frontend
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend configurado
echo.

echo [4/5] Configurando Base de Datos...
cd backend
echo    - Copiando archivo .env...
if not exist .env (
    copy .env.example .env
    echo    ⚠️  Edita backend\.env con tus credenciales de PostgreSQL
)
echo    - Generando Prisma Client...
call npx prisma generate
echo    - Ejecutando migraciones...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Error al configurar la base de datos
    echo    Asegúrate de que PostgreSQL esté corriendo y las credenciales sean correctas
    pause
    exit /b 1
)
echo    - Ejecutando seed...
call npx prisma db seed
cd ..
echo ✅ Base de datos configurada
echo.

echo [5/5] Configurando Batch Service...
cd batch-service
if not exist .env (
    copy .env.example .env
)
call npx prisma generate
cd ..
echo ✅ Batch Service configurado
echo.

echo ========================================
echo   ✨ Instalación Completada
echo ========================================
echo.
echo Próximos pasos:
echo 1. Edita backend\.env con tus credenciales de PostgreSQL
echo 2. Ejecuta: scripts\start.bat
echo.
pause
