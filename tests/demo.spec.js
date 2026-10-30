import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('sample exports a genuine PNG and changing settings invalidates the download', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 1120 })
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('Sample ready')
  await page.getByRole('spinbutton', { name: 'Width', exact: true }).fill('512')
  await page.getByRole('spinbutton', { name: 'Height', exact: true }).fill('512')
  await page.getByRole('button', { name: 'Convert to PNG' }).click()
  await expect(page.getByRole('status')).toContainText('PNG ready')
  const event = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Download PNG' }).click()
  const download = await event
  expect(download.suggestedFilename()).toBe('formatide-demo-512x512.png')
  const data = await readFile(await download.path())
  expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect([data.readUInt32BE(16), data.readUInt32BE(20)]).toEqual([512, 512])
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: testInfo.outputPath('demo-desktop.png') })
  await page.getByRole('spinbutton', { name: 'Width', exact: true }).fill('256')
  await expect(page.getByRole('link', { name: 'Download PNG' })).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByRole('img', { name: 'Converted PNG preview' })).toBeHidden()
})

test('all examples convert and the module preserves transparency, background and aspect ratio', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('Sample ready')
  const result = await page.evaluate(async () => {
    const { svgToPng } = await import('./svg-to-png.js')
    const output = []
    for (const name of ['transparent-icon.svg', 'wide-banner.svg', 'viewbox-artwork.svg']) {
      const source = await (await fetch(`./examples/${name}`)).text()
      const blob = await svgToPng(source, { width: 512, height: 512 })
      output.push(blob.type === 'image/png' && blob.size > 0)
    }
    const source = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="#ff0000"/></svg>'
    const pixels = []
    for (const background of ['transparent', '#ffffff']) {
      const blob = await svgToPng(source, { width: 100, height: 100, background })
      const url = URL.createObjectURL(blob)
      const img = new Image(); img.src = url; await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 100
      const context = canvas.getContext('2d'); context.drawImage(img, 0, 0)
      pixels.push([...context.getImageData(0, 0, 1, 1).data], [...context.getImageData(50, 50, 1, 1).data])
      URL.revokeObjectURL(url)
    }
    return { output, pixels }
  })
  expect(result.output).toEqual([true, true, true])
  expect(result.pixels).toEqual([[0, 0, 0, 0], [255, 0, 0, 255], [255, 255, 255, 255], [255, 0, 0, 255]])
})

test('local file conversion makes no external requests and rejects unsupported input', async ({ page, baseURL }) => {
  const external = []
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(baseURL).origin && !request.url().startsWith('blob:')) external.push(request.url()) })
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('Sample ready')
  await page.locator('#file').setInputFiles({ name: 'local.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><rect width="64" height="32" fill="#008080"/></svg>') })
  await expect(page.getByRole('status')).toContainText('File loaded locally')
  await page.getByRole('button', { name: 'Convert to PNG' }).click()
  await expect(page.getByRole('status')).toContainText('PNG ready')
  const checks = await page.evaluate(async () => {
    const { prepareSvg, svgToPng } = await import('./svg-to-png.js')
    const contents = [
      '<script>alert(1)</script>', '<image href="https://example.com/private.svg"/>',
      '<rect width="1" height="1" onload="alert(1)"/>', '<style>rect{fill:red}</style>',
      '<use href="#loop" id="loop"/>', '<rect width="1" height="1" fill="url(https://example.com/image)"/>',
      '<defs><clipPath id="clip"><g clip-path="url(#clip)"><rect width="1" height="1"/></g></clipPath></defs>',
    ]
    const rejected = contents.map(body => { try { prepareSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">${body}</svg>`); return false } catch { return true } })
    try { await svgToPng('<svg/>', { width: 9999, height: 1 }); rejected.push(false) } catch { rejected.push(true) }
    return rejected
  })
  expect(checks).toEqual(Array(8).fill(true))
  await page.getByText('Inspect or edit the SVG source').click()
  await page.getByRole('textbox', { name: 'SVG source' }).fill('<svg>')
  await page.getByRole('button', { name: 'Convert to PNG' }).click()
  await expect(page.getByRole('status')).toContainText('valid SVG')
  await expect(page.getByRole('link', { name: 'Download PNG' })).toHaveAttribute('aria-disabled', 'true')
  expect(external).toEqual([])
})

test('mobile layout, static metadata and links work from a project subpath', async ({ page, request }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('Sample ready')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://mcflysj.github.io/formatide-svg-to-png/')
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'index,follow')
  expect(await page.locator('.tool-links a').count()).toBe(13)
  const root = await request.get('./')
  expect(root.status()).toBe(200)
  expect(await root.text()).toContain('SVG to PNG in JavaScript.')
  const sitemap = await request.get('sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain('https://mcflysj.github.io/formatide-svg-to-png/')
  await page.getByRole('button', { name: 'Convert to PNG' }).click()
  await expect(page.getByRole('status')).toContainText('PNG ready')
  await page.screenshot({ path: testInfo.outputPath('demo-mobile.png'), fullPage: true })
})
