Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Victus\Downloads\credit-assistant\public\logo.png"
$dstPath = "c:\Users\Victus\Downloads\credit-assistant\public\logo-icon.png"

$img = [System.Drawing.Image]::FromFile($srcPath)
$w = $img.Width
$h = $img.Height

$cropX = [int]($w * 0.18)
$cropY = [int]($h * 0.06)
$cropW = [int]($w * 0.64)
$cropH = [int]($h * 0.54)

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($img, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Logo icon cropped successfully to $dstPath"
