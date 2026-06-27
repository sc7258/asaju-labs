Add-Type -AssemblyName System.Drawing
$iconSource = "C:\Users\sc725\.gemini\antigravity-cli\brain\e65ff25c-de09-4862-ab25-1d06203fe49e\sajudex_icon_zoomed_1782533279953.jpg"
$splashSource = "C:\Users\sc725\.gemini\antigravity-cli\brain\e65ff25c-de09-4862-ab25-1d06203fe49e\sajudex_splash_full_1782533289882.jpg"

$iconImg = [System.Drawing.Image]::FromFile($iconSource)
$splashImg = [System.Drawing.Image]::FromFile($splashSource)

# 192x192 Icon
$icon192 = New-Object System.Drawing.Bitmap 192, 192
$g1 = [System.Drawing.Graphics]::FromImage($icon192)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($iconImg, 0, 0, 192, 192)
$icon192.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 512x512 Icon
$icon512 = New-Object System.Drawing.Bitmap 512, 512
$g2 = [System.Drawing.Graphics]::FromImage($icon512)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($iconImg, 0, 0, 512, 512)
$icon512.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 1536x2732 Splash (9:16 Portrait)
$splash = New-Object System.Drawing.Bitmap 1536, 2732
$g3 = [System.Drawing.Graphics]::FromImage($splash)
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.DrawImage($splashImg, 0, 0, 1536, 2732)
$splash.Save("C:\Users\sc725\_work-github\asaju-labs\apps\sajudex-mweb\public\splash.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g1.Dispose()
$g2.Dispose()
$g3.Dispose()
$icon192.Dispose()
$icon512.Dispose()
$splash.Dispose()
$iconImg.Dispose()
$splashImg.Dispose()
