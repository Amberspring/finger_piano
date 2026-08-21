import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Pattern for Quick Helper Banner
banner_pattern = r"\s*\{\/\* Quick Helper Banner \*\/\}\s*<div className=\"aero-glass-card rounded-2xl p-3\.5 border border-white\/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-sm\">.*?<\/div>\n"

banner_match = re.search(banner_pattern, content, flags=re.DOTALL)
if banner_match:
    banner_code = banner_match.group(0)
    # Remove from original location
    content = content.replace(banner_code, "")
    
    # Insert right before <main className="grid
    content = content.replace(
        "        {/* Main 2-Column Responsive Workspace */}",
        banner_code + "        {/* Main 2-Column Responsive Workspace */}"
    )
    
    with open('src/App.tsx', 'w') as f:
        f.write(content)
else:
    print("Banner not found")
