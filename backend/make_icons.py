from PIL import Image, ImageDraw
import os

os.makedirs('../extension/icons', exist_ok=True)

for size in [16, 48, 128]:
    img    = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw   = ImageDraw.Draw(img)
    margin = size // 8
    inner  = size // 4

    # Blue background circle
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(21, 101, 192, 255)
    )

    # Cyan inner circle
    draw.ellipse(
        [inner, inner, size - inner, size - inner],
        fill=(0, 180, 216, 255)
    )

    img.save(f'../extension/icons/icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created!')