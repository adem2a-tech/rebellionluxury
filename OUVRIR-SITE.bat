@echo off
cd /d "%~dp0"
echo Rebellion Luxury - demarrage du site...
echo.
echo Si le navigateur ne s'ouvre pas, allez sur : http://localhost:5173
echo Pour arreter : fermez cette fenetre ou appuyez sur Ctrl+C
echo.
:: Ouvrir le navigateur apres 3 secondes (au cas ou Vite ne le fait pas)
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"
npm run dev
pause
