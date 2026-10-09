import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'public/assets/chongxi-seal.otf')
copy = ''.join(json.loads((root / 'test-results/copy.json').read_text(encoding='utf-8'))) + ''.join(json.loads((root / 'test-results/source-copy.json').read_text(encoding='utf-8')))
characters = sorted(set(c for c in copy if '\u3400' <= c <= '\u9fff'))
cmap = font.getBestCmap()
missing = ''.join(c for c in characters if ord(c) not in cmap)
report = {'font': 'Chongxi Seal', 'chineseCharacters': len(characters), 'missing': missing, 'fontUnmodified': (root / 'public/assets/chongxi-seal.otf').read_bytes() == (root / 'design/chongxi-font/chongxi_seal.otf').read_bytes()}
(root / 'test-results/font-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
assert not missing, f'Small-seal glyphs missing: {missing}'
assert report['fontUnmodified']
