"""
Extract all text content AND embedded images from DOCX chapter files.
Saves images to images/textbook/chX/ and prints full text content.
"""
import os, zipfile, shutil
from pathlib import Path

DOCX_FILES = [
    (r"D:\mktg books\Chapter_1_Marketing_Creating_Customer_Value.docx", 1),
    (r"D:\mktg books\Chapter_2_Company_and_Marketing_Strategy.docx", 2),
    (r"D:\mktg books\Chapter_3_Analyzing_the_Marketing_Environment.docx", 3),
]

OUTPUT_BASE = r"d:\marketing masterclass\images\textbook"

try:
    from docx import Document
    USE_DOCX = True
except ImportError:
    USE_DOCX = False
    print("[INFO] python-docx not installed, using ZIP extraction for images only")

for (docx_path, ch_num) in DOCX_FILES:
    print(f"\n{'='*60}")
    print(f"CHAPTER {ch_num}: {Path(docx_path).name}")
    print(f"{'='*60}")

    out_dir = os.path.join(OUTPUT_BASE, f"ch{ch_num}")
    os.makedirs(out_dir, exist_ok=True)

    # --- Extract embedded images using ZIP method (always works) ---
    with zipfile.ZipFile(docx_path, 'r') as z:
        media_files = [f for f in z.namelist() if f.startswith('word/media/')]
        print(f"\n[IMAGES] Found {len(media_files)} embedded images:")
        for mf in media_files:
            fname = os.path.basename(mf)
            out_path = os.path.join(out_dir, fname)
            with z.open(mf) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
            size_kb = os.path.getsize(out_path) // 1024
            print(f"  Saved: {fname} ({size_kb}KB)")

    # --- Extract text content using python-docx if available ---
    if USE_DOCX:
        doc = Document(docx_path)
        print(f"\n[TEXT] Extracting paragraphs...")
        for i, para in enumerate(doc.paragraphs[:80]):  # first 80 paragraphs
            if para.text.strip():
                style = para.style.name
                prefix = ""
                if "Heading 1" in style:
                    prefix = "# "
                elif "Heading 2" in style:
                    prefix = "## "
                elif "Heading 3" in style:
                    prefix = "### "
                print(f"  {prefix}{para.text.strip()}")

print("\n\n=== EXTRACTION COMPLETE ===")
print(f"All images saved to: {OUTPUT_BASE}")
print("Install python-docx for text extraction: pip install python-docx")
