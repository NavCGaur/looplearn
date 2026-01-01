# Test script for Unified Question Manager
Write-Host "Testing Unified Question Manager endpoints..." -ForegroundColor Green

# Test backend endpoints
Write-Host "`n1. Testing backend subjects endpoint..." -ForegroundColor Yellow
try {
    $subjects = Invoke-RestMethod -Uri "http://localhost:5000/api/questions/subjects" -Method GET
    Write-Host "Subjects response:" ($subjects | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Subjects endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing backend classes endpoint..." -ForegroundColor Yellow
try {
    $classes = Invoke-RestMethod -Uri "http://localhost:5000/api/questions/classes" -Method GET
    Write-Host "Classes response:" ($classes | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Classes endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing backend chapters endpoint..." -ForegroundColor Yellow
try {
    $chapters = Invoke-RestMethod -Uri "http://localhost:5000/api/questions/chapters?subject=math&classStandard=class-9" -Method GET
    Write-Host "Chapters response:" ($chapters | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Chapters endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n4. Testing math questions endpoint..." -ForegroundColor Yellow
try {
    $mathQuestions = Invoke-RestMethod -Uri "http://localhost:5000/api/math/filter-questions?classStandard=class-9&limit=3" -Method GET
    Write-Host "Math questions count:" $mathQuestions.questions.Count
    if ($mathQuestions.questions.Count -gt 0) {
        Write-Host "First question:" $mathQuestions.questions[0].question
    }
} catch {
    Write-Host "Math questions endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n5. Testing science questions endpoint..." -ForegroundColor Yellow
try {
    $scienceQuestions = Invoke-RestMethod -Uri "http://localhost:5000/api/science/filter-questions?classStandard=class-9&limit=3" -Method GET
    Write-Host "Science questions count:" $scienceQuestions.questions.Count
    if ($scienceQuestions.questions.Count -gt 0) {
        Write-Host "First question:" $scienceQuestions.questions[0].question
    }
} catch {
    Write-Host "Science questions endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n6. Testing assigned questions endpoint..." -ForegroundColor Yellow
try {
    $assigned = Invoke-RestMethod -Uri "http://localhost:5000/api/questions/assigned?subject=math&classStandard=class-9" -Method GET
    Write-Host "Assigned questions response:" ($assigned | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Assigned questions endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:8080/admin/dashboard/questions" -ForegroundColor Cyan
