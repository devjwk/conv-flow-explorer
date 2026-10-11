"""Build a portable ZIP without checkouts, machine binaries or cached state."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

app=Path(__file__).resolve().parents[1]
destination=app.parent/'conv-explorer-portable.zip'
files=[app/'README.md',app/'README.ko.md',app/'run.py',app/'.gitignore']
files.extend(sorted((app/'dist').glob('*')))
files.extend(sorted((app/'docs').glob('*.jpg')))
files.extend(sorted(p for p in (app/'tools').glob('*') if p.suffix in {'.py','.cpp','.cjs'}))
files.extend(app/'validation'/name for name in ['verification.json','random-verification.json','data-manifest.json','layer-data-manifest.json'])
with ZipFile(destination,'w',ZIP_DEFLATED) as archive:
    for path in files:
        if path.is_file(): archive.write(path,Path('conv-explorer')/path.relative_to(app))
print(destination)
