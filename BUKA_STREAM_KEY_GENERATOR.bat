@echo off
title TikTok Stream Key Generator
cd /d "%~dp0"

echo ===================================================
echo       TIKTOK STREAM KEY GENERATOR (OBS)
echo ===================================================
echo.

if not exist "stream-key-generator\StreamLabsTikTokStreamKeyGenerator.exe" (
    echo [INFO] Tool belum terunduh, mengunduh otomatis dari GitHub Loukious...
    powershell -Command "New-Item -ItemType Directory -Force -Path 'stream-key-generator' | Out-Null; $url = 'https://github.com/Loukious/StreamLabsTikTokStreamKeyGenerator/releases/download/v2.0.9/StreamLabsTikTokStreamKeyGeneratorRelease-win-2.0.9.zip'; $zip = 'stream-key-generator\generator.zip'; Invoke-WebRequest -Uri $url -OutFile $zip; Expand-Archive -Path $zip -DestinationPath 'stream-key-generator' -Force; Remove-Item $zip"
    echo [OK] Unduhan selesai!
    echo.
)

echo Membuka TikTok Stream Key Generator...
start "" "%~dp0stream-key-generator\StreamLabsTikTokStreamKeyGenerator.exe"

echo.
echo ===================================================
echo Generator sudah terbuka di jendela terpisah!
echo.
echo Langkah berikutnya:
echo 1. Pastikan Streamlabs Desktop sudah login TikTok.
echo 2. Di Generator, klik "Load from PC".
echo 3. Isi judul live lalu klik "Generate Stream Key".
echo 4. Salin Server URL dan Stream Key ke OBS Studio.
echo ===================================================
timeout /t 5 >nul
exit
