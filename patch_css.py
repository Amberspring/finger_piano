import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Add DotGothic16 import
import_statement = "@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen&display=swap');\n"
content = content.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + import_statement)

# Update font-digital
new_font_digital = """.font-digital {
  font-family: 'Silkscreen', 'DotGothic16', monospace;
}"""
content = re.sub(r"\.font-digital \{\s*font-family: 'Silkscreen', monospace;\s*\}", new_font_digital, content)

with open('src/index.css', 'w') as f:
    f.write(content)
