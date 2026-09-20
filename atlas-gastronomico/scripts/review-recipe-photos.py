"""Collect candidates, never publish them. Explicit visual selection is required.
Run: python scripts/review-recipe-photos.py (requires Pillow).
Downloads stay outside the app in photo-review/.
"""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / 'photo-review'
OUT.mkdir(exist_ok=True)
(OUT / 'candidates').mkdir(exist_ok=True)
UA = 'WorldBitesPhotoReview/1.0 (+https://github.com/jesusEMJ16/recetasmundiales)'
ALLOWED_HOSTS = {'commons.wikimedia.org', 'upload.wikimedia.org'}


def download(url: str) -> bytes:
    if urlparse(url).scheme != 'https' or urlparse(url).hostname not in ALLOWED_HOSTS:
        raise ValueError('Unapproved image host: ' + str(urlparse(url).hostname))
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': UA}), timeout=35) as response:
                if urlparse(response.url).hostname not in ALLOWED_HOSTS:
                    raise ValueError('Unapproved redirect')
                body = response.read(30_000_001)
                if len(body) > 30_000_000:
                    raise ValueError('Image exceeds download size limit')
                return body
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3 * (attempt + 1))
    raise RuntimeError('Download failed')


def text(value: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', value))).strip()


def search(term: str) -> list[dict]:
    params = {'action':'query', 'format':'json',
              'prop':'imageinfo', 'iiprop':'url|size|mime|extmetadata',
              'iiextmetadatafilter':'Artist|LicenseShortName|LicenseUrl|ImageDescription|Credit|UsageTerms',
              'maxlag':5}
    if term.startswith('File:'):
        params['titles'] = term
    else:
        params.update({'generator':'search', 'gsrsearch':term + ' filetype:bitmap',
                       'gsrnamespace':6, 'gsrlimit':8})
    data = json.loads(download('https://commons.wikimedia.org/w/api.php?' + urlencode(params)))
    if 'error' in data:
        raise RuntimeError(str(data['error']))
    return sorted(data.get('query', {}).get('pages', {}).values(), key=lambda p:p.get('index', 999))


requests = json.loads((ROOT/'scripts/photo-requests.json').read_text())
requests.update({
 'khao-soi':['"khao soi" -"OK Chicken"'],
 'guacamayas-leon':['"guacamaya" "torta"','"guacamayas" "León"'],
 'cochito-horneado-chiapaneco':['File:CochitoArriaga.jpg','File:CochitoCorzo2.jpg'],
 'coricos-de-mocorito':['"coricos" "galletas"','"tacuarines"'],
 'cortadillo-de-cuatro-cienegas':['"cortadillo" "carne"','"carne guisada" -"Noir"'],
 'pollo-de-san-marcos':['"pollo" "San Marcos" -"UNMSM" -"comedor"','"pollo en adobo"'],
 'el-bote-de-mazamitla':['"bote" "Mazamitla"','File:Caldo de res y verduras.jpg'],
 'fiambre-estilo-san-miguel-de-allende':['"fiambre" "Guanajuato"','"fiambre" "Mexico"','"fiambre" "salad"'],
 'gorditas-de-migajas-de-bernal':['"gorditas" "Bernal"','"gordita" "migajas"','"gorditas" "chicharrón"'],
 'lengua-mechada-de-tequisquiapan':['"lengua" "salsa"','"beef tongue" "sauce"'],
 'naranjete-de-huasca-de-ocampo':['"naranjete"','"orange liqueur" -"CARAFES"'],
 'tatemado-de-puerco-estilo-comala':['"tatemado" "Colima"','"tatemado" "puerco"'],
 'sopa-de-pan-coleta':['"sopa de pan"','"bread soup"'],
 'comiteco':['File:Comiteco.JPG'],
 'cafe-de-coatepec':['"coffee" "Coatepec"','"café" "taza"'],
 'mole-xiqueno':['"mole" "Xico" -"Shop"','"mole" "plate"'],
 'trucha-de-la-sierra-capulalpam':['"trucha" "asada"','"grilled trout"'],
 'cecina-de-yecapixtla':['"cecina" "Yecapixtla" -"Mostrador" -"Restaurante"'],
 'cecina-de-atlixco':['"cecina" "plato"','"cecina" "asada"'],
 'langosta-estilo-puerto-nuevo':['"lobster" "Puerto Nuevo"','"langosta" "plato"'],
 'cangrejo-real-alaska':['"king crab" "plate" -"Hogarth"','"king crab legs"'],
 'green-chile-stew-nuevo-mexico':['"green chile stew"','"chile verde" "pork"'],
 'zacahuil-huasteca-potosina':['"zacahuil" -"antes"'],
 'zacahuil-papantla':['"zacahuil" -"antes"']
})
report: dict[str, dict] = {}
cache: dict[str, list[dict]] = {}
byte_cache: dict[str, bytes] = {}
for slug, terms in requests.items():
    candidates: list[dict] = []
    errors: list[str] = []
    seen: set[str] = set()
    for term in terms:
        try:
            if term not in cache:
                cache[term] = search(term)
                time.sleep(0.6)
            for page in cache[term]:
                if page['title'] in seen:
                    continue
                seen.add(page['title'])
                infos = page.get('imageinfo', [])
                if not infos:
                    continue
                info = infos[0]
                if info.get('mime') not in {'image/jpeg', 'image/png', 'image/webp'}:
                    continue
                meta = info.get('extmetadata', {})
                val = lambda key: text(meta.get(key, {}).get('value', ''))
                license_name = val('LicenseShortName')
                if not re.match(r'^(CC BY(?:-SA)? [0-9]|CC0|Public domain)', license_name):
                    continue
                if min(info.get('width',0), info.get('height',0)) < 300:
                    continue
                author = val('Artist')
                if not author:
                    continue
                url = info['url']
                try:
                    if url not in byte_cache:
                        byte_cache[url] = download(url)
                    body = byte_cache[url]
                    image = ImageOps.exif_transpose(Image.open(io.BytesIO(body))).convert('RGB')
                    image.load()
                    if min(image.size) < 240:
                        continue
                    index = len(candidates) + 1
                    output = OUT/'candidates'/f'{slug}--{index}.webp'
                    image.thumbnail((1200,1200))
                    image.save(output, 'WEBP', quality=84, method=6)
                    candidates.append({'index':index, 'title':page['title'], 'query':term,
                        'path':str(output.relative_to(OUT)), 'url':url, 'originalUrl':url,
                        'sha256Original':hashlib.sha256(body).hexdigest(),
                        'width':image.width, 'height':image.height, 'author':author,
                        'license':license_name, 'licenseUrl':val('LicenseUrl'),
                        'source':info.get('descriptionurl',''), 'description':val('ImageDescription')[:1800]})
                except Exception as error:
                    errors.append(f'{page["title"]}: {error}')
                if len(candidates) >= 4:
                    break
            if len(candidates) >= 4:
                break
        except Exception as error:
            errors.append(f'{term}: {error}')
    report[slug] = {'candidates':candidates, 'errors':errors}
    (OUT/'candidates.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(slug, len(candidates), 'candidates', errors, flush=True)
print('TOTAL',len(report),'recipes;',sum(len(row['candidates']) for row in report.values()),'photos')
