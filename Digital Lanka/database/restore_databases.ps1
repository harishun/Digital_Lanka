# PowerShell script to restore SQL backups from the /database folder into Docker MySQL
$ErrorActionPreference = "Stop"

Write-Host "=== Starting Database Restore to Docker ===" -ForegroundColor Cyan

# Check if Docker container is running
$dockerState = docker inspect -f '{{.State.Running}}' gov_mysql 2>$null
if ($dockerState -ne "true") {
    Write-Error "Docker container 'gov_mysql' is not running. Please start it using 'docker compose up -d' first."
}

$backupDir = "$PSScriptRoot"
$databases = @("trafficdb", "drp_mock_db", "dmt_mock_db")

foreach ($db in $databases) {
    $sqlFile = Join-Path $backupDir "$db`_-backup.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Warning "Backup file $sqlFile not found. Skipping restore for $db."
        continue
    }
    
    Write-Host "Restoring database: $db from $sqlFile..." -ForegroundColor Yellow
    
    # Drop and recreate database to ensure a clean restore
    docker exec gov_mysql mysql -u root -pgovroot -e "DROP DATABASE IF EXISTS $db;"
    docker exec gov_mysql mysql -u root -pgovroot -e "CREATE DATABASE $db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Import SQL file
    Get-Content $sqlFile -Raw | docker exec -i gov_mysql mysql -u root -pgovroot $db
    
    # Grant permissions to govuser
    docker exec gov_mysql mysql -u root -pgovroot -e "GRANT ALL PRIVILEGES ON $db.* TO 'govuser'@'%'; FLUSH PRIVILEGES;"
    
    Write-Host "Successfully restored $db!" -ForegroundColor Green
}

Write-Host "=== All Restores Completed! ===" -ForegroundColor Green
