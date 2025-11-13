@echo off
REM Batch script to create and set up virtual environment for My Library app

echo ========================================
echo Creating Virtual Environment
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Virtual environment created successfully!
echo.

echo ========================================
echo Activating Virtual Environment
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

echo Virtual environment activated!
echo.

echo ========================================
echo Installing Dependencies
echo ========================================
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing required packages...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To activate the virtual environment in the future, run:
echo   venv\Scripts\activate.bat
echo.
echo To deactivate, run:
echo   deactivate
echo.
echo To run the application:
echo   1. Initialize database: python init_db.py
echo   2. Start the app: python app.py
echo.
pause
