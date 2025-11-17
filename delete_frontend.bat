@echo off
timeout /t 30 /nobreak >nul
rd /s /q "d:\site119\frontend"
del "%~f0"