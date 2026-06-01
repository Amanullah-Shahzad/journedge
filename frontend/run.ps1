$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Copy-Item .env.example .env.local -Force -ErrorAction SilentlyContinue
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
