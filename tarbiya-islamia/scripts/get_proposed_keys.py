#!/usr/bin/env python3
"""Only extract QCM *answer letters*, no proprietary explanations; original question wording remains scanned."""
import re,json,pathlib,requests,bs4
URLS={"2025-specialty":"https://mesconcours.ma/ar/concours/enseignement/2025-651/",
      "2023-didactics":"https://mesconcours.ma/ar/concours/enseignement/2023-494/"}
out={};session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (compatible; Student revision tool; +https://github.com/etudeben-gif/oloum-tarbiya)"})
for name,url in URLS.items():
 try:
  r=session.get(url,timeout=30);r.raise_for_status()
  soup=bs4.BeautifulSoup(r.text,"html.parser")
  for x in soup(["script","style","noscript","header","footer","nav"]):x.decompose()
  text=soup.get_text("\n",strip=True)
  pat=r"(?:السؤال\s*(\d{1,3}))(?!\d)([\s\S]*?)(?=السؤال\s*\d{1,3}|$)"
  keys={}
  for m in re.finditer(pat,text):
   b=re.search(r"الجواب\s+الصحيح\s*[:：]\s*([ABCDE])",m.group(2))
   if b:keys[int(m.group(1))]=b.group(1)
  if len(keys)>=20:
   out[name]={"keys":keys,"source":url,"status":"proposed"}
  print(name,"answers parsed",len(keys))
 except Exception as e:print("Source error",name,str(e)[:300])
if out:
 file=pathlib.Path("tarbiya-islamia/proposed-keys.json")
 file.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
else:
 print("No reliable corrections parsed; leaving existing keys unchanged")
