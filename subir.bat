@echo off
cd /d "%~dp0"
git add .
git commit -m "atualizacao"
git push
pause
