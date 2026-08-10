Add-Type -AssemblyName System.Drawing

function New-Icon([int]$size, [string]$path, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))

  $inset = if ($maskable) { [int]($size * 0.15) } else { [int]($size * 0.06) }
  $radius = [int]($size * 0.2)
  $rWidth = $size - (2 * $inset)
  $rect = New-Object System.Drawing.Rectangle($inset, $inset, $rWidth, $rWidth)

  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $radius
  $p.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $p.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $p.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $p.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $p.CloseFigure()

  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 96, 165, 250),
    [System.Drawing.Color]::FromArgb(255, 37, 99, 235),
    45.0
  )
  $g.FillPath($brush, $p)

  $font = New-Object System.Drawing.Font('Segoe UI', [float]($size * 0.38), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $g.DrawString('IT', $font, $white, $textRect, $sf)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path 'public/icons' | Out-Null
New-Icon 192 'public/icons/icon-192.png' $false
New-Icon 512 'public/icons/icon-512.png' $false
New-Icon 512 'public/icons/maskable-512.png' $true
Write-Output 'Icons generated in public/icons'
