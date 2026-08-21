import re

with open('src/components/PianoMode.tsx', 'r') as f:
    content = f.read()

# The block to extract:
scale_presets_pattern = r"        \{\/\* Scale Presets Grid \(Dual Hand 8 Notes\) \*\/\}\n        <div className=\"flex flex-col gap-2 pt-2 border-t border-white\/60\">\n          <span className=\"text-xs font-bold text-slate-700 flex items-center gap-1\">\n            <Sparkles className=\"w-3\.5 h-3\.5 text-amber-500\" \/>\n            <span>\{t\.scalePresets\}<\/span>\n          <\/span>\n          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2\">\n            \{SCALE_PRESETS\.map\(\(preset\) => \(\n              <button\n                key=\{preset\.id\}\n                onClick=\{\(\) => handleApplyScale\(preset\)\}\n                className=\"p-2\.5 rounded-xl bg-white\/60 hover:bg-white\/90 border border-white\/80 text-left transition hover:scale-\[1\.01\] cursor-pointer flex flex-col justify-between shadow-xs group\"\n              >\n                <div>\n                  <span className=\"text-xs font-bold text-slate-800 group-hover:text-sky-700\">\n                    \{language === 'zh' \? preset\.nameZh : preset\.nameEn\}\n                  <\/span>\n                  <p className=\"text-\[10px\] text-slate-500 line-clamp-1 mt-0\.5\">\n                    \{language === 'zh' \? preset\.descriptionZh : preset\.descriptionEn\}\n                  <\/p>\n                <\/div>\n                <div className=\"text-\[10px\] font-digital font-bold text-sky-700 mt-1 flex items-center justify-between\">\n                  <span>L: \{Object\.values\(preset\.notes\.Left\)\.join\(' '\)\}<\/span>\n                  <span>R: \{Object\.values\(preset\.notes\.Right\)\.join\(' '\)\}<\/span>\n                <\/div>\n              <\/button>\n            \)\)\}\n          <\/div>\n        <\/div>\n"

match = re.search(scale_presets_pattern, content)
if match:
    block = match.group(0)
    # Remove from original
    content = content.replace(block, "")
    
    # Needs to be wrapped in its own aero-glass-card to match styling, since it was previously inside piano-notes-grid
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

    # Insert after instrument picker
    target = "        </div>\n      </div>\n\n      {/* 3. Cassette Tape Recorder & Melody Sharing */}"
    replacement = "        </div>\n      </div>\n\n" + standalone_block + "\n      {/* 3. Cassette Tape Recorder & Melody Sharing */}"
    content = content.replace(target, replacement)
    
    with open('src/components/PianoMode.tsx', 'w') as f:
        f.write(content)
else:
    print("Pattern not found!")
