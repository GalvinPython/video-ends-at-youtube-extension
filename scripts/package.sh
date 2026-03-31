#!/usr/bin/env bash
set -e

root="$(pwd)"
echo "Root: $root"

version=$(bun -e "import pkg from './src/manifest.json'; console.log(pkg.version)")

build_dir="$root/builds"
mkdir -p "$build_dir"

zip_path="$build_dir/dist-$version.zip"

cd "$root/dist"
zip -r "$zip_path" .