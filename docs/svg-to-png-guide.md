# How to convert SVG to PNG with Formatide

[Convert SVG to PNG in your browser with Formatide](https://formatide.com/). This guide describes the full website's sizing, transparency and export workflow. For an inspectable working example, try the [GitHub Pages SVG to PNG demo](https://mcflysj.github.io/formatide-svg-to-png/) and its [standalone module](../demo/README.md).

## Choose the size for the destination

Use **Original** when the SVG already has the pixel dimensions you need. For example, the [transparent icon sample](../examples/transparent-icon.svg) produces a 256 × 256 PNG at its original size.

Use **Scale** for a proportional enlargement. At 2×, that same icon produces a 512 × 512 PNG. Vector shapes can be rendered at a larger size, but embedded bitmap images retain their original level of detail.

Use **Custom** when you need a specific width or height. **Keep ratio** preserves each image's proportions. **Fixed canvas** fits and centers the artwork within your chosen width and height, without stretching or cropping it. Empty areas use the background you select.

PNG is lossless. Choose pixel dimensions for your destination rather than looking for a quality slider or a DPI setting.

## Preserve transparency

Choose **Transparent** for logos and icons that will be placed over another background. The checkerboard in the preview represents transparent pixels; it is not included in the PNG.

If the exported image still has a white background, inspect the SVG in your design tool. A white rectangle inside the SVG is artwork, so it remains white even with a transparent output background. Formatide is not a background-removal tool.

Choose **White** or **Custom** when you want a solid color behind the artwork.

## Export a batch

1. Select your SVG files. Review any validation errors before conversion.
2. Choose the size and background. One set of settings applies to the batch.
3. Convert and inspect the results. You can download individual PNGs or a ZIP containing successful conversions.
4. If the batch pauses at the 64 MiB output limit, download the current ZIP part and verify that it is saved before selecting **I've saved it — continue**.

Earlier parts are released from the page after you continue. Keep the downloaded ZIPs. The browser cannot confirm that you saved a download to disk, so Formatide waits for your acknowledgement.

File size and image dimensions are different limits. A small SVG can produce a large PNG. Use smaller output dimensions or fewer files when working on a device with limited memory.

## Troubleshoot a result

| What you see | What to check |
| --- | --- |
| Text looks different | Embed the font or convert text to outlines in the original design tool. |
| A linked image or font is rejected | Embed the resource in the SVG. External resources are not fetched during conversion. |
| The SVG has no usable dimensions | A valid `viewBox` may provide the size. Otherwise, choose **Custom → Fixed canvas** and enter both dimensions. |
| Scripts, animation or embedded HTML are rejected | Export a plain, static SVG from the original tool. |
| The image exceeds a size limit | Reduce the output dimensions. Each side must be at most 4,096 px, and the total must be at most 16 megapixels. |
| An older result downloads after you change settings | Convert again to generate a PNG with the new settings. |

## Check local processing

Open your browser's developer tools and inspect the Network panel while selecting and converting a synthetic SVG. Website resources may load, but there should be no request carrying the file's contents or conversion result to a server.

Optional analytics is separate from conversion and requires consent. Read the [privacy policy](https://formatide.com/privacy) for the scope of website requests and analytics.

## Try the examples

The [sample SVGs](../examples/) cover a transparent icon, a wide banner and artwork with only a `viewBox`. Open a file on GitHub, use **Download raw file**, then choose the downloaded SVG in Formatide.

[SVG to PNG converter](https://formatide.com/) · [All current Formatide converters](https://formatide.com/converter) · [Back to the project overview](../README.md)
