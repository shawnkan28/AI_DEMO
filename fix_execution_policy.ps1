# Fix PowerShell execution policy to allow running scripts

Write-Host "Fixing PowerShell execution policy...`n" -ForegroundColor Yellow

try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "Execution policy updated successfully!" -ForegroundColor Green
    Write-Host "`nYou can now run PowerShell scripts.`n"
    Write-Host "Try running: .\setup_venv.ps1" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Failed to update execution policy" -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator"
}

Write-Host ""
Read-Host "Press Enter to exit"
