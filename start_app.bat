@echo off
echo Starting MassMutual Policy Renewal System...

cd backend
start "MassMutual Backend" cmd /k "npm run dev"
cd ..

start "MassMutual Frontend" cmd /k "npm run dev"

echo Application started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
