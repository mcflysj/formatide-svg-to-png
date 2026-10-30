import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, '_site')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
// Explicitly publish only the demo and synthetic examples, never the repo root.
for (const name of ['index.html', 'styles.css', 'app.js', 'svg-to-png.js', 'favicon.svg', 'LICENSE']) {
  await cp(resolve(root, 'demo', name), resolve(output, name))
}
await mkdir(resolve(output, 'examples'))
for (const name of ['transparent-icon.svg', 'wide-banner.svg', 'viewbox-artwork.svg']) {
  await cp(resolve(root, 'examples', name), resolve(output, 'examples', name))
}
await writeFile(resolve(output, '.nojekyll'), '')
await writeFile(resolve(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://mcflysj.github.io/formatide-svg-to-png/</loc></url></urlset>\n')
const html = await readFile(resolve(output, 'index.html'), 'utf8')
if (!html.includes('https://mcflysj.github.io/formatide-svg-to-png/') || /noindex/.test(html)) throw new Error('Check demo canonical and indexing policy.')
console.log('Built GitHub Pages demo in _site/.')
