import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# First, remove the malformed banner block completely
bad_banner_pattern = r"            \{\/\* Quick Helper Banner \*\/\}\s*<div className=\"aero-glass-card rounded-2xl p-3\.5 border border-white\/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-sm\">\s*<div className=\"flex items-center gap-2\">\s*<span className=\"text-base\">👐<\/span>\s*<span>\s*<strong className=\"font-semibold text-slate-900\">\{t\.howToPlay\} <\/strong>\s*\{t\.howToPlayDesc\}\s*<\/span>\s*<\/div>\n"
content = re.sub(bad_banner_pattern, "", content)

# Remove any dangling <span className="font-digital text-[11px] font-bold text-sky-800 px-2 py-0.5 rounded-md bg-white/70">{t.keysBadge}</span></div> if they exist near where it used to be
dangling = r"\s*<span className=\"font-digital text-\[11px\] font-bold text-sky-800 px-2 py-0\.5 rounded-md bg-white\/70\">\s*\{t\.keysBadge\}\s*<\/span>\s*<\/div>\n"
content = re.sub(dangling, "", content)

banner_correct = """        {/* Quick Helper Banner */}
        <div className="aero-glass-card rounded-2xl p-3.5 border border-white/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">👐</span>
            <span>
              <strong className="font-semibold text-slate-900">{t.howToPlay} </strong>
              {t.howToPlayDesc}
            </span>
          </div>
          <span className="font-digital text-[11px] font-bold text-sky-800 px-2 py-0.5 rounded-md bg-white/70">
            {t.keysBadge}
          </span>
        </div>
"""

# Insert right before {/* Main 2-Column Responsive Workspace */}
content = content.replace("        {/* Main 2-Column Responsive Workspace */}", banner_correct + "        {/* Main 2-Column Responsive Workspace */}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
