"""Read-only source discovery. Not part of the application or its build."""
import html, io, json, re, time, hashlib
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode, urlparse
from PIL import Image, ImageOps
OUT=Path('specific-candidates'); OUT.mkdir(exist_ok=True); (OUT/'candidates').mkdir(exist_ok=True)
HOSTS={'commons.wikimedia.org','upload.wikimedia.org','thumb.wikimedia.org'}
UA='WorldBitesPhotoReview/1.0 (+https://github.com/jesusEMJ16/recetasmundiales)'
def get(url):
    if urlparse(url).hostname not in HOSTS or urlparse(url).scheme!='https': raise ValueError('Unapproved host')
    with urlopen(Request(url,headers={'User-Agent':UA}),timeout=20) as response:
        if urlparse(response.url).hostname not in HOSTS: raise ValueError('Unapproved redirect')
        data=response.read(20_000_001)
        if len(data)>20_000_000: raise ValueError('Response too large')
        return data
def clean(value): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]*>',' ',value))).strip()
queries={
 'coricos-de-mocorito':['File:Productos regionales de Sonora 16.jpg','intitle:coricos'],
 'tortilla-espanola':['intitle:"Tortilla de patatas" -intitle:bocadillo'],
 'moussaka':['File:Moussaka.jpg'],
 'risotto-alla-milanese':['intitle:"Risotto alla milanese" -intitle:ossobuco'],
 'pollo-de-san-marcos':['intitle:"pollo" intitle:"adobo"','intitle:"pollo" intitle:"San Marcos"'],
 'cortadillo-de-cuatro-cienegas':['intitle:cortadillo','intitle:"carne guisada"'],
 'ceviche-de-marlin-ahumado':['intitle:marlin intitle:ceviche','intitle:"marlin" intitle:"ahumado"'],
 'fiambre-estilo-san-miguel-de-allende':['intitle:fiambre intitle:mexico','intitle:fiambre intitle:Miguel'],
 'lengua-mechada-de-tequisquiapan':['intitle:lengua intitle:mechada','intitle:lengua intitle:salsa'],
 'naranjete-de-huasca-de-ocampo':['intitle:naranjete'],
 'tatemado-de-puerco-estilo-comala':['intitle:tatemado'],
 'sopa-de-pan-coleta':['intitle:"sopa de pan" intitle:Chiapas','intitle:"sopa de pan" intitle:coleta'],
 'comiteco':['intitle:comiteco -intitle:.JPG'],
 'sidra-de-manzana-zacatlan':['intitle:cider intitle:glass'],
 'cafe-de-coatepec':['intitle:"black coffee"'],
 'mole-xiqueno':['intitle:"mole" intitle:Xico','intitle:"mole xiqueño"'],
 'pampano-en-escabeche-palizada':['intitle:"pámpano"','intitle:pompano intitle:escabeche'],
 'cecina-de-yecapixtla':['intitle:cecina intitle:Yecapixtla','intitle:cecina intitle:Mexicana'],
 'pan-de-pulque-de-saltillo':['intitle:"pan de pulque"'],
 'churipo-purepecha':['intitle:churipo'],
 'cangrejo-real-alaska':['intitle:"king crab legs"']
}
report={}
for slug,terms in queries.items():
    rows=[]; errors=[]; seen=set()
    for term in terms:
        try:
            params={'action':'query','format':'json','prop':'imageinfo','iiprop':'url|size|mime|extmetadata','iiurlwidth':1200,'maxlag':5}
            if term.startswith('File:'): params['titles']=term
            else: params.update({'generator':'search','gsrsearch':term+' filetype:bitmap','gsrnamespace':6,'gsrlimit':5})
            data=json.loads(get('https://commons.wikimedia.org/w/api.php?'+urlencode(params)))
            for page in sorted(data.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',999)):
                if page['title'] in seen or not page.get('imageinfo'):continue
                seen.add(page['title']); info=page['imageinfo'][0]; meta=info.get('extmetadata',{}); val=lambda key:clean(meta.get(key,{}).get('value',''))
                lic=val('LicenseShortName')
                if info.get('mime') not in {'image/jpeg','image/png','image/webp'} or min(info.get('width',0),info.get('height',0))<300:continue
                if not re.match(r'^(CC BY(?:-SA)? [0-9]|CC0|Public domain)',lic) or not val('Artist'):continue
                try:
                    url=info.get('thumburl',info['url']); body=get(url)
                    image=ImageOps.exif_transpose(Image.open(io.BytesIO(body))).convert('RGB');image.load();image.thumbnail((1200,1200))
                    path=OUT/'candidates'/f'{slug}--{len(rows)+1}.webp';image.save(path,'WEBP',quality=84,method=6)
                    rows.append({'index':len(rows)+1,'title':page['title'],'path':str(path.relative_to(OUT)),'url':url,'originalUrl':info['url'],'sha256Original':hashlib.sha256(body).hexdigest(),'author':val('Artist'),'license':lic,'licenseUrl':val('LicenseUrl'),'source':info['descriptionurl'],'description':val('ImageDescription')[:2000],'width':image.width,'height':image.height})
                except Exception as error:errors.append(str(error))
                if len(rows)>=4:break
            if len(rows)>=4:break
        except Exception as error:errors.append(str(error))
        time.sleep(.5)
    report[slug]={'candidates':rows,'errors':errors};(OUT/'candidates.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(slug,len(rows),errors,flush=True)
