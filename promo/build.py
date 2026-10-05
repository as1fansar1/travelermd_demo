"""Build promo.html: the built prototype plus the promo stage (stage.css, stage.js)."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda *p: open(os.path.join(HERE, *p), encoding='utf-8').read()
page = rd('..', 'prototype', 'index.html')
page = page.replace('</head>', f'<style>\n{rd("stage.css")}\n</style>\n</head>', 1)
page = page.replace('</body>', f'<script>\n{rd("stage.js")}\n</script>\n</body>', 1)
open(os.path.join(HERE, 'promo.html'), 'w', encoding='utf-8').write(page)
print('built promo.html')
