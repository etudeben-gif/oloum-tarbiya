#!/usr/bin/env python3
"""Read publicly published proposal key letters; do not copy question wording.
Require every key in a requested session to be found; never mislabel as official.
"""
import re,json,pathlib,requests,bs4
sources={
 "2024f":("https://mesconcours.ma/ar/concours/enseignement/2024/",54),
 "2025":("https://mesconcours.ma/ar/concours/enseignement/2025-584/",60)
}
S=requests.Session();S.headers.update({"User-Agent":"Mozilla/5.0","Accept-Language":"ar,en;q=0.8"})
out={}
for name,(url,n) in sources.items():
 try:
  r=S.get(url,timeout=45);r.raise_for_status();r.encoding="utf-8"
  soup=bs4.BeautifulSoup(r.text,"html.parser")
  for el in soup(["script","style","noscript","nav","footer","header"]):el.decompose()
  text=soup.get_text("\n",strip=True)
  headings=list(re.finditer(r"(?:السؤال|Question)\s*(\d{1,3})\b",text,re.I))
  keys={}
  for i,m in enumerate(headings):
   q=int(m.group(1))
   if q<61 or q>120:continue
   block=text[m.end():headings[i+1].start() if i+1<len(headings) else len(text)]
   found=re.search(r"(?:الجواب\s+الصحيح|الإجابة\s+الصحيحة|Bonne\s+réponse)\s*[:：-]?\s*([A-E])\b",block,re.I)
   if found:keys[q]=found.group(1).upper()
  print(name,"found",len(keys),"questions",sorted(keys)[:8],"last",sorted(keys)[-8:])
  selected={str(i):keys[i] for i in range(61,61+n) if i in keys}
  if len(selected)==n:
   out[name]={"keys":selected,"status":"proposed-not-official","source":url,"retrievedFrom":"MesConcours education-exam correction"}
  else:
   print("SKIP",name,"missing",sorted(set(range(61,61+n))-set(keys)))
 except Exception as e:print("Error",name,str(e)[:300])
if out:
 p=pathlib.Path("science-proposed-keys.json")
 p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
else:raise SystemExit("No complete key parsed, preserving previous content")
