@echo off
echo.
echo ========================================
echo   🎬 JovaFilms - Iniciando Sistema
echo ========================================
echo.

REM Verificar si PostgreSQL está corriendo
echo [1/4] Verificando PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no está corriendo
    echo    Por favor inicia PostgreSQL antes de continuar
    pause
    exit /b 1
)
echo ✅ PostgreSQL está corriendo
echo.

REM Iniciar Backend
echo [2/4] Iniciando Backend API...
cd backend
start "JovaFilms Backend" cmd /k "npm run dev"
cd ..
timeout /t 3 /nobreak >nul
echo ✅ Backend iniciado en http://localhost:3000
echo.

REM Iniciar Batch Service
echo [3/4] Iniciando Batch Service...
cd batch-service
start "JovaFilms Batch" cmd /k "npm start"
cd ..
timeout /t 2 /nobreak >nul
echo ✅ Batch Service iniciado
echo.

REM Iniciar Frontend
echo [4/4] Iniciando Frontend...
cd frontend
start "JovaFilms Frontend" cmd /k "npm run dev"
cd ..
timeout /t 3 /nobreak >nul
echo ✅ Frontend iniciado en http://localhost:5173
echo.

echo ========================================
echo   ✨ Sistema JovaFilms Iniciado
echo ========================================
echo.
echo 📱 Frontend:  http://localhost:5173
echo 🔌 Backend:   http://localhost:3000
echo ⏰ Batch:     Ejecutándose cada 5 minutos
echo.
echo Presiona cualquier tecla para salir...
pause >nul
