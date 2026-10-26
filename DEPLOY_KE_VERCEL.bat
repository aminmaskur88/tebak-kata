@echo off
title Deploy Tebak Kata ke Vercel
cd /d "%~dp0"
echo ===================================================
echo Memulai Proses Deploy ke Vercel...
echo ===================================================
echo.
echo Petunjuk Singkat:
echo 1. Jika muncul pilihan login, pilih akun (GitHub / Email).
echo 2. Untuk pertanyaan "Set up and deploy?", tekan Enter (Y).
echo 3. Untuk pertanyaan selanjutnya, tekan Enter terus (Default).
echo.
call npx.cmd vercel --prod
echo.
echo ===================================================
echo Proses selesai! Link Vercel Anda ada di atas.
echo ===================================================
pause
