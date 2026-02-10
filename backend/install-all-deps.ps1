# install-all-deps.ps1
Write-Host "Installing ALL EduVerse dependencies..." -ForegroundColor Cyan

$allDeps = @(
    # Core
    "express",
    "mongoose",
    "dotenv",
    
    # Security & Middleware
    "helmet",
    "cors", 
    "bcryptjs",
    "jsonwebtoken",
    "express-rate-limit",
    "express-mongo-sanitize", 
    "xss-clean",
    "hpp",
    "compression",
    "cookie-parser",
    "body-parser",
    "morgan",
    
    # Validation
    "express-validator",
    "express-async-handler",
    "joi",
    
    # File Handling
    "multer",
    "cloudinary@1.38.0",
    "multer-storage-cloudinary@4.0.0",
    "express-fileupload",
    
    # Email
    "nodemailer",
    
    # Payments
    "razorpay",
    "stripe",
    
    # Authentication
    "passport",
    "passport-jwt", 
    "passport-local",
    "express-session",
    "connect-mongo",
    
    # Utilities
    "lodash",
    "moment",
    "axios",
    "uuid",
    "winston",
    "colors",
    "slugify",
    
    # Testing
    "jest",
    "supertest",
    "cross-env"
)

foreach ($dep in $allDeps) {
    Write-Host "Installing $dep..." -ForegroundColor Yellow
    npm install $dep --legacy-peer-deps
}

Write-Host "`n✅ ALL dependencies installed!" -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Cyan