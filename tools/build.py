# Rebuilds data/bliss.json from the official BCI-AV downloads.
# Usage: python3 tools/build.py <folder of bliss_svg_id svgs> <BCI-AV derivations .xls> data/bliss.json
# Needs: pip install pandas xlrd
import sys, re, json, os
import xml.etree.ElementTree as ET
import pandas as pd
SVGDIR, XLS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
NS='{http://www.w3.org/2000/svg}'
def r(v):
    f=round(float(v),1)
    return str(int(f)) if f==int(f) else str(f)
def fmt_d(d):
    return re.sub(r'-?\d+\.\d+|-?\d+', lambda m: r(m.group()), d)
def scale_d(d, k):
    # scale an SVG path by k; arc rotation and flags are left alone
    out=[]; cmd=None; i=0
    for tok in re.findall(r'[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?', d):
        if tok.isalpha():
            cmd=tok.upper(); i=0; out.append(tok); continue
        v=float(tok)
        if cmd=='A': v = v*k if (i % 7) in (0,1,5,6) else v
        else: v*=k
        out.append(repr(round(v,3))); i+=1
    return ' '.join(out)
def parse_style(txt):
    st={}
    for m in re.finditer(r'\.(\w+)\s*\{([^}]*)\}', txt):
        st[m.group(1)]=dict(kv.split(':',1) for kv in [x.strip() for x in m.group(2).split(';')] if ':' in kv)
        st[m.group(1)]={k.strip():v.strip() for k,v in st[m.group(1)].items()}
    return st
def conv(path):
    t=ET.parse(path); root=t.getroot()
    vb=[float(x) for x in root.get('viewBox').split()]
    st={}
    for s in root.iter(NS+'style'): st=parse_style(s.text or '')
    sw=st.get('pen1',{}).get('stroke-width','7')
    # a few newer files use a 2x frame (644 high instead of 324): bring them back to the common frame
    k = 0.5 if round(vb[3])==644 else (324/vb[3] if vb[3] else 1)
    if abs(k-1)>1e-6:
        sw=str(float(sw)*k); vb=[v*k for v in vb]
        for el in root.iter():
            for a in ('x1','y1','x2','y2','cx','cy','r','rx','ry','x','y'):
                if el.get(a) is not None: el.set(a, str(float(el.get(a))*k))
            if el.get('d'): el.set('d', scale_d(el.get('d'), k))
        for c in st.values():
            if 'font-size' in c: c['font-size']=str(float(c['font-size'].replace('px',''))*k)+'px'
    G={'b':([],[]),'t':([],[])}; ys=[]
    def grp(yl): return 't' if max(yl)<=104 else 'b'
    for el in root.iter():
        tag=el.tag.replace(NS,'')
        if tag=='line':
            x1,y1,x2,y2=[el.get(k) for k in ('x1','y1','x2','y2')]
            G[grp([float(y1),float(y2)])][0].append(f'M{r(x1)} {r(y1)}L{r(x2)} {r(y2)}'); ys+= [float(y1),float(y2)]
        elif tag=='path':
            dd=fmt_d(el.get('d')).replace(' ,',',')
            dd=re.sub(r'\s*([MLAC])\s*',r'\1',dd).replace(',',' ')
            yl=[float(y) for y in re.findall(r'[MLA ]-?[\d.]+ (-?[\d.]+)',dd)] or [999]
            G[grp(yl)][0].append(dd); ys+=yl
        elif tag=='circle':
            cx,cy,rr=el.get('cx'),el.get('cy'),el.get('r')
            G[grp([float(cy)+float(rr)])][1].append(f'<circle cx="{r(cx)}" cy="{r(cy)}" r="{r(rr)}"/>'); ys+=[float(cy)-float(rr),float(cy)+float(rr)]
        elif tag=='ellipse':
            cx,cy,rx=el.get('cx'),el.get('cy'),el.get('rx')
            G[grp([float(cy)])][1].append(f'<circle cx="{r(cx)}" cy="{r(cy)}" r="{r(rx)}" fill="#000"/>'); ys+=[float(cy)]
        elif tag=='text':
            cls=el.get('class','').split()
            f={}
            for c in cls: f.update(st.get(c,{}))
            size=f.get('font-size','16px').replace('px','')
            fam='Arial,sans-serif' if 'Arial' in f.get('font-family','') else 'sans-serif'
            wt=' font-weight="bold"' if f.get('font-weight')=='bold' else ''
            txt=(el.text or '').replace('&','&amp;').replace('<','&lt;')
            G['b'][1].append(f'<text x="{r(el.get("x"))}" y="{r(el.get("y"))}" font-size="{size}" font-family="{fam}"{wt} fill="#000" stroke="none">{txt}</text>')
            ys+=[float(el.get('y'))]
    mk=lambda g:(f'<path d="{"".join(g[0])}"/>' if g[0] else '')+''.join(g[1])
    return {'w':int(vb[2]),'sw':int(float(sw)),'b':mk(G['b']),'t':mk(G['t']),'ymin':min(ys) if ys else 0}
df=pd.read_excel(XLS)
df=df.iloc[:,[0,1,2,3]]; df.columns=['id','en','pos','der']
df=df.dropna(subset=['id'])
out=[]; miss=0; ymins={}
for _,row in df.iterrows():
    i=int(row.id); p=os.path.join(SVGDIR,f'{i}.svg')
    if not os.path.exists(p): miss+=1; continue
    s=conv(p)
    pos=str(row.pos).strip().upper().replace('GREY','GRAY')
    der=str(row.der) if isinstance(row.der,str) else ''
    out.append({'id':i,'en':str(row.en).strip(),'pos':pos,'der':re.sub(r'\s+',' ',der).strip(),'w':s['w'],'sw':s['sw'],'svg':s['b'],'top':s['t']})
    ymins[i]=s['ymin']
    o=out[-1]
    if o['en'].startswith('indicator_') or 'indicator' not in o['der'].lower():
        o['svg']=o['svg']+o['top']; o['top']=''
    if not o['top']: del o['top']
    else:
        xs=[float(x) for x in re.findall(r'[ML](-?[\d.]+) ',o['top'])]+[float(x) for x in re.findall(r'cx="(-?[\d.]+)"',o['top'])]
        o['tx']=round((min(xs)+max(xs))/2,1) if xs else o['w']/2
json.dump(out,open(OUT,'w'),ensure_ascii=False,separators=(',',':'))
print('entries',len(out),'missing',miss, 'bytes',os.path.getsize(OUT))
import collections
tops=[o for o in out if o.get('top') and 'indicator' not in o['der'].lower()]
print('top w/o indicator mention',len(tops),[ (o['id'],o['en']) for o in tops[:25]])
#print(collections.Counter(int(v//16*16) for v in ymins.values()).most_common(12))
