@echo off
REM Script to import database schema
REM This script imports the schema.sql file into the MySQL database

echo.
echo ====================================================
echo  Importing Database Schema
echo ====================================================
echo.

REM Database credentials from .env
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=9880115570
set DB_NAME=automotive_service_db

REM Get project root
set PROJECT_ROOT=%~dp0

echo Importing schema.sql into database...
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Import schema
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < "%PROJECT_ROOT%schema.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo  ✅ DATABASE SCHEMA IMPORTED SUCCESSFULLY!
    echo ====================================================
    echo.
) else (
    echo.
    echo ====================================================
    echo  ❌ FAILED TO IMPORT SCHEMA
    echo ====================================================
    echo.
    echo Troubleshooting:
    echo 1. Verify MySQL is running
    echo 2. Check database credentials in this script
    echo 3. Ensure database '%DB_NAME%' exists
    echo.
)

pause
