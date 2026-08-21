import re

with open('src/components/PianoMode.tsx', 'r') as f:
    content = f.read()

# Pattern to extract Scale Presets Grid
scale_grid_pattern = r"\s*\{\/\* Scale Presets Grid \(Dual Hand 8 Notes\) \*\/\}\s*<div className=\"flex flex-col gap-2 pt-2 border-t border-white\/60\">\s*<span className=\"text-xs font-bold text-slate-700 flex items-center gap-1\">\s*<Sparkles className=\"w-3\.5 h-3\.5 text-amber-500\" \/>\s*<span>\{t\.scalePresets\}<\/span>\s*<\/span>\s*<div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2\">\s*\{SCALE_PRESETS\.map\(\(preset\) => \(\s*<button\s*key=\{preset\.id\}\s*onClick=\{\(\) => handleApplyScale\(preset\)\}\s*className=\"p-2\.5 rounded-xl bg-white\/60 hover:bg-white\/90 border border-white\/80 text-left transition hover:scale-\[1\.01\] cursor-pointer flex flex-col justify-between shadow-xs group\"\s*>\s*<div>\s*<span className=\"text-xs font-bold text-slate-800 group-hover:text-sky-700\">\s*\{language === 'zh' \? preset\.nameZh : preset\.nameEn\}\s*<\/span>\s*<p className=\"text-\[10px\] text-slate-500 line-clamp-1 mt-0\.5\">\s*\{language === 'zh' \? preset\.descriptionZh : preset\.descriptionEn\}\s*<\/p>\s*<\/div>\s*<div className=\"text-\[10px\] font-digital font-bold text-sky-700 mt-1 flex items-center justify-between\">\s*<span>L: \{Object\.values\(preset\.notes\.Left\)\.join\(' '\)\}<\/span>\s*<span>R: \{Object\.values\(preset\.notes\.Right\)\.join\(' '\)\}<\/span>\s*<\/div>\s*<\/button>\s*\)\)\}\s*<\/div>\s*<\/div>\n"

match = re.search(scale_grid_pattern, content)
if match:
    block = match.group(0)
    # Remove from original
    content = content.replace(block, "\n")
    
    # Standalone block format
    standalone_block = """      {/* Quick Chord & Scale Presets */}
      <div 
        id="piano-scale-presets"
        className="aero-glass-card rounded-3xl p-5 border border-white/70 shadow-lg flex flex-col gap-3"
      >
        <span className="text-sm font-bold font-display text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.scalePresets}</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyScale(preset)}
              className="p-3 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 text-left transition hover:scale-[1.01] cursor-pointer flex flex-col justify-between shadow-xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  {language === 'zh' ? preset.nameZh : preset.nameEn}
                </span>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'zh' ? preset.descriptionZh : preset.descriptionEn}
                </p>
              </div>
              <div className="text-[10px] font-digital font-bold text-sky-700 mt-1.5 flex items-center justify-between">
                <span>L: {Object.values(preset.notes.Left).join(' ')}</span>
                <span>R: {Object.values(preset.notes.Right).join(' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
"""
    
    # Insert before { /* 3. Cassette Tape Recorder
    target = "      {/* 3. Cassette Tape Recorder & Melody Sharing */}"
    content = content.replace(target, standalone_block + "\n" + target)

    with open('src/components/PianoMode.tsx', 'w') as f:
        f.write(content)
else:
    print("Pattern not found!")
