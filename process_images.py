import os
from PIL import Image

src_imgs = [
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress1_raw_1774291724344.png",
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress2_raw_1774291743007.png",
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress3_raw_1774291758232.png",
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress4_raw_1774291773509.png",
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress5_raw_1774291788755.png",
    r"C:\Users\Admin\.gemini\antigravity\brain\659e6c11-b4e5-48b9-8463-8a7331a507ce\mens_dress6_raw_1774291802901.png"
]

out_dir = r"c:\Users\Admin\Downloads\final projects\webion-ar-v3\webion-ar\public\images"
os.makedirs(out_dir, exist_ok=True)

for i, src in enumerate(src_imgs):
    out_path = os.path.join(out_dir, f"dress{i+1}.png")
    try:
        print(f"Pillow processing for {out_path}...")
        img = Image.open(src).convert("RGBA")
        data = img.getdata()
        new_data = []
        for item in data:
            # Check if color is close to white or grey (bg)
            # The AI images have white backgrounds, but dress4 has a grey background.
            r, g, b, a = item
            # White BG threshold
            is_white = r > 240 and g > 240 and b > 240
            # Grey BG threshold (for the white shirt)
            # is_grey = r > 150 and abs(r-g) < 10 and abs(g-b) < 10
            is_grey = (100 < r < 200) and (abs(r-g) < 15) and (abs(g-b) < 15) and (i == 3) # only apply grey removal to shirt
            
            if is_white or is_grey:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        img.save(out_path, "PNG")
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Failed {src}: {e}")
