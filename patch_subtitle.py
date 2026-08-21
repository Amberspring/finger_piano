import re

with open('src/utils/handTracker.ts', 'r') as f:
    content = f.read()

old_subtitle_block = """    if (this.subtitleText) {
      const maxChars = 22;
      const displaySubtitle = this.subtitleText.length > maxChars 
        ? this.subtitleText.slice(-maxChars) 
        : this.subtitleText;

      const textY = height - 34;
      ctx.font = '900 24px "Noto Serif SC", SimSun, "STZhongsong", serif';
      
      const metrics = ctx.measureText(displaySubtitle);
      const bgWidth = metrics.width + 40;
      const bgHeight = 40;

      ctx.fillStyle = '#66CCCC';
      ctx.fillRect(width / 2 - bgWidth / 2, textY - 28, bgWidth, bgHeight);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillText(displaySubtitle, width / 2, textY);
    }"""

new_subtitle_block = """    if (this.subtitleText) {
      const maxChars = 22;
      const displaySubtitle = this.subtitleText.length > maxChars 
        ? this.subtitleText.slice(-maxChars) 
        : this.subtitleText;

      const textY = height - 34;
      // 将 900 (极粗) 改为 500 (适中偏细)
      ctx.font = '500 24px "Noto Serif SC", SimSun, "STZhongsong", serif';
      
      const metrics = ctx.measureText(displaySubtitle);
      const bgWidth = metrics.width + 40;
      const bgHeight = 40;

      // 边缘模糊的 #FFF2F2 背景
      ctx.fillStyle = '#FFF2F2';
      ctx.shadowColor = '#FFF2F2';
      ctx.shadowBlur = 15;
      
      // 绘制两次以增强模糊边缘的浓密度
      ctx.fillRect(width / 2 - bgWidth / 2, textY - 28, bgWidth, bgHeight);
      ctx.fillRect(width / 2 - bgWidth / 2, textY - 28, bgWidth, bgHeight);

      // 因为背景变成了极浅的 FFF2F2，如果用白色字会看不清。
      // 所以这里将字体颜色改为深色，为了呼应之前的青色，可以使用深青色或者直接深灰。这里用优雅的深灰色。
      ctx.fillStyle = '#333333';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillText(displaySubtitle, width / 2, textY);
    }"""

content = content.replace(old_subtitle_block, new_subtitle_block)

with open('src/utils/handTracker.ts', 'w') as f:
    f.write(content)
