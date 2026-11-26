# PNG and WebP from the same transparent SVG

A badge with fine lines, a gradient and a transparent border is a quick way to test whether a smaller WebP is suitable for your site. The same SVG produced a 108,749-byte PNG and a 4,398-byte WebP at quality 65. Both had the same transparency at every pixel, but some colors changed.

## Export and compare

1. Download the [original 480 × 280 SVG](exports/gradient-badge.svg).
2. Export PNG at the original size with a transparent background. [SVG to PNG](https://formatide.com/svg-to-png)
3. Use the same settings in the WebP converter. Download at quality 65 and then at 100. [SVG to WebP](https://formatide.com/svg-to-webp)
4. Compare the fine lines and gradient at the size you intend to display the badge. Check the translucent edges on both light and dark backgrounds.

These are the actual downloads from a Chrome 158.0.8127.38 run. All three images are 480 × 280 pixels.

| Download | File size | Encoding | Fully opaque pixels with different RGB values vs. PNG |
| --- | ---: | --- | ---: |
| [PNG](exports/badge.png) | 108,749 bytes | PNG | 0 |
| [WebP at 65](exports/badge-q65.webp) | 4,398 bytes | Lossy WebP (`VP8`) | 97,284 out of 99,240 |
| [WebP at 100](exports/badge-q100.webp) | 40,514 bytes | Lossless WebP (`VP8L`) | 0 |

I decoded all three files as RGBA and compared them pixel by pixel. All three alpha channels matched. Most opaque pixels in the smaller WebP differed numerically, which is a reason to check the artwork at its intended size before choosing a quality setting. The quality 100 download matched the PNG across all decoded RGBA pixels in this run.

The quality setting is a request to the browser's encoder. This Chrome export used a lossless `VP8L` chunk at 100. Check the actual bitstream if lossless WebP is required, or choose PNG for lossless raster output. [HTML canvas specification](https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file) · [WebP container specification](https://developers.google.com/speed/webp/docs/riff_container)

I maintain Formatide and made the SVG for this comparison.
