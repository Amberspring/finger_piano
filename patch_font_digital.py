import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Add fontsource import
content = content.replace("@import \"tailwindcss\";", "@import \"tailwindcss\";\n@import \"@fontsource/fusion-pixel-12px-proportional-sc\";")

# Update .font-digital
new_font_digital = """.font-digital {
  font-family: 'Fusion Pixel 12px Proportional SC', 'Silkscreen', 'DotGothic16', monospace;
}"""
content = re.sub(r"\.font-digital \{\s*font-family: 'Silkscreen', 'Zpix', 'DotGothic16', monospace;\s*\}", new_font_digital, content)

# Remove old zpix import
content = content.replace("@import url('https://unpkg.com/zpix-pixel-font/dist/zpix.css');\n", "")

with open('src/index.css', 'w') as f:
    f.write(content)
