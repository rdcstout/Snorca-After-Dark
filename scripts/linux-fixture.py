"""Extract verified vendor web resources for tests only; never distribute them."""
import hashlib, io, pathlib, urllib.request
from dissect.squashfs import SquashFS
url = 'https://github.com/Snapmaker/OrcaSlicer/releases/download/V2.3.6/Snapmaker_Orca_Linux_AppImage_Ubuntu2404_V2.3.6.AppImage'
data = urllib.request.urlopen(url, timeout=120).read()
assert hashlib.sha256(data).hexdigest() == '1cd1606d3bc582c937ba67c3289da8d3739bc38092ba6d792968bf28b2f337d2', 'Vendor archive changed'
image = SquashFS(io.BytesIO(data[944632:]))
dest = pathlib.Path('/tmp/snorca-linux-fixture')
def walk(node, prefix=''):
    for entry in node.iterdir():
        name = prefix + '/' + entry.name
        if entry.is_dir():
            walk(entry, name)
        elif '/web/flutter_web/' in name and entry.is_file():
            relative = pathlib.PurePosixPath(name.split('/web/flutter_web/', 1)[1])
            assert not relative.is_absolute() and '..' not in relative.parts
            out = dest / relative
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(entry.open().read())
walk(image.root)
assert (dest / 'main.dart.js').is_file()
print('Verified official Linux fixture extracted')
