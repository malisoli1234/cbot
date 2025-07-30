@echo off
echo ========================================
echo    Currency Bot Setup Script
echo ========================================
echo.

echo Installing Node.js dependencies...
npm install

echo.
echo Installing React frontend dependencies...
cd admin-frontend
npm install
cd ..

echo.
echo Building React frontend...
cd admin-frontend
npm run build
cd ..

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To start the server, run: start.bat
echo Or use: npm start
echo.
pause 