# PowerShell script to create and set up virtual environment for My Library app

Write-Host "========================================"
Write-Host "Creating Virtual Environment"
Write-Host "========================================`n"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion`n"
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python and try again"
    Read-Host "Press Enter to exit"
    exit 1
}

# Create virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Failed to create virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Virtual environment created successfully!`n" -ForegroundColor Green

Write-Host "========================================"
Write-Host "Activating Virtual Environment"
Write-Host "========================================`n"

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

Write-Host "Virtual environment activated!`n" -ForegroundColor Green

Write-Host "========================================"
Write-Host "Installing Dependencies"
Write-Host "========================================`n"

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
Write-Host "`nInstalling required packages..."
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n========================================"
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n"
Write-Host "To activate the virtual environment in the future, run:"
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "`nIf you get an execution policy error, run:"
Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
Write-Host "`nTo deactivate, run:"
Write-Host "  deactivate" -ForegroundColor Cyan
Write-Host "`nTo run the application:"
Write-Host "  1. Initialize database: python init_db.py" -ForegroundColor Cyan
Write-Host "  2. Start the app: python app.py" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
