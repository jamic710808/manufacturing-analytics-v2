@echo off
chcp 65001 >nul
title 製造產業分析儀表板 Vizro V3

echo ========================================
echo   製造產業分析儀表板 Vizro V3
echo ========================================
echo.

cd /d "%~dp0"

echo [選項]
echo [1] 開啟 HTML 版本 (推薦 - 無需安裝依賴)
echo [2] 開啟 Python Vizro 版本 (需要安裝 vizro)
echo [3] 同時開啟兩個版本
echo.
set /p choice=請選擇選項 (1/2/3):

if "%choice%"=="1" (
    echo.
    echo 正在開啟 HTML 版本...
    start "" "index.html"
    echo 已開啟！請在瀏覽器中查看
    echo 如遇載入資料失敗，請使用選項 3 或使用 HTTP 伺服器
    pause
    exit /b
)

if "%choice%"=="2" (
    echo.
    echo 正在啟動 Python Vizro 版本...
    python dashboard.py
    pause
    exit /b
)

if "%choice%"=="3" (
    echo.
    echo 正在啟動 HTTP 伺服器並開啟 HTML...
    echo 伺服器將在 http://127.0.0.1:8080 運行
    echo 按 Ctrl+C 停止伺服器
    echo.
    start "" "index.html"
    python -m http.server 8080
    pause
    exit /b
)

echo 無效的選項
pause
