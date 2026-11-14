param(
  [string]$ImagePath = "shots/fixtures/portrait.jpg",
  [string]$OutPath = "shots/fixtures/face.y4m",
  [int]$Width = 640,
  [int]$Height = 480,
  [int]$Frames = 60,
  [int]$Fps = 20
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile((Resolve-Path $ImagePath))

$canvas = New-Object System.Drawing.Bitmap $Width, $Height
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::FromArgb(24, 26, 30))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Crop to the head and shoulders, then scale to fill the frame.
$cropW = [int]($src.Width * 0.56)
$cropH = [int]($src.Height * 0.34)
$cropX = [int]($src.Width * 0.22)
$cropY = [int]($src.Height * 0.02)

$scale = [Math]::Max($Width / $cropW, $Height / $cropH)
$drawW = [int]($cropW * $scale)
$drawH = [int]($cropH * $scale)
$drawX = [int](($Width - $drawW) / 2)
$drawY = [int](($Height - $drawH) / 2)
$destRect = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
$graphics.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$graphics.Dispose()

# Pull RGB pixels once; the fake capture loops the same frame.
$rect = New-Object System.Drawing.Rectangle 0, 0, $Width, $Height
$bitmapData = $canvas.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$stride = $bitmapData.Stride
$bytes = New-Object byte[] ($stride * $Height)
[System.Runtime.InteropServices.Marshal]::Copy($bitmapData.Scan0, $bytes, 0, $bytes.Length)
$canvas.UnlockBits($bitmapData)

$ySize = $Width * $Height
$uvSize = ($Width / 2) * ($Height / 2)
$yPlane = New-Object byte[] $ySize
$uPlane = New-Object byte[] $uvSize
$vPlane = New-Object byte[] $uvSize

for ($y = 0; $y -lt $Height; $y++) {
  for ($x = 0; $x -lt $Width; $x++) {
    $offset = $y * $stride + $x * 3
    $b = $bytes[$offset]
    $g = $bytes[$offset + 1]
    $r = $bytes[$offset + 2]
    $luma = [int](0.299 * $r + 0.587 * $g + 0.114 * $b)
    $yPlane[$y * $Width + $x] = [byte][Math]::Min(255, [Math]::Max(0, $luma))
  }
}

for ($y = 0; $y -lt $Height; $y += 2) {
  for ($x = 0; $x -lt $Width; $x += 2) {
    $sumU = 0.0
    $sumV = 0.0
    for ($dy = 0; $dy -lt 2; $dy++) {
      for ($dx = 0; $dx -lt 2; $dx++) {
        $offset = ($y + $dy) * $stride + ($x + $dx) * 3
        $b = $bytes[$offset]
        $g = $bytes[$offset + 1]
        $r = $bytes[$offset + 2]
        $sumU += -0.169 * $r - 0.331 * $g + 0.5 * $b + 128
        $sumV += 0.5 * $r - 0.419 * $g - 0.081 * $b + 128
      }
    }
    $index = ($y / 2) * ($Width / 2) + ($x / 2)
    $uPlane[$index] = [byte][Math]::Min(255, [Math]::Max(0, [int]($sumU / 4)))
    $vPlane[$index] = [byte][Math]::Min(255, [Math]::Max(0, [int]($sumV / 4)))
  }
}

$stream = [System.IO.File]::Create((Join-Path (Get-Location) $OutPath))
$writer = New-Object System.IO.BinaryWriter($stream)
$header = "YUV4MPEG2 W$Width H$Height F$Fps`:1 Ip A1:1 C420jpeg`n"
$writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))

for ($frame = 0; $frame -lt $Frames; $frame++) {
  $writer.Write([System.Text.Encoding]::ASCII.GetBytes("FRAME`n"))
  $writer.Write($yPlane)
  $writer.Write($uPlane)
  $writer.Write($vPlane)
}

$writer.Flush()
$writer.Close()
$src.Dispose()
$canvas.Dispose()

"Wrote $OutPath ($([Math]::Round((Get-Item $OutPath).Length / 1MB, 1)) MB, $Frames frames at $Fps fps)"
