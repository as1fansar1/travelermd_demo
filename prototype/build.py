"""Build the prototype from src.html.

Inlines every image in images/ as a data URI, then writes:
  index.html     standalone page (open directly or serve statically)
  artifact.html  same page as a fragment, for publishing as a Claude artifact
"""
import base64
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
IMAGES = os.path.join(HERE, 'images')
MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}


def read(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


def write(name, text):
    with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
        f.write(text)


img = {}
for f in sorted(os.listdir(IMAGES)):
    key, ext = os.path.splitext(f)
    if ext.lower() not in MIME:
        continue
    with open(os.path.join(IMAGES, f), 'rb') as fh:
        img[key] = f'data:{MIME[ext.lower()]};base64,' + base64.b64encode(fh.read()).decode()

src = read('src.html').replace('/*__IMG__*/{}', json.dumps(img))
write('artifact.html', src)
write('index.html', '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
      + src.replace('</style>', '</style>\n</head>\n<body>', 1) + '\n</body>\n</html>\n')
print(f'built index.html ({len(img)} images)')
