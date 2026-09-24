# Hurghada University — local same-port publish
# Builds public site + dashboard into API wwwroot and runs everything on http://localhost:5142
#
#   /           public website
#   /app        dashboard SPA
#   /api        backend API
#   /uploads    media files
#   /health     health check

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$api = Join-Path $root "Backend\src\HurghadaUniversity.API"
$www = Join-Path $api "wwwroot"
$siteDist = Join-Path $root "aurelia-university\dist\aurelia-university\browser"
$dashDist = Join-Path $root "Frontend\dist\hurghada-university\browser"

Write-Host "==> Building public site (aurelia)..." -ForegroundColor Cyan
Push-Location (Join-Path $root "aurelia-university")
npx ng build --configuration=production
Pop-Location

Write-Host "==> Building dashboard (Frontend)..." -ForegroundColor Cyan
Push-Location (Join-Path $root "Frontend")
npx ng build --configuration=production
Pop-Location

if (-not (Test-Path $siteDist)) { throw "Site build missing: $siteDist" }
if (-not (Test-Path $dashDist)) { throw "Dashboard build missing: $dashDist" }

Write-Host "==> Copying into API wwwroot..." -ForegroundColor Cyan
if (Test-Path $www) { Remove-Item $www -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Join-Path $www "app") | Out-Null
Copy-Item -Path (Join-Path $siteDist "*") -Destination $www -Recurse -Force
Copy-Item -Path (Join-Path $dashDist "*") -Destination (Join-Path $www "app") -Recurse -Force

Write-Host "==> Starting API on http://localhost:5142" -ForegroundColor Green
Write-Host "    Site:      http://localhost:5142/"
Write-Host "    Dashboard: http://localhost:5142/app/login?door=staff"
Write-Host "    Health:    http://localhost:5142/health"
Push-Location $api
dotnet run --launch-profile http
Pop-Location
