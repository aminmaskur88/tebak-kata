@echo off
title Deploy Tebak Kata ke Vercel
cd /d "%~dp0"
echo ===================================================
echo Memulai Proses Deploy ke Vercel...
echo ===================================================
echo.
echo Langkah 1: Login ke Vercel (Pilih GitHub atau Email di layar)...
call npx.cmd vercel login
echo.
echo Langkah 2: Proses Deploy ke Vercel...
echo (Tekan Enter terus untuk menyetujui opsi default)
echo.
call npx.cmd vercel --prod
echo.
echo ===================================================
echo Selesai! Link Vercel Anda tercantum di atas.
echo ===================================================
pause
