$env:NODE_OPTIONS = "--max-old-space-size=2048"

$ip = (Get-NetIPAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress
if (-not $ip) { $ip = "0.0.0.0" }

# Update .env with current WiFi IP for API calls
(Get-Content .env) -replace 'NEXT_PUBLIC_API_BASE=http://[^:]+:5001', "NEXT_PUBLIC_API_BASE=http://${ip}:5001" | Set-Content .env

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Network Mode" -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:5050" -ForegroundColor Green
Write-Host "  Network: http://${ip}:5050" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

npx next dev --turbo --hostname $ip -p 5050
