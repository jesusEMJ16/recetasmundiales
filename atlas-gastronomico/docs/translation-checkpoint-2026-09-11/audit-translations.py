import json,pathlib,re,collections,sys
p=pathlib.Path('/workspace/scratch/0d37ed7b267c/recetasmundiales/atlas-gastronomico/src/i18n/content')
en=json.loads((p/'recipes-en.json').read_text()); report={}
num=lambda s:sorted(re.findall(r'\d+(?:[.,]\d+)?',s.replace(',','.')))
for locale in ['zh','hi','fr','ar','bn','pt','ru','ur','id','ja']:
 f=p/f'recipes-{locale}.json'
 if not f.exists():report[locale]={'count':0};continue
 try:d=json.loads(f.read_text())
 except Exception as e:report[locale]={'parse_error':str(e)};continue
 errors=[]
 for rid,t in d.items():
  if rid not in en:errors.append([rid,'unknown ID']);continue
  base=en[rid]
  for k in ['dishName','summary','history','ingredients','steps','tips','sources']:
   if k not in t:errors.append([rid,k,'missing']);continue
   if isinstance(base[k],list):
    if len(t[k])!=len(base[k]):errors.append([rid,k,'length'])
    if k=='sources' and t[k]!=base[k]:errors.append([rid,k,'changed provenance'])
    if k in ['ingredients','steps','tips']:
     for i,(a,b) in enumerate(zip(base[k],t[k])):
      if not isinstance(b,str) or not b.strip():errors.append([rid,k,i,'empty']);continue
      if num(a)!=num(b):errors.append([rid,k,i,'numbers',num(a),num(b)])
   elif not isinstance(t[k],str) or not t[k].strip():errors.append([rid,k,'empty'])
 report[locale]={'count':len(d),'missing':len(set(en)-set(d)),'errors':errors}
print(json.dumps(report,ensure_ascii=False,indent=2))
