# Check which sizes are inside a favicon.ico

An ICO can store several images in one file. An image preview may show only the largest one. If you need a 16 px browser tab icon, check that the file actually contains a 16 px image and inspect how it looks at that size.

## Compare two real downloads

I used Formatide's [SVG to ICO converter](https://formatide.com/svg-to-ico#favicon-example) to export the same [120 × 80 test SVG](exports/favicon-layers.svg) twice. The orange rectangle is 50% opaque. With a transparent background, the icon keeps its transparent corners in both downloads.

| Download | Sizes stored in the file |
| --- | --- |
| [Four-size favicon](exports/favicon-default.ico) | 16 × 16, 32 × 32, 48 × 48, 256 × 256 |
| [256 px only](exports/favicon-large-only.ico) | 256 × 256 |

To reproduce the pair, add the SVG to the converter and keep **Transparent**. Select **Convert to ICO** and download the default result. Then clear the 16, 32 and 48 px size checkboxes, select **Convert again**, and download the second file. A client may scale the large image when a small size is missing, so even the second file can look fine in a quick preview.

## List the sizes with Python 3

Save the snippet as `list_ico_sizes.py` and run `python3 list_ico_sizes.py favicon-default.ico`. It reads the icon directory at the beginning of the file and needs no dependencies.

```python
import struct
import sys
from pathlib import Path

data = Path(sys.argv[1]).read_bytes()
if len(data) < 6:
    raise SystemExit("The file is too short for an ICO header")

reserved, kind, count = struct.unpack_from("<HHH", data)
if reserved != 0 or kind != 1 or count == 0 or len(data) < 6 + 16 * count:
    raise SystemExit("The file has no complete ICO image directory")

for index in range(count):
    width, height = struct.unpack_from("<BB", data, 6 + 16 * index)
    print(f"{width or 256} x {height or 256}")
```

Width and height each occupy one byte in the [ICO directory format](https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)). A zero in either dimension represents 256 pixels. The script lists what the directory claims. Open the file in an icon viewer or test it in the browser tab to check that the small image renders and reads clearly.
