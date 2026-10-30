# Standalone SVG to PNG demo module

[`svg-to-png.js`](svg-to-png.js) is an independent browser reference implementation. The files in this directory are available under the [MIT license](LICENSE). The license covers this demo, not the full hosted Formatide application or product trademarks.

## API

```js
import { prepareSvg, svgToPng, LIMITS } from './svg-to-png.js'

const { width, height } = prepareSvg(svgSource)
const blob = await svgToPng(svgSource, {
  width: 512,
  height: 512,
  background: '#ffffff', // default: 'transparent'
})
const url = URL.createObjectURL(blob)
// Use the URL in an <img> or download link. Revoke it when you replace it.
```

`svgToPng` returns a `Promise<Blob>` containing an actual PNG. Width and height must be integers from 1 to 2,048. Background accepts `transparent` or a six-digit hex color. The artwork fits into the fixed canvas with its proportions preserved. Errors reject with a readable message.

`prepareSvg` validates the supported subset and returns a detached SVG root and intrinsic dimensions. It never mounts source markup in the page. `LIMITS` exposes the 64 KiB input, 2,000-element and 2,048-pixel-side limits.

## Supported subset

- SVG namespace; positive width/height or a valid viewBox.
- Paths, rectangles, circles, ellipses, lines, polylines and polygons.
- Groups, basic transforms, solid colors and internal linear/radial gradients.
- Internal `<use>` references to simple shapes; references to groups or another `<use>` are rejected.
- Flat internal clipping and masks; nested clip/mask references are rejected.

Text, images, CSS, filters, animation, foreign namespaces, event handlers, processing instructions, DTDs and external resources are rejected. This is intentionally a small example, not a general-purpose SVG sanitizer. If you extend the supported subset, review its resource-loading and rendering implications and add relevant tests.

The renderer uses a Blob URL, an image element and a bounded Canvas. SVG markup is never inserted into the application DOM. Temporary URLs and canvases are released after rendering; the caller manages URLs it creates for the returned PNG Blob.

## Trade-offs

Native SVG rendering can vary between browsers. This example does not offer batch ZIPs, embedded resources, text layout, print profiles or an interruptible renderer. It supports PNG only and does not run on Node.js without a browser DOM and Canvas implementation.

For the full tool, [convert SVG to PNG in your browser on Formatide](https://formatide.com/). For this example's source and checks, see the [repository overview](../README.md).
