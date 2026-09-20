"""Research only. Verify provider license and visually review before publishing."""
import hashlib, io, json, re, time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode, urlparse
from PIL import Image, ImageOps

OUT=Path('source-probe'); OUT.mkdir(exist_ok=True)
(OUT/'candidates').mkdir(exist_ok=True)
(OUT/'evidence').mkdir(exist_ok=True)
HOSTS={'api.openverse.org','www.flickr.com','flickr.com','live.staticflickr.com'}
UA='WorldBitesPhotoReview/1.0 (+https://github.com/jesusEMJ16/recetasmundiales)'

def get(url):
    if urlparse(url).hostname not in HOSTS or urlparse(url).scheme != 'https':
        raise ValueError('Unapproved source host')
    with urlopen(Request(url,headers={'User-Agent':UA}),timeout=18) as response:
        if urlparse(response.url).hostname not in HOSTS:
            raise ValueError('Unapproved redirect')
        body=response.read(12_000_001)
        if len(body)>12_000_000: raise ValueError('Response too large')
        return body

queries={
 'guacamayas-leon':'guacamaya torta',
 'coricos-de-mocorito':'coricos cookies',
 'pollo-de-san-marcos':'pollo adobo',
 'fiambre-estilo-san-miguel-de-allende':'fiambre',
 'gorditas-de-migajas-de-bernal':'gorditas Bernal',
 'naranjete-de-huasca-de-ocampo':'orange liqueur glass',
 'tatemado-de-puerco-estilo-comala':'pork adobo Mexico',
 'sopa-de-pan-coleta':'sopa pan Chiapas',
 'cafe-de-coatepec':'coffee Coatepec',
 'mole-xiqueno':'mole Xico',
 'ceviche-de-marlin-ahumado':'ceviche marlin',
 'churipo-purepecha':'churipo',
 'cortadillo-de-cuatro-cienegas':'carne guisada',
 'el-bote-de-mazamitla':'bote Mazamitla',
 'langosta-estilo-puerto-nuevo':'lobster Puerto Nuevo',
 'cecina-de-yecapixtla':'cecina Yecapixtla',
 'zacahuil-huasteca-potosina':'zacahuil',
 'green-chile-stew-nuevo-mexico':'green chile stew'
}
report={}
for slug,term in queries.items():
    rows=[]; errors=[]
    try:
        data=json.loads(get('https://api.openverse.org/v1/images/?'+urlencode({'q':term,'license':'by,by-sa,cc0,pdm','source':'flickr','page_size':8})))
        (OUT/(slug+'-search.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2))
        for result in data.get('results',[])[:4]:
            if result.get('license') not in {'by','by-sa','cc0','pdm'}: continue
            try:
                landing=result['foreign_landing_url']
                photo_id=landing.rstrip('/').split('/')[-1]
                source=get(landing).decode('utf-8','replace')
                (OUT/'evidence'/(photo_id+'.html')).write_text(source)
                links=set(re.findall(r'https?://creativecommons\.org/(?:licenses|publicdomain)/[^\s\"<>]+',source))
                expected=result['license_url'].replace('http:','https:').rstrip('/')
                verified=any(link.replace('http:','https:').rstrip('/')==expected for link in links)
                file_url=result['url']
                match=re.match(r'^(https://live\.staticflickr\.com/\d+/\d+_[a-zA-Z0-9]+)(?:_[a-z])?\.jpg$',file_url)
                larger=match[1]+'_b.jpg' if match else file_url
                try:
                    body=get(larger); used=larger
                    image=ImageOps.exif_transpose(Image.open(io.BytesIO(body))).convert('RGB'); image.load()
                except Exception:
                    body=get(file_url); used=file_url
                    image=ImageOps.exif_transpose(Image.open(io.BytesIO(body))).convert('RGB'); image.load()
                if min(image.size)<240: continue
                image.thumbnail((1200,1200))
                path=OUT/'candidates'/f'{slug}--{len(rows)+1}.webp'
                image.save(path,'WEBP',quality=84,method=6)
                rows.append({'index':len(rows)+1,'title':result['title'],'path':str(path.relative_to(OUT)),
                    'url':used,'originalUrl':file_url,'sha256Original':hashlib.sha256(body).hexdigest(),
                    'author':result['creator'],'license':('CC '+result['license'].upper()+' '+result.get('license_version','')).strip(),
                    'licenseUrl':result['license_url'],'source':landing,'provider':'Flickr','primaryLicenseVerified':verified,
                    'licenseEvidence':sorted(links),'width':image.width,'height':image.height,
                    'description':', '.join(t['name'] for t in result.get('tags',[]))})
            except Exception as error: errors.append(str(error))
    except Exception as error:
        errors.append(str(error))
        if '429' in str(error):
            report[slug]={'candidates':rows,'errors':errors}; break
    report[slug]={'candidates':rows,'errors':errors}
    (OUT/'candidates.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(slug,len(rows),errors,flush=True)
    time.sleep(2)
(OUT/'candidates.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
