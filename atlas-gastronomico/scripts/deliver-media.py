"""One-off recovery importer. It never searches or chooses photos automatically.

Inputs are explicitly reviewed selections from pinned GitHub Actions artifacts.
Published images and provenance are committed, so the site has no artifact/network
runtime dependency. Original public images are preserved for old URLs.
"""
from __future__ import annotations
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageOps

BASE = '1faadecfa1ded8c06e1eb79a19015e407de55ee2'
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT.parent / '.photo-cache'
OUT = ROOT / 'public/images/recipes-v2'
OUT.mkdir(parents=True, exist_ok=True)
recipes = json.loads((ROOT/'src/data/recipes-reviewed.json').read_text())
original = subprocess.check_output(['git','show',BASE+':atlas-gastronomico/src/data/recipe-images.ts'],text=True)
old = {}
for slug, body in re.findall(r'"([^"\n]+)":\s*\{([^\n]*?)\}',original):
    fields = dict(re.findall(r'(url|author|license|source):\s*"([^"\n]*)"',body))
    if len(fields)==4: old[slug]=fields
assert len(old)==166, f'Unexpected legacy image map: {len(old)}'
selections = json.loads((ROOT/'scripts/media-selections.json').read_text())
datasets = {name:json.loads((CACHE/name/'candidates.json').read_text()) for name in {v[0] for v in selections.values()}}
# These old photos show unrelated dishes, places, people, packaging or leftovers.
# Never silently reinstate one if an appropriate replacement is unavailable.
rejected = set('barbacoa-de-borrego cecina-de-yecapixtla cecina-de-atlixco langosta-estilo-puerto-nuevo churipo-purepecha pan-de-pulque-de-saltillo gorditas-de-horno-real-de-catorce gorditas-de-horno-duranguenses cangrejo-real-alaska green-chile-stew-nuevo-mexico sugar-on-snow-vermont hotdish-de-tater-tots zacahuil-huasteca-potosina zacahuil-papantla'.split())
photos = {}; audit = []; pending = []

def license_url(name: str, source: str) -> str:
    match=re.search(r'CC BY(-SA)?\s+(\d+\.\d+)',name)
    if match: return 'https://creativecommons.org/licenses/'+('by-sa' if match[1] else 'by')+'/'+match[2]+'/'
    if name.startswith('CC0'): return 'https://creativecommons.org/publicdomain/zero/1.0/'
    if name.startswith('Public domain'): return source+'#Licensing'
    raise ValueError('Unrecognized license: '+name)

for recipe in recipes:
    slug=recipe['slug']; assert re.fullmatch(r'[a-z0-9-]+',slug)
    before=old.get(slug); selection=selections.get(slug); crop=None
    if selection:
        dataset,index,*options=selection
        source_slug=options[0].get('sourceSlug',slug) if options else slug
        crop=options[0].get('crop') if options else None
        candidate=next(c for c in datasets[dataset][source_slug]['candidates'] if c['index']==index)
        file=(CACHE/dataset/candidate['path']).resolve()
        assert file.is_relative_to((CACHE/dataset/'candidates').resolve())
        if dataset=='flickr': assert candidate['primaryLicenseVerified'], 'Unverified source license'
        credit={k:candidate[k] for k in ['author','license','source']}
        credit['licenseUrl']=candidate.get('licenseUrl') or license_url(credit['license'],credit['source'])
        credit['provider']='Flickr' if dataset=='flickr' else 'Wikimedia Commons'
        source_title=candidate['title']; original_url=candidate['originalUrl']
        source_digest=candidate['sha256Original']
        status='replaced' if before else 'added'
    elif before and before['url'].startswith('/images/') and slug not in rejected:
        file=(ROOT/'public'/before['url'].lstrip('/')).resolve()
        assert file.is_relative_to((ROOT/'public/images').resolve()) and file.is_file()
        credit={k:before[k] for k in ['author','license','source']}
        credit['licenseUrl']=license_url(credit['license'],credit['source'])
        credit['provider']='Wikimedia Commons'
        source_title=before['source'].rsplit('/',1)[-1]; original_url=before['url']
        source_digest=hashlib.sha256(file.read_bytes()).hexdigest(); status='retained-optimized'
    else:
        pending.append({'slug':slug,'dishName':recipe['dishName'],'reason':'No visually verified, appropriately licensed photograph of the dish selected. Unrelated search results were rejected.'})
        continue
    for key in ['author','license','source','licenseUrl','provider']: assert credit[key]
    assert credit['source'].startswith('https://')
    assert re.match(r'^(CC BY(?:-SA)? [0-9]|CC0|Public domain)',credit['license'])
    body=file.read_bytes(); image=ImageOps.exif_transpose(Image.open(io.BytesIO(body))).convert('RGB'); image.load()
    if crop:
        left,top,right,bottom=crop
        assert 0<=left<right<=1 and 0<=top<bottom<=1
        image=image.crop((round(left*image.width),round(top*image.height),round(right*image.width),round(bottom*image.height)))
    assert min(image.size)>=150, (slug,image.size)
    image.thumbnail((1200,1200))
    full=OUT/(slug+'.webp')
    if selection and not crop and Image.open(file).size==image.size:
        full.write_bytes(body)
    else:
        image.save(full,'WEBP',quality=83,method=6)
    thumbnail=image.copy(); thumbnail.thumbnail((480,480)); small=OUT/(slug+'-480.webp');thumbnail.save(small,'WEBP',quality=78,method=6)
    photos[slug]={'url':'/images/recipes-v2/'+full.name,'thumbnailUrl':'/images/recipes-v2/'+small.name,
      'width':image.width,'height':image.height,'thumbnailWidth':thumbnail.width,'thumbnailHeight':thumbnail.height,**credit}
    audit.append({'slug':slug,'dishName':recipe['dishName'],'status':status,'title':source_title,
      'source':credit['source'],'author':credit['author'],'license':credit['license'],'licenseUrl':credit['licenseUrl'],
      'sourceImage':original_url,'sourceSha256':source_digest,'webpSha256':hashlib.sha256(full.read_bytes()).hexdigest(),
      'webpBytes':full.stat().st_size,'thumbnailBytes':small.stat().st_size,'crop':crop})
assert set(photos).isdisjoint(p['slug'] for p in pending)
assert len(photos)+len(pending)==len(recipes)==198
for slug,p in photos.items():
    for key,w,h in [('url','width','height'),('thumbnailUrl','thumbnailWidth','thumbnailHeight')]:
        file=ROOT/'public'/p[key].lstrip('/')
        with Image.open(file) as check:
            assert check.format=='WEBP'; check.load(); assert check.size==(p[w],p[h])
        assert file.stat().st_size<600_000, (slug,file.stat().st_size)
report={'date':'2026-09-20','baseCommit':BASE,'totalRecipes':198,'photoCount':len(photos),'pendingCount':len(pending),
        'counts':{s:sum(r['status']==s for r in audit) for s in ['added','replaced','retained-optimized']},
        'runtimeExternalImages':0,'notes':'Photographs illustrate dishes; serving styles and regional presentations can vary. Attribution does not imply endorsement. No recipe text, quantities, translations, IDs, routes or geography were changed.',
        'photos':audit,'pending':pending}
(ROOT/'src/data/recipe-photos.json').write_text(json.dumps(photos,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/recipe-photo-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
lines=['# Recipe photography — 2026-09-20','','## Published assets',f"- {len(photos)} recipes with local, decoded and visually reviewed photographs.",f"- {report['counts']['added']} new assignments; {report['counts']['replaced']} replacements; {report['counts']['retained-optimized']} retained photographs optimized.",'- Full images up to 1200 px and thumbnails up to 480 px, with no upscaling.','- Source URLs, authors, licenses and SHA-256 checksums are recorded in recipe-photo-audit.json.','- Original public assets are preserved. Candidate downloads are not needed to run or deploy the site.','','## Pending exact photographs',f'{len(pending)} dishes remain explicitly pending. Do not replace them with unrelated stock images.','']
lines += ['- '+p['dishName']+' (`'+p['slug']+'`)' for p in pending]
(ROOT/'docs/recipe-photography.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['photos','pending']},indent=2))
