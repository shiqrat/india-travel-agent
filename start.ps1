# India Travel Agent — Setup & Start Script
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " India Travel Agent — IBM watsonx AI" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
$nodeCmd = $null
foreach ($path in @("node", "C:\Program Files\nodejs\node.exe", "C:\Program Files (x86)\nodejs\node.exe")) {
    try {
        $nodeCmd = (Get-Command $path -ErrorAction Stop).Source
        break
    } catch {}
    if (Test-Path $path) { $nodeCmd = $path; break }
}

if (-not $nodeCmd) {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/en/download" -ForegroundColor Yellow
    Write-Host "Download the LTS version (recommended), install it, then re-run this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js found. Installing backend dependencies..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
& npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Backend starting at: http://localhost:3001" -ForegroundColor Green
Write-Host " Open in browser: frontend/index.html" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
& node server.js
