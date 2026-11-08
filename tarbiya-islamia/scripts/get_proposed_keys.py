#!/usr/bin/env python3
"""Extract only proposed answer letters, not copyright question text, with provenance."""
import re,json,pathlib,requests,bs4
URLS={
 "2025-specialty":"https://mesconcours.ma/ar/concours/enseignement/2025-651/",
 "2023-didactics":"https://mesconcours.ma/ar/concours/enseignement/2023-494/"
}
S=requests.Session();S.headers.update({"User-Agent":"Mozilla/5.0","Accept-Language":"ar,en;q=0.8"})
out={}
for name,url in URLS.items():
 try:
  r=S.get(url,timeout=40);r.raise_for_status()
  r.encoding="utf-8"
  soup=bs4.BeautifulSoup(r.text,"html.parser")
  for tag in soup(["script","style","noscript","header","footer","nav"]): tag.decompose()
  txt=soup.get_text("\n",strip=True)
  qs=re.findall(r"السؤال\s*(\d{1,3})",txt)
  print(name,"status",r.status_code,"HTML chars",len(r.text),"text chars",len(txt),"Q headings",len(qs),"answers",txt.count("الجواب الصحيح"),"title",soup.title.get_text(" ",strip=True) if soup.title else "?")
  if not qs:
   print("HTML first:",repr(r.text[:500]))
   print("TEXT first:",repr(txt[:1200]))
  a={}
  sections=list(re.finditer(r"السؤال\s*(\d{1,3})\b",txt))
  for i,m in enumerate(sections):
   q=int(m.group(1))
   if q<1 or q>200:continue
   body=txt[m.end():sections[i+1].start() if i+1<len(sections) else len(txt)]
   # The first instance may be in navigation; only keep spans containing answer annotations.
   result=re.search(r"(?:الجواب\s+الصحيح|الإجابة\s+الصحيحة|جواب\s+صحيح)\s*[:：\-]?\s*([ABCDE])\b",body,re.I)
   if result:a[q]=result.group(1).upper()
  if len(a)>=20:
   out[name]={"keys":{str(k):v for k,v in sorted(a.items())},"source":url,"status":"proposed_by_mesconcours_not_official"}
  print(name,"extracted",len(a),"Q1",a.get(1),"last",sorted(a)[-1] if a else None)
 except Exception as e: print("ERROR",name,str(e)[:400])
if out:
 p=pathlib.Path("tarbiya-islamia/proposed-keys.json")
 p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
else:
 print("No parseable keys; scoring remains unverified")
