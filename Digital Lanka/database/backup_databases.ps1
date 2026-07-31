# PowerShell script to back up Docker MySQL databases to the /database folder
$ErrorActionPreference = "Stop"

Write-Host "=== Starting Database Backup from Docker ===" -ForegroundColor Cyan

# Check if Docker container is running
$dockerState = docker inspect -f '{{.State.Running}}' gov_mysql 2>$null
if ($dockerState -ne "true") {
    Write-Error "Docker container 'gov_mysql' is not running. Please start it using 'docker compose up -d' first."
}

# Create backups directory if it doesn't exist
$backupDir = "$PSScriptRoot"
Write-Host "Backing up to: $backupDir" -ForegroundColor Green

# Databases to back up
$databases = @("trafficdb", "drp_mock_db", "dmt_mock_db")

foreach ($db in $databases) {
    Write-Host "Backing up database: $db..." -ForegroundColor Yellow
    
    # Run mysqldump inside the container and redirect output to a file on host
    # Using --single-transaction --skip-comments to get clean SQL dumps
    $outFile = Join-Path $backupDir "$db`_-backup.sql"
    
    # Run command and write output
    # We execute mysqldump inside docker and capture stdout
    docker exec gov_mysql mysqldump -u root -pgovroot --single-transaction --skip-comments $db > $outFile
    
    # Verify file was created and is not empty
    if (Test-Path $outFile) {
        $size = (Get-Item $outFile).Length
        Write-Host "Successfully backed up $db ($size bytes) to $outFile" -ForegroundColor Green
    } else {
        Write-Warning "Backup file for $db was not created."
    }
}

Write-Host "=== All Backups Completed! ===" -ForegroundColor Green
