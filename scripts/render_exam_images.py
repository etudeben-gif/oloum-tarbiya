#!/usr/bin/env python3
"""Build web-friendly page images from freely published PDF exam scans.

This runs only in GitHub Actions; failures are reported but do not remove
existing images. No guessed answers are generated.
"""
from pathlib import Path
import io
import requests
import fitz
from PIL import Image

EXAMS = {
 "2022": 1440,
 "2023": 2193,
 "2024f": 4956,
 "2024a": 2068,
 "2024o": 4912,
 "2025": 2166,
}
BASE="https://www.wadifa-info.com"
out=Path("images")
out.mkdir(exist_ok=True)
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (compatible; EducationalArchive/1.0)",
"Accept":"application/pdf,text/html;q=0.8,*/*;q=0.5"})

total=0
for name, model_id in EXAMS.items():
    urls=[f"{BASE}/نموذج-مباراة/{model_id}/pdf",
          f"{BASE}/fr/modele-concours/{model_id}/pdf"]
    pdf=None
    for url in urls:
        try:
            r=session.get(url,timeout=45,allow_redirects=True)
            r.raise_for_status()
            pdf=fitz.open(stream=r.content,filetype="pdf")
            if len(pdf)<2:
                raise ValueError("PDF has too few pages")
            print(f"{name}: loaded {len(pdf)} pages from {url}")
            break
        except Exception as exc:
            print(f"{name}: cannot download from {url}: {exc}")
            pdf=None
    if pdf is None:
        continue
    for pageidx,page in enumerate(pdf):
        filename=out/f"{name}-{pageidx+1:02d}.webp"
        if filename.exists():continue
        try:
            pix=page.get_pixmap(matrix=fitz.Matrix(1.3,1.3),alpha=False,colorspace=fitz.csRGB)
            im=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
            if im.width>1250:
                new_height=round(im.height*(1250/im.width))
                im=im.resize((1250,new_height),Image.Resampling.LANCZOS)
            im.save(filename,format="WEBP",quality=73,method=5)
            total+=1
        except Exception as exc:
            print(f"Skipping page {name}/{pageidx+1}: {exc}")
    pdf.close()
print("Generated",total,"images; total images:",len(list(out.glob("*.webp"))))
