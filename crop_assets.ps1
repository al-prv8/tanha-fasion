# PowerShell Script to Crop Banners and Product Images
# Using .NET System.Drawing

Add-Type -AssemblyName System.Drawing

function Crop-Image {
    param (
        [string]$Path,
        [string]$Type, # "banner" (16:9) or "product" (3:4)
        [int]$yOffset = -1 # if >=0, use this exact y offset for banner crops. Otherwise top focus.
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
        
        Write-Host "Processing $Path (Original: $w x $h)"
        
        if ($Type -eq "banner") {
            # 16:9 Banner Crop (width is kept, height is reduced to w / (16/9))
            $targetRatio = 16 / 9
            $newW = $w
            $newH = [int]($w / $targetRatio)
            $x = 0
            
            # Default to top-focus y offset (e.g. 50px offset) to keep heads and neck area
            if ($yOffset -ge 0 -and ($yOffset + $newH -le $h)) {
                $y = $yOffset
            } else {
                $y = 60 # small offset from the top to prevent clipping heads but keep framing natural
            }
        } elseif ($Type -eq "product") {
            # 3:4 Product Crop (height is kept, width is reduced to h * (3/4))
            $targetRatio = 3 / 4
            $newW = [int]($h * $targetRatio)
            $newH = $h
            $y = 0
            $x = [int](($w - $newW) / 2) # center horizontally
        } else {
            Write-Warning "Unknown crop type: $Type"
            $bmp.Dispose()
            return
        }

        if ($x -lt 0) { $x = 0 }
        if ($y -lt 0) { $y = 0 }
        if ($x + $newW -gt $w) { $newW = $w - $x }
        if ($y + $newH -gt $h) { $newH = $h - $y }

        Write-Host "Cropping to: x=$x, y=$y, w=$newW, h=$newH"

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
        
        Write-Host "Successfully cropped to $newW x $newH" -ForegroundColor Green
    } catch {
        Write-Error "Error cropping $($Path) : $_"
        if ($bmp) { $bmp.Dispose() }
        if ($cropped) { $cropped.Dispose() }
    }
}
