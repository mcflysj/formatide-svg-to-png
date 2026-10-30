/** Standalone demo renderer. MIT licensed; see LICENSE in this directory. */
export const LIMITS = Object.freeze({ inputBytes: 64 * 1024, maxSide: 2048, maxElements: 2000 })
const NS = 'http://www.w3.org/2000/svg'
const tags = new Set('svg g defs path rect circle ellipse line polyline polygon linearGradient radialGradient stop clipPath mask use title desc'.split(' '))
const attributes = new Set('id x y x1 y1 x2 y2 cx cy r rx ry width height viewBox preserveAspectRatio d points transform fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity clip-path clip-rule mask gradientUnits gradientTransform spreadMethod offset stop-color stop-opacity href'.split(' '))
const shapes = new Set('path rect circle ellipse line polyline polygon'.split(' '))
const idPattern = '[A-Za-z_][A-Za-z0-9_.-]*'
const reference = new RegExp(`^url\\(#(${idPattern})\\)$`)
const color = /^(?:none|transparent|currentColor|[a-z]+|#[a-f\d]{3,8}|rgba?\([\d\s.,%]+\))$/i

export function prepareSvg(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('Choose a sample or paste a static SVG first.')
  if (new TextEncoder().encode(source).length > LIMITS.inputBytes) throw new Error('This demo accepts SVGs up to 64 KiB. Use the full converter for larger files.')
  if (/<!\s*(?:DOCTYPE|ENTITY)|<\?/i.test(source)) throw new Error('Document types and processing instructions are not supported in this demo.')
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  const root = document.documentElement
  if (document.querySelector('parsererror') || root.localName !== 'svg' || root.namespaceURI !== NS) throw new Error('Enter a valid SVG with the SVG namespace.')
  const nodes = [root, ...root.querySelectorAll('*')]
  if (nodes.length > LIMITS.maxElements) throw new Error('This SVG has too many elements for the demo.')
  const ids = new Map()
  const references = []
  for (const element of nodes) {
    if (element.namespaceURI !== NS || !tags.has(element.localName)) throw new Error(`The demo does not support <${element.localName}>. Use static shapes without images, text, styles or scripts.`)
    if (element.hasAttribute('id')) {
      const id = element.getAttribute('id')
      if (!new RegExp(`^${idPattern}$`).test(id) || ids.has(id)) throw new Error('SVG IDs must be valid and unique.')
      ids.set(id, element)
    }
    for (const attribute of element.attributes) {
      const name = attribute.name
      const value = attribute.value.trim()
      if (name === 'xmlns' && value === NS) continue
      if (attribute.namespaceURI || !attributes.has(name) || /[\\\u0000-\u001f\u007f]/.test(value)) throw new Error(`The demo does not support the ${name} attribute.`)
      if (name === 'href') {
        if (element.localName !== 'use' || !new RegExp(`^#${idPattern}$`).test(value)) throw new Error('Only internal shape references are allowed.')
        references.push({ id: value.slice(1), kind: 'shape' })
      } else if (['fill', 'stroke', 'stop-color'].includes(name)) {
        const match = reference.exec(value)
        if (match && name !== 'stop-color') references.push({ id: match[1], kind: 'gradient' })
        else if (!color.test(value)) throw new Error('Use plain colors or internal gradient references.')
      } else if (['clip-path', 'mask'].includes(name)) {
        const match = reference.exec(value)
        if (value !== 'none' && !match) throw new Error('Only internal clipping and mask references are allowed.')
        if (match) references.push({ id: match[1], kind: name === 'mask' ? 'mask' : 'clipPath' })
      } else if (name !== 'id' && /(?:url\s*\(|:|@)/i.test(value)) {
        throw new Error('External resources are not supported.')
      }
    }
  }
  for (const ref of references) {
    const tag = ids.get(ref.id)?.localName
    if (!tag || (ref.kind === 'shape' && !shapes.has(tag)) || (ref.kind === 'gradient' && !['linearGradient', 'radialGradient'].includes(tag)) || (['mask', 'clipPath'].includes(ref.kind) && tag !== ref.kind)) throw new Error('An internal reference is missing or unsupported. References to groups or other <use> elements are not allowed.')
  }
  // Mask/clip graphs can recurse even without <use>. Keep demo references flat.
  for (const element of nodes.filter(node => ['mask', 'clipPath'].includes(node.localName))) {
    if ([element, ...element.querySelectorAll('*')].some(node => node.hasAttribute('mask') || node.hasAttribute('clip-path'))) throw new Error('Nested mask and clip references are not supported in the demo.')
  }
  const box = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number)
  const validBox = box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0
  if (root.hasAttribute('viewBox') && !validBox) throw new Error('The SVG viewBox must contain four numbers with a positive width and height.')
  const length = name => {
    const value = root.getAttribute(name) || ''
    return /^\d+(?:\.\d+)?(?:px)?$/.test(value) ? Number.parseFloat(value) : 0
  }
  const width = length('width') || (validBox ? box[2] : 0)
  const height = length('height') || (validBox ? box[3] : 0)
  if (!width || !height || !Number.isFinite(width + height)) throw new Error('Add a positive width and height or a valid viewBox.')
  if (!validBox) root.setAttribute('viewBox', `0 0 ${width} ${height}`)
  return { root, width, height }
}

/** Render a constrained static SVG into a real PNG Blob on a fixed canvas. */
export async function svgToPng(source, { width = 512, height = 512, background = 'transparent' } = {}) {
  if (![width, height].every(n => Number.isInteger(n) && n >= 1 && n <= LIMITS.maxSide)) throw new Error('Choose whole-number dimensions from 1 to 2,048 pixels.')
  if (background !== 'transparent' && !/^#[a-f\d]{6}$/i.test(background)) throw new Error('Choose a transparent background or a six-digit hex color.')
  const { root } = prepareSvg(source)
  root.setAttribute('width', String(width))
  root.setAttribute('height', String(height))
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' }))
  const image = new Image()
  const canvas = document.createElement('canvas')
  let timer
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Rendering took too long. Try a simpler SVG.')), 10_000)
      image.onload = resolve
      image.onerror = () => reject(new Error('This browser could not render the SVG.'))
      image.src = url
    })
    clearTimeout(timer)
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable in this browser.')
    if (background !== 'transparent') { context.fillStyle = background; context.fillRect(0, 0, width, height) }
    context.drawImage(image, 0, 0, width, height)
    return await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('PNG export took too long.')), 10_000)
      canvas.toBlob(blob => blob?.size && blob.type === 'image/png' ? resolve(blob) : reject(new Error('PNG export failed.')), 'image/png')
    })
  } finally {
    clearTimeout(timer)
    image.onload = image.onerror = null
    image.src = ''
    URL.revokeObjectURL(url)
    canvas.width = canvas.height = 0
  }
}
