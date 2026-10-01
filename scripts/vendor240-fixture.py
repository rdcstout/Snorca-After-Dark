"""Fetch hash-pinned official 2.4.0 resources for tests; never redistribute them."""
import hashlib, io, pathlib, struct, sys, urllib.request, zipfile
platform = sys.argv[1] if len(sys.argv) > 1 else 'windows'
assets = {
    'windows': ('Snapmaker_Orca_Windows_V2.4.0_portable.zip', '089b7ca20ccfc4be57ffb5a7f9f81e3a2b55db3a9622755fee2b20208bfcb8c2'),
    'linux': ('Snapmaker_Orca_Linux_AppImage_Ubuntu2404_V2.4.0.AppImage', '410338565babf59640d082fae39c1c327034eb98883b597d740eaa587c89b75e'),
}
name, digest = assets[platform]
data = urllib.request.urlopen('https://github.com/Snapmaker/OrcaSlicer/releases/download/v2.4.0/' + name, timeout=180).read()
if hashlib.sha256(data).hexdigest() != digest:
    raise SystemExit('Vendor archive changed')
dest = pathlib.Path('/tmp/snorca-240-' + platform)
def save(name, read):
    if '/web/flutter_web/' not in name or name.endswith('/'):
        return
    rel = pathlib.PurePosixPath(name.split('/web/flutter_web/', 1)[1])
    if rel.is_absolute() or '..' in rel.parts:
        raise SystemExit('Unsafe vendor path')
    out = dest / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(read())
if platform == 'windows':
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        for entry in archive.namelist():
            save(entry, lambda: archive.read(entry))
else:
    from dissect.squashfs import SquashFS
    offset = -1
    while True:
        offset = data.find(b'hsqs', offset + 1)
        if offset < 0:
            raise SystemExit('SquashFS not found')
        if struct.unpack_from('<HH', data, offset + 28) == (4, 0):
            break
    image = SquashFS(io.BytesIO(data[offset:]))
    def walk(node, prefix=''):
        for entry in node.iterdir():
            name = prefix + '/' + entry.name
            if entry.is_dir():
                walk(entry, name)
            elif entry.is_file():
                save(name, lambda: entry.open().read())
    walk(image.root)
assert (dest / 'main.8c1e336f107a452a.js').is_file()
print('Verified fixture:', dest)
