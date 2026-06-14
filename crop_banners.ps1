# PowerShell Script to Crop Images to strictly 16:9 Aspect Ratio
# Keep models on the right for banners (Cropping from the left if too wide)

Add-Type -AssemblyName System.Drawing

function Crop-To169 {
    param (
        [string]$Path,
        [string]$Focus = "right" # "right", "center", "left"
    )
    if (-not (Test-Path $Path)) {
        Write-Warning "File not found: $Path"
        return
    }

    try {
        # Load the image
        $bmp = [System.Drawing.Bitmap]::FromFile($Path)
        $w = $bmp.Width
        $h = $bmp.Height
        
        $targetRatio = 16 / 9
        $currentRatio = $w / $h
        
        Write-Host "Processing $Path (Original: $w x $h, Ratio: $([math]::Round($currentRatio, 2)))"
        
        if ($currentRatio -eq $targetRatio) {
            Write-Host "Image is already 16:9. Skipping."
            $bmp.Dispose()
            return
        }

        if ($currentRatio -gt $targetRatio) {
            # Image is too wide: crop sides
            $newW = [int]($h * $targetRatio)
            $newH = $h
            $y = 0
            
            if ($Focus -eq "right") {
                # Keep the right-side (for model space on right)
                $x = $w - $newW
            } elseif ($Focus -eq "center") {
                $x = [int](($w - $newW) / 2)
            } else {
                $x = 0
            }
        } else {
            # Image is too tall: crop top and bottom. Center vertically.
            $newW = $w
            $newH = [int]($w / $targetRatio)
            $x = 0
            $y = [int](($h - $newH) / 2)
        }

        # Create new cropped image
        $cropRect = New-Object System.Drawing.Rectangle($x, $y, $newW, $newH)
        $cropped = $bmp.Clone($cropRect, $bmp.PixelFormat)
        
        # Dispose original to release file lock
        $bmp.Dispose()
        
        # Save cropped image temporarily, then overwrite original
        $tempPath = $Path + ".tmp.png"
        $cropped.Save($tempPath)
        $cropped.Dispose()
        
        Remove-Item $Path -Force
        Rename-Item $tempPath (Split-Path $Path -Leaf) -Force
        
        Write-Host "Successfully cropped to 16:9 ($newW x $newH) focusing on $Focus" -ForegroundColor Green
    } catch {
        Write-Error "Error cropping $($Path) : $_"
        if ($bmp) { $bmp.Dispose() }
        if ($cropped) { $cropped.Dispose() }
    }
}

# Banner list to crop (Models are on the right)
$banners = @(
    "src/assets/hero_everyday_banner.png",
    "src/assets/combo_pack_banner.png",
    "src/assets/showroom_banner.png",
    "src/assets/cotton_3pc_banner.png",
    "src/assets/georgette_3pc_banner.png",
    "src/assets/linen_3pc_banner.png",
    "src/assets/casual_abaya_banner.png",
    "src/assets/festive_borka_banner.png"
)

foreach ($banner in $banners) {
    $fullPath = Join-Path $PSScriptRoot $banner
    Crop-To169 -Path $fullPath -Focus "right"
}
