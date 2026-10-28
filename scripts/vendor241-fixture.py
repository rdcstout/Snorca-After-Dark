"""Fetch hash-pinned official 2.4.1 resources for tests; never redistribute them."""
import hashlib, io, pathlib, struct, sys, urllib.request, zipfile
platform = 'windows'
name = 'Snapmaker_Orca_Windows_V2.4.1_portable.zip'
digest = '1f002e2168c576f800bcfd0509b5e164b5ad65a0963abc2bef8317d929d48c9d'
data = urllib.request.urlopen('https://github.com/Snapmaker/OrcaSlicer/releases/download/v2.4.1/' + name, timeout=180).read()
if hashlib.sha256(data).hexdigest() != digest:
    raise SystemExit('Vendor archive changed')
dest = pathlib.Path('/tmp/snorca-241-' + platform)
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
assert (dest / 'main.dart.js').is_file()
print('Verified fixture:', dest)
