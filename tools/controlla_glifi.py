#!/usr/bin/env python3
"""Controlla che ogni carattere scritto nei testi del gioco esista in tutti i font usati (Rye, Nunito, Josefin).
Così sulla TV e sui telefoni non compaiono mai quadratini al posto dei simboli.
Uso: python3 tools/controlla_glifi.py   (serve fontTools e brotli: pip install fonttools brotli)"""
import glob, os, sys
from fontTools.ttLib import TTFont

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = {f: set(TTFont(os.path.join(RADICE, 'font', f)).getBestCmap()) for f in ('Rye.woff2', 'Nunito.woff2', 'JosefinSans.woff2')}
file = [f for f in glob.glob(os.path.join(RADICE, 'js', '*.js'))] + [os.path.join(RADICE, 'index.html')]
caratteri = {}
for f in file:
    for i, riga in enumerate(open(f, encoding='utf-8'), 1):
        for ch in riga:
            if ord(ch) < 32 or ch in '\n\t':
                continue
            caratteri.setdefault(ch, f'{os.path.basename(f)}:{i}')
mancano = []
for ch, dove in sorted(caratteri.items()):
    for nome, cmap in FONT.items():
        if ord(ch) not in cmap:
            mancano.append(f'  {ch!r} U+{ord(ch):04X} manca in {nome} (es. {dove})')
if mancano:
    print('Caratteri senza glifo:\n' + '\n'.join(mancano))
    sys.exit(1)
print(f'Tutti i {len(caratteri)} caratteri usati esistono nei 3 font.')
