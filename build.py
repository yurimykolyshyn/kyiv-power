# Builds index.html from the iso-glow gallery template + figure sources in src/.
#   python build.py                      -> index.html with every figure (tabs)
#   python build.py src/disco.js out.html "Title" bare   -> a single-figure page
import os, sys
ORDER = ['kyiv', 'disco', 'bar', 'bus', 'sea']
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.expanduser('~/.claude/skills/iso-glow/assets/gallery.html')
if len(sys.argv) > 1:
    figs, out, title, mode = sys.argv[1].split(','), sys.argv[2], sys.argv[3], (sys.argv[4] if len(sys.argv) > 4 else 'bare')
else:
    figs, out, title, mode = [os.path.join(here, 'src', f + '.js') for f in ORDER], os.path.join(here, 'index.html'), 'Ізометричні ігри', 'multi'
s = open(src, encoding='utf-8').read()
old = s[s.index('    --bg:#0c0d0e'):s.index('    --mono:')]
new = """    --bg:#0A0908; --panel:#0A0908; --edge:#2A2723;
    --line:#F6F1E7; --detail:#5D5A56; --body:#0E0D0B; --deck:#12110E;
    --ink:#A9A49B; --ink-hi:#F6F1E7; --live:#F6F1E7;
    --glass:#0C0B09; --glass-on:#21180A; --recess:#080706;
    --accent:#F0A628; --accent-hi:#F7C46A; --accent-dim:rgba(240,166,40,.12);
"""
for a, b in [('<title>Iso Figures</title>', f'<title>{title}</title>'), ('Iso figures</span>', f'{title}</span>'),
  (old, new), ('<html lang="en">', '<html lang="uk" data-theme="dark">'),
  ('  <footer class="made-with"><a href="https://iso-glow.vercel.app" target="_blank" rel="noopener">Made with ISO-GLOW ↗</a></footer>\n', ''),
  ("palette: 'ember', autoDemo: false, storageKey: 'iso-glow-accent'", "palette: [['PubBoard','#F0A628','#F7C46A','#F0A628','#F7C46A']], autoDemo: false, storageKey: 'iso-dark-accent'"),
  ('/* paste figure scripts here (see examples/) */', chr(10).join(open(f, encoding='utf-8').read() for f in figs))]:
    assert a in s, a[:60]; s = s.replace(a, b, 1)
s = s.replace('</style>', '''  .top .swatches, .top .arrows, .layout > nav { display:none !important; }
  .layout { grid-template-columns:minmax(0,1fr) !important; grid-template-areas:"fig" !important; }
  body { padding-bottom:16px; }
  .wrap { max-width:1480px !important; }   /* use the width of laptop screens */
  /* fit the whole plate in one screen: the svg letterboxes inside a height-capped holder */
  #stageHolder { aspect-ratio:auto; width:100%; height:clamp(220px, calc(100dvh - 216px - var(--navh, 0px)), 62vw); }
</style>''', 1)
if mode == 'multi':   # several figures: the nav comes back as a compact tab row above the plate
    s = s.replace('</style>', '''  :root { --navh: 56px; }
  .layout { grid-template-areas:"nav" "fig" !important; }
  .layout > nav { display:flex !important; gap:6px; padding:6px; border-radius:16px; overflow-x:auto; scrollbar-width:none; }
  .layout > nav button { flex:none; padding:8px 14px; }
</style>''', 1)
open(out, 'w', encoding='utf-8').write(s); print('wrote', out)
