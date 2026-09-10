"""Download only the verified official test input; never publish it as an artifact."""
import hashlib, io, pathlib, urllib.request, zipfile
url = "https://github.com/Snapmaker/OrcaSlicer/releases/download/v2.3.6/Snapmaker_Orca_Windows_V2.3.6_portable.zip"
data = urllib.request.urlopen(url, timeout=120).read()
if hashlib.sha256(data).hexdigest() != "3941f8021d2164b242c057d1c90ddb9f322385b3d0a4960d19bbbafe914b40d1":
    raise SystemExit("Vendor archive hash changed")
dest = pathlib.Path("/tmp/snorca-vendor-fixture")
with zipfile.ZipFile(io.BytesIO(data)) as archive:
    for name in archive.namelist():
        marker = "/resources/web/flutter_web/"
        if marker not in name or name.endswith("/"):
            continue
        relative = pathlib.PurePosixPath(name.split(marker, 1)[1])
        if relative.is_absolute() or ".." in relative.parts:
            raise SystemExit("Invalid archive path")
        target = dest / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(archive.read(name))
