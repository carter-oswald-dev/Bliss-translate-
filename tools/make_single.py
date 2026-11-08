# Builds bliss-narrower.html: one self-contained file (styles, code and all symbol data inline).
# It works offline from file:// with no server.  Usage: python3 tools/make_single.py
import os, re, json
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html, css, js = rd('index.html'), rd('style.css'), rd('app.js')
data = json.dumps(json.loads(rd('data/bliss.json')), ensure_ascii=False, separators=(',', ':'))
data = data.replace('</', '<\\/')          # keep "</script>" from ending the block early
js = js.replace('</script', '<\\/script')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="app.js"></script>',
    '<script type="application/json" id="bliss-data">' + data + '</script>\n<script>\n' + js + '\n</script>')
html = html.replace('run a small local server instead (see README)', 'make sure the file downloaded completely')
out = os.path.join(root, 'bliss-narrower.html')
open(out, 'w', encoding='utf-8').write(html)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB')
