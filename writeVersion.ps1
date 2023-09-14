[CmdletBinding()]
param (
    [Parameter()]
    [string]
    $Version
)

$packInfo = [xml](Get-Content .\package.xml)
$packInfo.package.version = $Version

$currLoc = Get-Location
$filpInfo = Join-Path -Path $currLoc -ChildPath "package.xml"
Write-Host "saving package info" $filpInfo
$packInfo.Save($filpInfo)
