#!/usr/bin/env python3
"""Build image copies of original Moroccan Islamic Education public exam papers.
The images are presented onsite and are never altered or transcribed."""
import pathlib, requests, fitz
from PIL import Image
from urllib.parse import quote

EXAMS={
 "2021-specialty":991,
 "2021-didactics":992,
 "2022-specialty":2895,
 "2022-didactics":3667,
 "2023-specialty":3187,
 "2023-didactics":2189,
 "2025-specialty":1315,
 "2025-didactics":4663,
}
ROOT=pathlib.Path("tarbiya-islamia/images")
ROOT.mkdir(parents=True,exist_ok=True)
S=requests.Session()
S.headers.update({"User-Agent":"Mozilla/5.0 (compatible; Morocco Education Exam Archive/1.0)"})
total=0
for name,oid in EXAMS.items():
 urls=[
  f"https://www.wadifa-info.com/fr/modele-concours/{oid}/pdf",
  f"https://www.wadifa-info.com/نموذج-مباراة/{oid}/pdf",
  f"https://www.wadifa-info.com/fr/modele-concours/{oid}/",
 ]
 doc=None
 for url in urls:
  try:
   r=S.get(url,timeout=45)
   r.raise_for_status()
   if not r.content.startswith(b"%PDF"):raise ValueError(f"not PDF ({r.headers.get('Content-Type')})")
   doc=fitz.open(stream=r.content,filetype="pdf")
   print(name,"loaded",len(doc),"pages",url)
   break
  except Exception as e:print("retry",name,url,str(e)[:200])
 if doc is None:
  print("SKIPPED",name)
  continue
 for i,p in enumerate(doc):
  dest=ROOT/f"{name}-{i+1:02}.webp"
  if dest.exists():continue
  try:
   pix=p.get_pixmap(matrix=fitz.Matrix(1.42,1.42),alpha=False,colorspace=fitz.csRGB)
   im=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
   if im.width>1100:im=im.resize((1100,round(im.height*1100/im.width)),Image.Resampling.LANCZOS)
   im.save(dest,"WEBP",quality=76,method=5)
   total+=1
  except Exception as e:print("page failure",name,i,str(e)[:160])
 doc.close()
print("New pages",total,"Total",len(list(ROOT.glob("*.webp"))))
if not list(ROOT.glob("*.webp")):raise SystemExit("ERROR: no source images could be downloaded")
