"""Generate the self-hosted atlas from Natural Earth. Requires shapely.
Usage: python scripts/build-geography.py countries50.geojson admin1.geojson legacy-places.json
Country membership: 193 UN member states + the Holy See and Palestine.
Existing place IDs and URLs must survive every generation.
"""
import json, sys, unicodedata, re
from pathlib import Path
from collections import defaultdict
from shapely.geometry import shape, mapping
from shapely import make_valid
from shapely.ops import unary_union
ROOT = Path(__file__).resolve().parents[1]
CODES = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW PS VA'.split()
assert len(set(CODES)) == 195
countries = json.loads(Path(sys.argv[1]).read_text())['features']
regions = json.loads(Path(sys.argv[2]).read_text())['features']
legacy = json.loads(Path(sys.argv[3]).read_text())
byid = {p['id']:p for p in legacy}
legacy_countries = {p['countryCode']:p for p in legacy if p['type']=='pais'}

def slug(s):
 return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def compact(x):
 if isinstance(x,float): return round(x,5)
 if isinstance(x,(list,tuple)): return [compact(y) for y in x]
 if isinstance(x,dict): return {k:compact(v) for k,v in x.items()}
 return x
def geometry(gs):
 g=unary_union([make_valid(shape(v)) for v in gs])
 return g.simplify(.035,preserve_topology=True)
def feature(g, props):
 rounded=compact(mapping(g))
 return {'type':'Feature','properties':props,'geometry':mapping(make_valid(shape(rounded)))}
def save(path, data):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')

# Keep existing country/region records intact; add geometry IDs to a separate index.
extra=[];catalog=[];world=[]
legacy_ids=set(byid)
region_aliases={
 'MX-DIF':'mx-cmx','JP-27':'jp-osk','JP-13':'jp-tky','TH-10':'th-bkk','TH-50':'th-cnx','GR-A1':'gr-att','PT-11':'pt-lis-reg',
 'IT:Campania':'it-cam','IT:Lazio':'it-laz','IT:Lombardia':'it-lom','IT:Veneto':'it-ven',
 'FR:Île-de-France':'fr-idf',"FR:Provence-Alpes-Côte-d'Azur":'fr-pac','FR:Bourgogne-Franche-Comté':'fr-bfc',
 'ES:Valenciana':'es-val','ES:Andalucía':'es-and','ES:País Vasco':'es-pv','ES:Islas Baleares':'es-bal',
}
for code in CODES:
 matches=[f for f in countries if f['properties']['ISO_A2_EH']==code]
 assert matches,code
 cp=matches[0]['properties'];g=geometry([f['geometry'] for f in matches]);center=g.representative_point()
 country=legacy_countries.get(code) or {'id':code.lower(),'type':'pais','name':cp.get('NAME_ES') or cp['ADMIN'],'slug':slug(cp.get('NAME_ES') or cp['ADMIN']) or code.lower(),'parentId':None,'countryCode':code,'lat':round(center.y,5),'lng':round(center.x,5)}
 if code not in legacy_countries: extra.append(country)
 # Most populous/main landmass gives a useful initial zoom for countries with
 # overseas territories or antimeridian-spanning islands. All shapes remain.
 parts=list(g.geoms) if g.geom_type=='MultiPolygon' else [g]
 main=max(parts,key=lambda p:p.area)
 if code in ['RU','FJ','NZ','KI','US']: bounds=main.bounds
 else:
  near=[p for p in parts if p.distance(main)<8]
  bounds=unary_union(near).bounds
 if code=='US':bounds=(-171,18,-66,72)
 world.append(feature(g,{'code':code}))
 groups=defaultdict(list)
 for f in regions:
  p=f['properties']
  if p['iso_a2']!=code or not p.get('name'):continue
  # NE includes an undivided placeholder for some microstates. It is not an
  # administrative region and must not be presented as an invented state.
  if '-X' in (p.get('iso_3166_2') or '') and p['name'] in [cp['ADMIN'],cp['NAME'],'Vatican','Monaco']:continue
  key=code+':'+p['region'] if code in ['IT','FR','ES'] and p.get('region') else p.get('iso_3166_2') or p['adm1_code']
  groups[key].append(f)
 region_ids=[];features=[]
 for key,fs in sorted(groups.items()):
  p=fs[0]['properties'];name=(p['region'] if ':' in key else p.get('name_es') or p['name'])
  id=region_aliases.get(key,key.lower())
  if id in byid: place=byid[id]
  else:
   candidates=[v for v in legacy if code not in ['MX','US'] and v['countryCode']==code and v['type'] in ['estado','region'] and slug(v['name']) in {slug(name),slug(p['name']),slug(p.get('name_en') or '')}]
   place=candidates[0] if len(candidates)==1 else None
   if place:id=place['id']
  rg=geometry([f['geometry'] for f in fs]);point=rg.representative_point()
  if not place:
   place={'id':id,'type':'estado','name':name,'slug':(slug(name) or slug(key))+'-'+slug(key),'parentId':country['id'],'countryCode':code,'lat':round(point.y,5),'lng':round(point.x,5)}
   if id not in legacy_ids:extra.append(place);legacy_ids.add(id)
  region_ids.append(id)
  features.append(feature(rg,{'id':id,'lat':round(point.y,5),'lng':round(point.x,5)}))
 for p in legacy:
  if p['parentId']==country['id'] and p['type'] in ['estado','region'] and p['id'] not in region_ids:region_ids.append(p['id'])
 save(ROOT/f'public/geo/regions/{code}.geojson',{'type':'FeatureCollection','features':features})
 catalog.append({'code':code,'id':country['id'],'bounds':[[round(bounds[1],5),round(bounds[0],5)],[round(bounds[3],5),round(bounds[2],5)]],'regions':region_ids})
 assert code!='MX' or len(region_ids)==32,region_ids
 assert code!='CA' or len(region_ids)==13,region_ids
# Supplemental ODbL geography for island states missing NE admin-1.
# Pass the directory containing KIR-regions.geojson and TUV-regions.geojson as arg 4.
if len(sys.argv)>4:
 from shapely.ops import transform
 for iso,code in [('KIR','KI'),('TUV','TV')]:
  row=next(c for c in catalog if c['code']==code)
  source=json.loads((Path(sys.argv[4])/(iso+'-regions.geojson')).read_text())
  features=[];row['regions']=[]
  for f in source['features']:
   p=f['properties'];id=p['shapeISO'].lower();g=make_valid(shape(f['geometry'])).simplify(.0005,preserve_topology=True)
   # Keep Kiribati's three island groups together across the date line.
   if code=='KI':g=transform(lambda x,y,z=None: (x+360 if x<0 else x,y),g)
   point=g.representative_point()
   extra.append({'id':id,'type':'estado','name':p['shapeName'],'slug':slug(p['shapeName'])+'-'+slug(id),'parentId':row['id'],'countryCode':code,'lat':round(point.y,5),'lng':round(point.x,5)})
   row['regions'].append(id);features.append(feature(g,{'id':id,'lat':round(point.y,5),'lng':round(point.x,5)}))
  if code=='KI':row['bounds']=[[-12,170],[5,212]]
  save(ROOT/f'public/geo/regions/{code}.geojson',{'type':'FeatureCollection','source':'geoBoundaries / OpenStreetMap contributors','license':'https://opendatacommons.org/licenses/odbl/1-0/','features':features})
save(ROOT/'src/data/places-world.json',extra)
save(ROOT/'src/data/world-atlas.json',catalog)
# Retain other land (e.g. Greenland) as context without inventing extra countries.
for f in countries:
 code=f['properties']['ISO_A2_EH']
 if code not in CODES and code!='AQ':world.append(feature(geometry([f['geometry']]),{'code':code,'selectable':False}))
save(ROOT/'public/geo/world-countries.geojson',{'type':'FeatureCollection','features':world})
print('Countries:',len(catalog),'Additional places:',len(extra),'Map regions:',sum(len(c['regions']) for c in catalog))
print('Regions per target:',{c['code']:len(c['regions']) for c in catalog if c['code'] in ['MX','US','CA']})
print('No subdivision geometry:',[c['code'] for c in catalog if not c['regions']])
