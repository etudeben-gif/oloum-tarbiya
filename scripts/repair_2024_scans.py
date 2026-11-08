#!/usr/bin/env python3
"""Replace misfiled October 2024 scans using the 15-page original Arabic examination.
Do not create an April intro image when the source begins directly with questions.
Sources: public Google Drive references linked by WadifaPrepa's education-exam index.
Never reconstruct question text or use OCR.
"""
from pathlib import Path
import io
import requests
import fitz
from PIL import Image
import gdown

DOCS=[
  ("2024o","1GdA9JQYJdgoRxwpw14tKaPiMnn9YQJoQ",15),
]
out=Path("images");out.mkdir(exist_ok=True)
total=0
for session,fileid,expected in DOCS:
    url=f"https://drive.google.com/uc?id={fileid}"
    print("Retrieving",session,url)
    try:
        data=gdown.download(url,output=None,quiet=False)
        if not data:raise RuntimeError("gdown returned no file")
        pdf=fitz.open(data)
        print("source page count",len(pdf))
        if len(pdf)!=expected:raise ValueError(f"{session}: expected {expected} pages, got {len(pdf)}")
        pages=[(i,f"{session}-{i+1:02d}.webp") for i in range(15)]
        for i,name in pages:
            pix=pdf[i].get_pixmap(matrix=fitz.Matrix(1.45,1.45),alpha=False,colorspace=fitz.csRGB)
            im=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
            if im.width>1200:im=im.resize((1200,round(im.height*1200/im.width)),Image.Resampling.LANCZOS)
            dest=out/name
            im.save(dest,"WEBP",quality=77,method=5)
            print("wrote",dest,im.size,dest.stat().st_size)
            total+=1
    except Exception as err:
        print("ERROR",session,type(err).__name__,str(err))
print("new images",total)
if total<1:raise SystemExit("No images rendered; no changes to existing pages.")
