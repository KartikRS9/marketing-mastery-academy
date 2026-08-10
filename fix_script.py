import sys

with open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(')
out = [parts[0]]

for part in parts[1:]:
    idx = part.find(", { ADD_ATTR: ['target'] });")
    if idx != -1:
        expr = part[:idx]
        rest = part[idx + len(", { ADD_ATTR: ['target'] });"):]
        out.append('.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(' + expr + ", { ADD_ATTR: ['target'] }) : (" + expr + ");" + rest)
    else:
        out.append('.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(' + part)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(''.join(out))
