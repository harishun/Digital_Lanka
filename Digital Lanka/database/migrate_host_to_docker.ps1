# PowerShell script to migrate trafficdb from local host MySQL to Docker MySQL
$ErrorActionPreference = "Stop"

Write-Host "=== Starting Migration of trafficdb from Host to Docker ===" -ForegroundColor Cyan

# Common MySQL installation directories on Windows
$searchPaths = @(
    "C:\Program Files\MySQL\MySQL Server *\bin\mysqldump.exe",
    "C:\xampp\mysql\bin\mysqldump.exe",
    "C:\wamp64\bin\mysql\mysql*\bin\mysqldump.exe",
    "C:\wamp\bin\mysql\mysql*\bin\mysqldump.exe"
)

$mysqldumpPath = $null

# Search for mysqldump
foreach ($pathPattern in $searchPaths) {
    $matches = Resolve-Path $pathPattern -ErrorAction SilentlyContinue
    if ($matches) {
        $mysqldumpPath = $matches[0].Path
        break
    }
}

# If not found in common locations, check system PATH
if (-not $mysqldumpPath) {
    $mysqldumpPath = Get-Command mysqldump.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
}

if (-not $mysqldumpPath) {
    Write-Warning "Could not find 'mysqldump.exe' in standard locations or PATH."
    Write-Host "Please enter the path to your 'mysqldump.exe' (e.g. C:\xampp\mysql\bin\mysqldump.exe):" -ForegroundColor Yellow
    $userInput = Read-Host
    if (Test-Path $userInput) {
        $mysqldumpPath = $userInput
    } else {
        Write-Error "Invalid path to mysqldump.exe. Cannot proceed with automatic export of local host data."
    }
}

Write-Host "Using mysqldump at: $mysqldumpPath" -ForegroundColor Green

# Dump trafficdb from local host MySQL
Write-Host "Exporting 'trafficdb' from host MySQL (assuming root / empty password)..." -ForegroundColor Yellow
try {
    # Run mysqldump
    & $mysqldumpPath -u root --databases trafficdb > "$PSScriptRoot\trafficdb_host_backup.sql"
    Write-Host "Host database successfully exported to database/trafficdb_host_backup.sql" -ForegroundColor Green
} catch {
    Write-Warning "Failed to dump 'trafficdb' from host. It's possible the database does not exist on your host yet, or uses a different password."
    Write-Host "We will proceed. If your database was empty or you don't have existing host data, you can skip this." -ForegroundColor Yellow
}

# Ensure the Docker container is running
$dockerState = docker inspect -f '{{.State.Running}}' gov_mysql 2>$null
if ($dockerState -ne "true") {
    Write-Error "Docker container 'gov_mysql' is not running. Please start it using 'docker compose up -d' in the government-mock-apis folder first."
}

# Import into Docker MySQL container
if (Test-Path "$PSScriptRoot\trafficdb_host_backup.sql") {
    Write-Host "Importing trafficdb backup into Docker container 'gov_mysql'..." -ForegroundColor Yellow
    
    # Create database if not exists in Docker
    docker exec gov_mysql mysql -u root -pgovroot -e "CREATE DATABASE IF NOT EXISTS trafficdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Import SQL file
    # We use Get-Content and pipe it to docker exec to avoid encoding/interactive issues in Windows PowerShell
    Get-Content "$PSScriptRoot\trafficdb_host_backup.sql" -Raw | docker exec -i gov_mysql mysql -u root -pgovroot trafficdb
    
    # Grant permissions to govuser
    docker exec gov_mysql mysql -u root -pgovroot -e "GRANT ALL PRIVILEGES ON trafficdb.* TO 'govuser'@'%'; FLUSH PRIVILEGES;"
    
    # Remove temporary backup file
    Remove-Item "$PSScriptRoot\trafficdb_host_backup.sql" -Force
    
    Write-Host "=== Migration completed successfully! ===" -ForegroundColor Green
} else {
    Write-Host "No host backup file found to import. Creating empty 'trafficdb' inside Docker container..." -ForegroundColor Yellow
    docker exec gov_mysql mysql -u root -pgovroot -e "CREATE DATABASE IF NOT EXISTS trafficdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    docker exec gov_mysql mysql -u root -pgovroot -e "GRANT ALL PRIVILEGES ON trafficdb.* TO 'govuser'@'%'; FLUSH PRIVILEGES;"
    Write-Host "=== Ready! ===" -ForegroundColor Green
}
