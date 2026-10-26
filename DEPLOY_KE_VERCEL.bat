@echo off
title Deploy Tebak Kata ke Vercel
cd /d "%~dp0"
echo ===================================================
echo Memulai Proses Deploy ke Vercel...
echo ===================================================
echo.
echo Petunjuk:
echo 1. Jika diminta login, pilih metode login (misal GitHub / Email).
echo 2. Untuk pertanyaan "Set up and deploy?", tekan Enter (Y).
echo 3. Untuk pertanyaan lainnya, tekan Enter terus untuk pilihan default.
echo.
npx vercel --prod
pause
