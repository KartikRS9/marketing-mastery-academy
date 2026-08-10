import sys

with open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

out = []
i = 0
while i < len(text):
    if text[i:i+12] == '.innerHTML =':
        out.append('.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(')
        i += 12
        in_single = False
        in_double = False
        in_template = False
        parens = 0
        cur_expr = ''
        while i < len(text):
            char = text[i]
            if char == '\\':
                cur_expr += char + text[i+1]
                i += 2
                continue
                
            if not in_single and not in_double and not in_template:
                if char == "'": in_single = True
                elif char == '"': in_double = True
                elif char == '`': in_template = True
                elif char == '(': parens += 1
                elif char == ')': parens -= 1
                elif char == ';' and parens == 0:
                    out.append(cur_expr)
                    out.append(', { ADD_ATTR: [\'target\'] });')
                    i += 1
                    break
            else:
                if in_single and char == "'": in_single = False
                elif in_double and char == '"': in_double = False
                elif in_template and char == '`': in_template = False
            
            cur_expr += char
            i += 1
    else:
        out.append(text[i])
        i += 1

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(''.join(out))
