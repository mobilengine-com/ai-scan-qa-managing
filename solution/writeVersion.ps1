[CmdletBinding()]
param (
    [Parameter()]
    [string]
    $Version
)

$packInfo = [xml](Get-Content .\solution\package.xml)
$packInfo.package.version = $Version

$currLoc = Get-Location
$filpInfo = Join-Path -Path $currLoc -ChildPath "solution\package.xml"
Write-Host "saving package info" $filpInfo
$packInfo.Save($filpInfo)
