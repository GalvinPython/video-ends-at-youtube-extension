$root = Resolve-Path "."

Write-Host "Root: $root"

$version = bun -e "import pkg from './src/manifest.json'; console.log(pkg.version)"

$buildDir = Join-Path $root "builds"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

$zipPath = Join-Path $buildDir "dist-$version.zip"

Compress-Archive -Path "$root/dist/*" -DestinationPath $zipPath -Force