@echo off
REM Auto-update version.json during build (Windows version)
REM This ensures every deployment gets a new version automatically

setlocal enabledelayedexpansion

REM Get timestamp
for /f %%A in ('powershell -Command "[int64](([datetime]::UtcNow)-(New-Object datetime(1970,1,1))).TotalMilliseconds"') do set TIMESTAMP=%%A

REM Get git SHA (short)
for /f %%A in ('git rev-parse --short HEAD') do set GIT_SHA=%%A
if "!GIT_SHA!"=="" set GIT_SHA=unknown

REM Get build time
for /f %%A in ('powershell -Command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC"') do set BUILD_TIME=%%A

REM Create version string
set VERSION_STRING=!GIT_SHA!-!TIMESTAMP!

echo.
echo Building version.json...
echo  Version: !VERSION_STRING!
echo  Timestamp: !TIMESTAMP!
echo  Deployed: !BUILD_TIME!
echo  Git SHA: !GIT_SHA!
echo.

REM Create version.json file
(
  echo {
  echo   "v": "!VERSION_STRING!",
  echo   "timestamp": !TIMESTAMP!,
  echo   "deployed": "!BUILD_TIME!",
  echo   "environment": "vercel",
  echo   "git": "!GIT_SHA!"
  echo }
) > public\version.json

echo ✓ Version file updated successfully
