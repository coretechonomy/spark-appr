$ErrorActionPreference = 'Stop' # stop on all errors

# Package Parameters
$pp = Get-PackageParameters
if (!$pp['passphrase']) {  Write-Host "Must supply GPG passphrase for SparkApprover.msi.gpg." -ForegroundColor Red; exit 1 }
$passphrase = "$($pp['passphrase'])"

[string]$owner = "coretechonomy"
[string]$repo = "spark-appr"

# GitHub API URL for latest release
$apiUrl = "https://api.github.com/repos/${owner}/${repo}/releases/latest"

# Make the web request to GitHub API
$response = Invoke-RestMethod -Uri $apiUrl -Headers @{
    'User-Agent' = 'PowerShell'
}

# Find the asset named SparkApprover.msi.gpg
$asset = $response.assets | Where-Object { $_.name -eq "SparkApprover.msi.gpg" }

if ($asset) {
    # Display the latest release information for the specific asset
    Write-Host "Latest release for ${owner}/${repo}:"
    Write-Host "Tag: $($response.tag_name)"
    Write-Host "Name: $($response.name)"
    Write-Host "Published at: $($response.published_at)"
    Write-Host "Download URL: $($asset.browser_download_url)"
} else {
    Write-Host "Asset SparkApprover.msi.gpg not found in the latest release."
}

$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
Get-ChocolateyWebFile -PackageName 'gpg' -FileFullPath $env:TEMP\$($asset.name) -Url $($asset.browser_download_url) -ForceDownload

# choco install gnupg -y
gpg  --quiet --batch --yes --passphrase `"$($pp['passphrase'])`" -d -o "$env:TEMP\SparkApprover.msi" "$env:TEMP\$($asset.name)"
$fileLocation = "$env:TEMP\SparkApprover.msi"

$packageArgs = @{
  packageName   = $env:ChocolateyPackageName
  unzipLocation = $toolsDir
  fileType      = 'MSI'
  # url           = $url
  file          = $fileLocation
  softwareName  = 'spark-approver'
  silentArgs    = '/quiet'
  # Uncomment matching EXE type (sorted by most to least common)
  # silentArgs   = '/S'           # NSIS
  # silentArgs   = '/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-' # Inno Setup
  #silentArgs   = '/s'           # InstallShield
  # silentArgs   = '/s /v"/qn"'   # InstallShield with MSI
  # silentArgs   = '/s'           # Wise InstallMaster
  #silentArgs   = '-s'           # Squirrel
  #silentArgs   = '-q'           # Install4j
  #silentArgs   = '-s'           # Ghost
  validExitCodes= @(0)
}

Install-ChocolateyInstallPackage @packageArgs