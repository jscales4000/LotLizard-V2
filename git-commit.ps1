param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Script to automate Git commit and push process
# Usage: .\git-commit.ps1 -CommitMessage "Your detailed commit message here"

# Make sure we're in the right directory
$projectPath = "c:\Users\scale\LotLizard-V2"
Set-Location -Path $projectPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Adding all changes..." -ForegroundColor Cyan

# Add all changes
git add -A

# Show status
Write-Host "Current status:" -ForegroundColor Cyan
git status

# Commit with the provided message
Write-Host "Committing changes with message: $CommitMessage" -ForegroundColor Green
git commit -m "$CommitMessage"

# Push to the remote repository
Write-Host "Pushing to remote repository..." -ForegroundColor Cyan
git push origin main

# Update Project Log.md with version information
$date = Get-Date -Format "yyyy-MM-dd"
$versionMatch = [regex]::Match($CommitMessage, "\(v(\d+\.\d+\.\d+)\)")

if ($versionMatch.Success) {
    $version = $versionMatch.Groups[1].Value
    
    $projectLog = Join-Path -Path $projectPath -ChildPath "Project Log.md"
    if (Test-Path $projectLog) {
        # Create version entry header
        $logEntry = @"

## Version $version - $date

$CommitMessage

"@
        # Add entry to the beginning of the file (after first line)
        $content = Get-Content -Path $projectLog
        $newContent = $content[0], $logEntry, $content[1..($content.Length-1)]
        $newContent | Set-Content -Path $projectLog
        
        Write-Host "Updated Project Log.md with version $version" -ForegroundColor Green
        
        # Commit the Project Log update separately
        git add "Project Log.md"
        git commit -m "Update Project Log for version $version"
        git push origin main
    }
}

Write-Host "Commit and push process completed successfully!" -ForegroundColor Green
