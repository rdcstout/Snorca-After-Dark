#!/bin/sh
set -eu
# Run on Linux after electron-builder --linux dir deb --x64.
input=$(realpath "$1")
out=$(realpath "$2")
version=$(node -p 'require("./package.json").version')
id=therapy.extrusion.orca_dark_launcher
build="$out/flatpak-stage-$version"
repo="$out/flatpak-repo-$version"
test ! -e "$build"
flatpak build-init --base=org.electronjs.Electron2.BaseApp --base-version=25.08 "$build" "$id" org.freedesktop.Sdk org.freedesktop.Platform 25.08
mkdir -p "$build/files/lib/$id" "$build/files/bin" "$build/files/share/applications" "$build/files/share/icons/hicolor/512x512/apps"
cp -a "$input/." "$build/files/lib/$id/"
cat > "$build/files/bin/snorca-after-dark" <<EOF
#!/bin/sh
exec zypak-wrapper /app/lib/$id/snorca-after-dark --ozone-platform=x11 "\$@"
EOF
chmod 755 "$build/files/bin/snorca-after-dark"
cp assets/icon-512.png "$build/files/share/icons/hicolor/512x512/apps/$id.png"
cat > "$build/files/share/applications/$id.desktop" <<EOF
[Desktop Entry]
Name=Snorca After Dark
Comment=Reversible dark Home and Device pages for Snapmaker Orca
Exec=snorca-after-dark
Icon=$id
Terminal=false
Type=Application
Categories=Utility;
EOF
flatpak build-finish --command=snorca-after-dark --socket=x11 --share=ipc --device=dri --share=network --talk-name=org.freedesktop.Flatpak --filesystem=xdg-config/orca-dark-launcher:create "$build"
flatpak build-export "$repo" "$build" stable
flatpak build-bundle --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo "$repo" "$out/Snorca-After-Dark-$version-linux-x64.flatpak" "$id" stable
