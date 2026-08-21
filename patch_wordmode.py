import re

with open('src/components/WordMode.tsx', 'r') as f:
    content = f.read()

# Replace sentence bubble font size
content = content.replace(
    "text-sm font-extrabold font-display",
    "text-[11px] sm:text-xs font-bold font-display"
)

# Replace input grid text size
content = content.replace(
    "text-xs sm:text-sm bg-sky-50",
    "text-[10px] sm:text-xs bg-sky-50"
)
content = content.replace(
    "text-xs sm:text-sm bg-emerald-50",
    "text-[10px] sm:text-xs bg-emerald-50"
)

with open('src/components/WordMode.tsx', 'w') as f:
    f.write(content)
