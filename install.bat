@echo off
echo Instalando nodemon...
npm install -g nodemon
echo Instalando dependencias en el servidor...
npm install
echo Listo!
echo Limpiando cache...
npm cache clean
echo El ambiente esta listo!
pause
echo Fin