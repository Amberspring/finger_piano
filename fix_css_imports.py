import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Remove the incorrectly placed imports
content = content.replace("@import url('https://unpkg.com/zpix-pixel-font/dist/zpix.css');\n", "")
content = content.replace("@import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');\n", "")
content = content.replace('@import "tailwindcss";', "")

# Add them at the very top
new_imports = """@import url('https://unpkg.com/zpix-pixel-font/dist/zpix.css');
@import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
@import "tailwindcss";
"""
content = new_imports + content

with open('src/index.css', 'w') as f:
    f.write(content)
