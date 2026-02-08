@echo off
echo Starting MassMutual Renewal System...
echo ====================================
echo.
echo Installing root dependencies (if needed)...
call npm install
echo.
echo Starting Backend and Frontend concurrently...
npm start
pause
