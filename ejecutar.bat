@echo off
chcp 65001 >nul
echo === EVERBLOOM - Modulo web (GA7-AA2-EV02) ===
if not exist .env (
  copy .env.ejemplo .env >nul
  echo Se creo el archivo .env. Escribe tu clave de MySQL en BD_CLAVE, guarda y cierra el Bloc de notas.
  notepad .env
)
echo.
echo [1/3] Instalando librerias...
call npm install
echo.
echo [2/3] Ejecutando las pruebas (toma captura de este resultado)...
call npm run probar-web
echo.
echo [3/3] Encendiendo la pagina en http://localhost:3000/productos  (Ctrl + C para detener)
start http://localhost:3000/productos
call npm run web
