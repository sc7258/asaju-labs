Add-Type -AssemblyName System.Drawing
$sourcePath = "C:\Users\sc725\.gemini\antigravity-cli\brain\e65ff25c-de09-4862-ab25-1d06203fe49e\sajudex_cute_network_icon_1782532158072.jpg"
$img = [System.Drawing.Image]::FromFile($sourcePath)

# 192x192
$icon192 = New-Object System.Drawing.Bitmap 192, 192
$g1 = [System.Drawing.Graphics]::FromImage($icon192)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($img, 0, 0, 192, 192)
$icon192.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 512x512
$icon512 = New-Object System.Drawing.Bitmap 512, 512
$g2 = [System.Drawing.Graphics]::FromImage($icon512)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($img, 0, 0, 512, 512)
$icon512.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Splash screen (e.g. 2048x2732 portrait)
$splash = New-Object System.Drawing.Bitmap 2048, 2732
$g3 = [System.Drawing.Graphics]::FromImage($splash)
$bgColor = [System.Drawing.Color]::FromArgb(255, 255, 255) # You can pick a dominant color if needed, but white is safe if image is transparent, wait JPG is not transparent. Let's just use white.
$g3.Clear($bgColor)
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.DrawImage($img, 512, 854, 1024, 1024) # Centered 1024x1024
$splash.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\splash.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g1.Dispose()
$g2.Dispose()
$g3.Dispose()
$icon192.Dispose()
$icon512.Dispose()
$splash.Dispose()
$img.Dispose()
