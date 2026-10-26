@echo off
title Tes Langsung Komentar TikTok Live
cd /d "%~dp0"
echo ===================================================
echo TES KONEKSI & SCRAPER TIKTOK LIVE
echo ===================================================
echo.
set /p user="Masukkan username TikTok yang SEDANG LIVE (atau Enter untuk akun tes joabgold): "
if "%user%"=="" set user=joabgold
node test-tiktok.js %user%
pause
