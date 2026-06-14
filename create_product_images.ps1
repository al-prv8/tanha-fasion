Add-Type -AssemblyName System.Drawing

# Paths
$assetsDir = "c:\Users\almamun\Documents\GitHub\tanha-fasion\src\assets"
$brainDir = "C:\Users\almamun\.gemini\antigravity-ide\brain\958b6e2d-4617-4041-8a0b-4691bb6a894f"

function Crop-And-Save {
    param (
        [string]$SrcPath,
        [string]$DestName,
        [string]$Focus, # "left", "center", "right", "center-mirror"
        [int]$w = 1024,
        [int]$h = 1024
    )
    if (-not (Test-Path $SrcPath)) {
        Write-Warning "Source not found: $SrcPath"
        return
    }
    
    $bmp = [System.Drawing.Bitmap]::FromFile($SrcPath)
    $targetRatio = 3 / 4
    
    # We want 3:4 ratio.
    # New width will be h * 0.75. For 1024x1024: new width = 768.
    $newW = [int]($h * $targetRatio)
    $newH = $h
    $y = 0
    
    if ($Focus -eq "left") {
        $x = 0
    } elseif ($Focus -eq "right") {
        $x = $w - $newW
    } else {
        # center
        $x = [int](($w - $newW) / 2)
    }
    
    # Create rect
    $rect = New-Object System.Drawing.Rectangle($x, $y, $newW, $newH)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $bmp.Dispose()
    
    if ($Focus -eq "center-mirror") {
        $cropped.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
    }
    
    $destPath = Join-Path $assetsDir $DestName
    if (Test-Path $destPath) {
        Remove-Item $destPath -Force
    }
    $cropped.Save($destPath)
    $cropped.Dispose()
    Write-Host "Created $DestName focusing on $Focus" -ForegroundColor Green
}

# Restore group files from brain to assets in case they were deleted earlier, so we can crop from them
Copy-Item (Join-Path $brainDir "cotton_3pc_group_1781408277086.png") (Join-Path $assetsDir "cotton_3pc_group.png") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $brainDir "georgette_3pc_group_1781408296865.png") (Join-Path $assetsDir "georgette_3pc_group.png") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $brainDir "linen_3pc_group_1781408313710.png") (Join-Path $assetsDir "linen_3pc_group.png") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $brainDir "casual_abaya_group_1781408330103.png") (Join-Path $assetsDir "casual_abaya_group.png") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $brainDir "festive_borka_group_1781408348071.png") (Join-Path $assetsDir "festive_borka_group.png") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $brainDir "combo_pack_group_1781408362357.png") (Join-Path $assetsDir "combo_pack_group.png") -Force -ErrorAction SilentlyContinue

# 1. Cotton products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "cotton_product_1_1781410566378.png") -DestName "cotton_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "cotton_product_2_1781410580350.png") -DestName "cotton_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "cotton_product_3_1781411362131.png") -DestName "cotton_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "cotton_product_4_1781411385871.png") -DestName "cotton_4.png" -Focus "center"

# 2. Georgette products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "georgette_product_1_1781411412861.png") -DestName "georgette_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "georgette_product_2_1781411437528.png") -DestName "georgette_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "georgette_product_3_1781411459796.png") -DestName "georgette_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "georgette_product_4_1781411485034.png") -DestName "georgette_4.png" -Focus "center"

# 3. Linen products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "linen_product_1_1781411501986.png") -DestName "linen_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "linen_product_2_1781413405178.png") -DestName "linen_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "linen_product_3_1781413421267.png") -DestName "linen_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "linen_product_4_1781413436145.png") -DestName "linen_4.png" -Focus "center"

# 4. Casual Abaya products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "casual_abaya_1_1781413451350.png") -DestName "casual_abaya_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "casual_abaya_2_1781413464673.png") -DestName "casual_abaya_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "casual_abaya_3_1781413477962.png") -DestName "casual_abaya_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "casual_abaya_4_1781413491470.png") -DestName "casual_abaya_4.png" -Focus "center"

# 5. Festive Borka products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "festive_borka_1_1781413509114.png") -DestName "festive_borka_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "festive_borka_2_1781413523405.png") -DestName "festive_borka_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "festive_borka_3_1781413542319.png") -DestName "festive_borka_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "festive_borka_4_1781413557404.png") -DestName "festive_borka_4.png" -Focus "center"

# 6. Combo products (All 4 are unique generated images!)
Crop-And-Save -SrcPath (Join-Path $brainDir "combo_product_1_1781413576471.png") -DestName "combo_1.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "combo_product_2_1781413589898.png") -DestName "combo_2.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "combo_product_3_1781413604067.png") -DestName "combo_3.png" -Focus "center"
Crop-And-Save -SrcPath (Join-Path $brainDir "combo_product_4_1781413618931.png") -DestName "combo_4.png" -Focus "center"

# Cleanup copied group files after cropping to keep src/assets/ fully clean
Remove-Item (Join-Path $assetsDir "cotton_3pc_group.png") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $assetsDir "georgette_3pc_group.png") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $assetsDir "linen_3pc_group.png") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $assetsDir "casual_abaya_group.png") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $assetsDir "festive_borka_group.png") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $assetsDir "combo_pack_group.png") -Force -ErrorAction SilentlyContinue
