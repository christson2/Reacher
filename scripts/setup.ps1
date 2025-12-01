# Setup helper for FreeMart (PowerShell)
# Run this script to initialize the project locally

Write-Output "========== FreeMart Setup =========="

# Step 1: Install dependencies
Write-Output "`n[1/5] Installing backend dependencies..."
cd backend
if (Test-Path package.json) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install failed. Check your Node.js installation."
        exit 1
    }
} else {
    Write-Error "No backend/package.json found."
    exit 1
}
cd ..

# Step 2: Setup .env
Write-Output "`n[2/5] Setting up .env file..."
if (Test-Path "backend/.env.example") {
    if (-not (Test-Path "backend/.env")) {
        Copy-Item "backend/.env.example" "backend/.env"
        Write-Output "Created backend/.env from template. Edit it with your DB credentials."
    } else {
        Write-Output "backend/.env already exists, skipping..."
    }
}

# Step 3: Start Docker services
Write-Output "`n[3/5] Starting Docker services (MySQL + Adminer)..."
if ((Get-Command docker -ErrorAction SilentlyContinue) -and (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    docker-compose up -d
    Write-Output "Docker services started (MySQL on 3306, Adminer on 8080)"
    Start-Sleep -Seconds 3
} else {
    Write-Warning "Docker/docker-compose not found. Please start MySQL manually."
}

# Step 4: Run migrations
Write-Output "`n[4/5] Running database migrations..."
cd backend
npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Migrations may have failed; check the DB connection in .env"
}

# Step 5: Seed data
Write-Output "`n[5/5] Seeding initial data..."
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Seeding may have failed; you can run 'npm run seed' manually later"
}

cd ..

Write-Output "`n========== Setup Complete =========="
Write-Output "Next steps:"
Write-Output "1. Edit backend/.env with your actual database credentials"
Write-Output "2. Run: .\scripts\start-dev.ps1  (to start the backend)"
Write-Output "3. Visit: http://localhost:4000"
Write-Output ""
Write-Output "For more info, see backend/README.md"
