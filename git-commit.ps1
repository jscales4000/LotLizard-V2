param (
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Auto = $false
)

# Script to automate Git commit and push process
# Usage: .\git-commit.ps1 -CommitMessage "Your detailed commit message here"

# Make sure we're in the right directory
$projectPath = "c:\Users\scale\LotLizard-V2"
Set-Location -Path $projectPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Generate commit message if auto is specified
if ($Auto) {
    Write-Host "Generating commit message automatically..." -ForegroundColor Yellow
    
    # Get the list of changed files
    $changedFiles = git diff --name-status HEAD
    
    # Get commit history to extract recent accomplishments
    $recentCommits = git log -n 3 --pretty=format:"%s"
    
    # Extract feature areas that were changed
    $featureAreas = @()
    $componentTypes = @("components", "services", "stores", "utils", "hooks")
    
    foreach ($file in $changedFiles) {
        foreach ($component in $componentTypes) {
            if ($file -match "src/$component/([^/]+)") {
                $featureAreas += $matches[1]
            }
        }
    }
    
    $featureAreas = $featureAreas | Sort-Object -Unique
    
    # Generate version if not provided
    if ([string]::IsNullOrEmpty($Version)) {
        # Try to extract last version from Project Log.md
        $projectLog = Get-Content -Path "Project Log.md" -ErrorAction SilentlyContinue
        $versionMatch = [regex]::Match(($projectLog -join "`n"), "## Version (\d+\.\d+\.\d+)")
        
        if ($versionMatch.Success) {
            $lastVersion = $versionMatch.Groups[1].Value
            # Increment patch version
            $versionParts = $lastVersion -split "\."
            $versionParts[2] = [int]$versionParts[2] + 1
            $Version = $versionParts -join "."
        } else {
            $Version = "0.1.0"
        }
    }
    
    # Generate commit title based on changed files
    $title = "Update "
    if ($featureAreas.Count -gt 0) {
        $title += $featureAreas -join ", " 
    } else {
        $title += "multiple components"
    }
    
    $CommitMessage = "$title (v$Version) - Automated commit"
}

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

# Extract version from commit message if not provided directly
$date = Get-Date -Format "yyyy-MM-dd"
$versionMatch = [regex]::Match($CommitMessage, "\(v(\d+\.\d+\.\d+)\)")

if ($versionMatch.Success) {
    $version = $versionMatch.Groups[1].Value
} elseif (![string]::IsNullOrEmpty($Version)) {
    $version = $Version
    # Update the commit message to include the version
    if (!$CommitMessage.Contains("(v$version)")) {
        $CommitMessage = "$CommitMessage (v$version)"
    }
} else {
    # Try to extract last version from Project Log.md and increment it
    $projectLog = Get-Content -Path "Project Log.md" -ErrorAction SilentlyContinue
    $versionMatch = [regex]::Match(($projectLog -join "`n"), "## Version (\d+\.\d+\.\d+)")
    
    if ($versionMatch.Success) {
        $lastVersion = $versionMatch.Groups[1].Value
        # Increment patch version
        $versionParts = $lastVersion -split "\."
        $versionParts[2] = [int]$versionParts[2] + 1
        $version = $versionParts -join "."
    } else {
        $version = "0.1.0"
    }
    
    # Update commit message with version
    $CommitMessage = "$CommitMessage (v$version)"
}

# Update Project Log.md with version information
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
    
    # Add Project Log to the commit
    git add "Project Log.md"
}

# Update README.md with latest features and version
$readmePath = Join-Path -Path $projectPath -ChildPath "README.md"
if (Test-Path $readmePath) {
    $readme = Get-Content -Path $readmePath
    
    # Extract features from recent commits
    $recentFeatures = git log -n 10 --pretty=format:"%s" | ForEach-Object {
        if ($_ -match "-\s*(.+)$") {
            "- " + $matches[1].Trim()
        }
    } | Select-Object -Unique -First 5
    
    # Find the Recent Features section in README or create it
    $featureSectionIndex = -1
    for ($i = 0; $i -lt $readme.Count; $i++) {
        if ($readme[$i] -match "^#{1,3}\s*Recent Features") {
            $featureSectionIndex = $i
            break
        }
    }
    
    # Update version in README
    for ($i = 0; $i -lt $readme.Count; $i++) {
        if ($readme[$i] -match "^#{1,3}\s*Version") {
            $readme[$i] = "## Version: $version ($date)"
            break
        }
    }
    
    # Add Recent Features section if it doesn't exist
    if ($featureSectionIndex -eq -1) {
        $readme += ""
        $readme += "## Recent Features"
        $readme += ""
        $readme += $recentFeatures
    } else {
        # Replace existing features
        $endIndex = $featureSectionIndex + 1
        while ($endIndex -lt $readme.Count -and !($readme[$endIndex] -match "^#{1,3}")) {
            $endIndex++
        }
        
        $newReadme = $readme[0..$featureSectionIndex]
        $newReadme += ""
        $newReadme += $recentFeatures
        $newReadme += ""
        $newReadme += $readme[$endIndex..($readme.Count-1)]
        
        $readme = $newReadme
    }
    
    # Save updated README
    $readme | Set-Content -Path $readmePath
    Write-Host "Updated README.md with latest features and version $version" -ForegroundColor Green
    
    # Add README to the commit
    git add "README.md"
}

# Commit the changes with the updated message
git commit --amend -m "$CommitMessage"

# Push to the remote repository
Write-Host "Pushing to remote repository..." -ForegroundColor Cyan
git push origin main --force

Write-Host "Commit and push process completed successfully!" -ForegroundColor Green
