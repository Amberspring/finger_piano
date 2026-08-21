import re

with open('src/utils/handTracker.ts', 'r') as f:
    content = f.read()

old_trigger = r"          // Trigger sound and callbacks!\n          this\.callbacks\.onTouch\(\{\n            hand,\n            finger,\n            timestamp: now,\n            distance: normalizedDist,\n          \}\);"
new_trigger = """          // Trigger sound and callbacks!
          this.callbacks.onTouch({
            hand,
            finger,
            timestamp: now,
            distance: normalizedDist,
          });

          // Add visual ripple in canvas
          if (this.canvasElement) {
            const colors: Record<"index" | "middle" | "ring" | "pinky", string> = {
              index: '#f43f5e',
              middle: '#facc15',
              ring: '#fb7185',
              pinky: '#22d3ee',
            };
            const px = tip.x * this.canvasElement.width;
            const py = tip.y * this.canvasElement.height;
            this.addRipple(px, py, colors[finger] || '#38bdf8');
            this.addParticles(px, py, colors[finger] || '#38bdf8', 10);
          }"""

content = re.sub(old_trigger, new_trigger, content)

with open('src/utils/handTracker.ts', 'w') as f:
    f.write(content)
