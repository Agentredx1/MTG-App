param(
  [switch]$WithPsql
)

$PgCwd = "server"
$PgCmd = "docker compose up -d"

$ApiCwd = "server"
$ApiCmd = "node --watch-path=./ server.mjs"

$WebCwd = "client"
$WebCmd = "npm run dev"

Write-Host "Starting Docker compose..." -ForegroundColor Cyan
Start-Process powershell -WorkingDirectory $PgCwd -ArgumentList "-NoExit", "-Command", $PgCmd

Write-Host "Starting Express API..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $ApiCwd -ArgumentList "-NoExit", "-Command", $ApiCmd

Write-Host "Starting Vite..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $WebCwd -ArgumentList "-NoExit", "-Command", $WebCmd

if ($WithPsql) {
  Write-Host "Opening psql shell..." -ForegroundColor Green
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker exec -it pg-local psql -U dev -d appdb"
}

Write-Host "All set."
