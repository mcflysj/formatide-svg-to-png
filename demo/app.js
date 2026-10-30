import { prepareSvg, svgToPng, LIMITS } from './svg-to-png.js'

const $ = selector => document.querySelector(selector)
const source = $('#source')
const status = $('#status')
const download = $('#download')
const preview = $('#preview')
let resultUrl
let revision = 0

function invalidate() {
  revision++
  if (resultUrl) URL.revokeObjectURL(resultUrl)
  resultUrl = undefined
  download.removeAttribute('href')
  download.setAttribute('aria-disabled', 'true')
  download.tabIndex = -1
  preview.removeAttribute('src')
  preview.hidden = true
  $('#placeholder').hidden = false
  $('#result-size').textContent = 'Your PNG will appear here'
  status.textContent = 'Ready when you are. Choose your canvas, then convert.'
}

async function loadSample() {
  const token = revision + 1
  invalidate()
  status.textContent = 'Loading sample…'
  try {
    const response = await fetch(`./examples/${$('#sample').value}`)
    if (!response.ok) throw new Error('The sample could not load. Reload the page and try again.')
    const text = await response.text()
    if (token !== revision) return
    source.value = text
    const size = prepareSvg(text)
    $('#width').value = Math.min(LIMITS.maxSide, Math.round(size.width))
    $('#height').value = Math.min(LIMITS.maxSide, Math.round(size.height))
    status.textContent = 'Sample ready. Convert it to create a downloadable PNG.'
  } catch (error) { if (token === revision) status.textContent = error.message }
}

$('#sample').addEventListener('change', loadSample)
for (const selector of ['#source', '#width', '#height', '#background', '#color']) $(selector).addEventListener('input', () => {
  invalidate()
  $('#color').disabled = $('#background').value !== 'color'
})
$('#file').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return
  invalidate()
  const token = revision
  try {
    if (file.size > LIMITS.inputBytes) throw new Error('Choose an SVG up to 64 KiB for this demo.')
    const text = await file.text()
    if (token !== revision) return
    const size = prepareSvg(text)
    source.value = text
    $('#width').value = Math.min(LIMITS.maxSide, Math.round(size.width))
    $('#height').value = Math.min(LIMITS.maxSide, Math.round(size.height))
    status.textContent = 'File loaded locally. Choose your canvas and convert.'
  } catch (error) { if (token === revision) status.textContent = error.message }
  event.target.value = ''
})
$('#convert-form').addEventListener('submit', async event => {
  event.preventDefault()
  invalidate()
  const token = revision
  const button = $('#convert')
  button.disabled = true
  status.textContent = 'Rendering your PNG locally…'
  try {
    const width = Number($('#width').value)
    const height = Number($('#height').value)
    const background = $('#background').value === 'color' ? $('#color').value : $('#background').value
    const blob = await svgToPng(source.value, { width, height, background })
    if (token !== revision) return
    resultUrl = URL.createObjectURL(blob)
    preview.src = resultUrl
    preview.hidden = false
    $('#placeholder').hidden = true
    $('#result-size').textContent = `${width} × ${height} px · ${(blob.size / 1024).toFixed(1)} KiB PNG`
    download.href = resultUrl
    download.download = `formatide-demo-${width}x${height}.png`
    download.setAttribute('aria-disabled', 'false')
    download.tabIndex = 0
    status.textContent = 'PNG ready. Check the preview, then download your file.'
  } catch (error) { if (token === revision) status.textContent = error.message }
  finally { button.disabled = false }
})
download.addEventListener('click', event => { if (!resultUrl) event.preventDefault() })
window.addEventListener('pagehide', () => { if (resultUrl) URL.revokeObjectURL(resultUrl) })
loadSample()
