# Копирует public и static в standalone-сборку (нужно для VPS после npm run build)
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Test-Path ".next\standalone\server.js")) {
    Write-Error "Сначала выполните: npm run build или npm run build:timeweb"
    exit 1
}

Copy-Item -Recurse -Force "public" ".next\standalone\public"
New-Item -ItemType Directory -Force -Path ".next\standalone\.next" | Out-Null
Copy-Item -Recurse -Force ".next\static" ".next\standalone\.next\static"

Write-Host "OK: standalone готов в .next\standalone\"
