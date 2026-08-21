import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Add Zpix import
zpix_import = "@import url('https://unpkg.com/zpix-pixel-font/dist/zpix.css');\n"
content = content.replace('@import url(\'https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen&display=swap\');', zpix_import + '@import url(\'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap\');')

# Update font-digital to prioritize Zpix
new_font_digital = """.font-digital {
  font-family: 'Silkscreen', 'Zpix', 'DotGothic16', monospace;
}"""
content = re.sub(r"\.font-digital \{\s*font-family: 'Silkscreen', 'DotGothic16', monospace;\s*\}", new_font_digital, content)

with open('src/index.css', 'w') as f:
    f.write(content)
