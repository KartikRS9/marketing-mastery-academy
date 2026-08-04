from pypdf import PdfReader
import re

reader = PdfReader(r'D:\mktg books\Kotler-and-Armstrong-Principles-of-Marketing.pdf')
total_pages = len(reader.pages)
print(f"Scanning {total_pages} pages for figures...")

figure_refs = {}
for i in range(total_pages):
    text = reader.pages[i].extract_text()
    if text:
        matches = re.findall(r'(Figure \d+\.\d+[\s\|\:][^\n]{5,120})', text, re.IGNORECASE)
        for m in matches:
            clean = m.strip()
            fig_num_match = re.match(r'(Figure \d+\.\d+)', clean, re.IGNORECASE)
            if fig_num_match:
                key = fig_num_match.group(0)
                if key not in figure_refs:
                    figure_refs[key] = {'page': i+1, 'desc': clean[:100]}

print("\n=== ALL FIGURES FOUND IN TEXTBOOK ===")
for k in sorted(figure_refs.keys(), key=lambda x: [int(n) for n in re.findall(r'\d+', x)]):
    v = figure_refs[k]
    print(f"{k} | Page {v['page']} | {v['desc']}")

print(f"\nTotal figures found: {len(figure_refs)}")
