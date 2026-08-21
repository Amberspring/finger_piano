# 🎹 Finger Touch Piano (指尖触碰钢琴) ✨

> 把你的指尖变成魔法琴键，在空气中弹奏旋律，书写漂浮的祝福！

这是一个基于 React + MediaPipe 构建的 Web 增强现实 (AR) 互动应用。通过设备的摄像头捕捉手势，当大拇指与其他手指捏合时，会在指尖生成炫酷的视觉反馈——可以是清脆的钢琴音符，也可以是定制的漂浮文字（如生日祝福）。

---

## 🌟 核心功能 (Features)

*   ✋ **AI 实时手势追踪**：基于 MediaPipe 的精准 3D 手部骨骼捕捉。
*   🎹 **空气钢琴模式**：捏合手指即可在空气中弹奏完整的八度音阶，自带优雅的粒子光晕。
*   💌 **贺卡寄语模式**：支持自定义各个手指触发的词汇。当指尖碰撞，文字会以中文像素风（缝合像素字体）或优雅的正体漂浮在空中。
*   📺 **复古滤镜系统**：内置多种千禧年 (Y2K) 复古 DV、拍立得、以及未来赛博朋克风格的边框。
*   💬 **动态模糊字幕**：底部自带极具质感的柔和边缘字幕条（默认 `FFF2F2` 浅粉白背景，搭配深色中文字体），最多显示最新敲击的 22 个字符。

---

## 📸 交互界面图解 (Visual Documentation)

为了更好地展示交互效果，我们特别邀请了两位“特邀体验官”来为您做界面示范：

### 🐶 示范一：奶油博美的指尖魔法 (基础交互)

*想象一只毛茸茸的**奶油博美**正好奇地对着摄像头举起它的小爪子...*

<div align="center">
  <!-- 请在此处替换为博美举起爪子触发漂浮文字的截图 -->
  <img src="https://placehold.co/800x450/FFF9F9/FFB3B3?text=Cream+Pomeranian+Touching+the+Air" alt="奶油博美示范图" width="800" style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);">
</div>

**交互说明：**
*   **触发点**：当大拇指与食指/中指/无名指/小指**发生接触（捏合）**时，系统会立即在接触点生成带有光晕的彩色圆点。
*   **漂浮文字**：随后，对应的文字（例如：“天”、“天”、“开”、“心”）会以清秀的字体在爪子（指尖）上方漂浮并带有淡出动画。

### 🤎 示范二：宝可梦土王的复古留影 (滤镜与字幕)

*想象一只圆滚滚、看起来十分呆萌的**宝可梦土王 (Clodsire)** 趴在镜头前，身上套着复古的 DV 录像机滤镜...*

<div align="center">
  <!-- 请在此处替换为土王搭配复古相框和底部字幕的截图 -->
  <img src="https://placehold.co/800x450/F2EDEB/8B5A2B?text=Clodsire+with+Retro+Camera+and+Subtitle" alt="土王示范图" width="800" style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);">
</div>

**UI 元素说明：**
1.  **复古相框 (Retro Frame)**：土王的四周有一圈千禧年风格的旧电视机录像边框（包含 `REC` 闪烁红点和电池余量）。
2.  **底部字幕条 (Subtitle Bar)**：在画面的最下方，有一条边缘模糊的 `#FFF2F2` 浅色柔和字幕条。
3.  **文字渲染**：随着土王（或者用户）在空中捏合手指，敲击出的字会实时组合成句子，以 `500` 字重的优雅明朝体（深灰色）显示在字幕条中（最高限制 22 个字）。

---

## 🛠️ 本地开发与运行 (Local Development)

如果你已经将项目 Clone 到本地，只需执行以下简单的命令即可跑起来：

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

启动后，浏览器会自动打开 `http://localhost:3000`。请务必**允许浏览器获取摄像头权限**，即可开始你的空气钢琴之旅！

---

## 📦 技术栈 (Tech Stack)

*   **框架**: React 18 + TypeScript + Vite
*   **AI 视觉**: `@mediapipe/tasks-vision` (手势追踪核心)
*   **样式**: Tailwind CSS
*   **UI 组件**: Lucide React (图标), Radix UI (底层交互)
*   **字体**: `@fontsource/fusion-pixel-12px-proportional-sc` (中文像素字体)

---
*Built with love and magic fingers. 🎹✨*
