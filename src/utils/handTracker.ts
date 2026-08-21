import { FingerId, HandId, TouchTriggerEvent, DualHandRecord, RetroFrameType } from '../types';

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface PinchState {
  isPinching: boolean;
  distance: number;
  lastTriggerTime: number;
  cooldownMs: number;
}

export interface HandTrackerCallbacks {
  onTouch: (event: TouchTriggerEvent) => void;
  onHandStatusChange: (isDetected: boolean, count: number) => void;
}

// MediaPipe global types declaration
declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
  }
}

// Global singletons to prevent multiple WASM initializations and race conditions
let globalHandsInstance: any = null;
let handsInitPromise: Promise<void> | null = null;

export class HandTrackerEngine {
  private handsInstance: any = null;
  private cameraInstance: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private callbacks: HandTrackerCallbacks;

  private isRunning = false;
  private sensitivity = 1.0; // 0.5 (harder) to 1.5 (easier)
  private baseThreshold = 0.36;
  private releaseThreshold = 0.50;
  private cooldownMs = 200; // Debounce cooldown

  // State to draw dynamically on canvas
  private labels: DualHandRecord<string> = {
    Left: { pinky: 'I', ring: 'mochi', middle: 'smile', index: 'me' },
    Right: { index: 'you', middle: 'make', ring: 'flora', pinky: 'love' },
  };
  private subtitleText = '';
  private watermarkText = 'Finger Touch Piano';
  private watermarkAuthor = '@florayeung';
  private retroFrame: RetroFrameType = 'none';
  private showSkeleton = false; // Default: false (Pure fingertip dots as requested)
  
  // Track pinch state for Right and Left hands
  private pinchStates: Record<HandId, Record<FingerId, PinchState>> = {
    Right: {
      index: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      middle: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      ring: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      pinky: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
    },
    Left: {
      index: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      middle: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      ring: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
      pinky: { isPinching: false, distance: 1.0, lastTriggerTime: 0, cooldownMs: 200 },
    },
  };

  // Sparkles & ripple particle pool
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    life: number;
  }> = [];

  private rippleEffects: Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
  }> = [];

  constructor(callbacks: HandTrackerCallbacks) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: HandTrackerCallbacks) {
    this.callbacks = callbacks;
  }

  public setLabels(labels: DualHandRecord<string>) {
    this.labels = labels;
  }

  public setSubtitle(text: string) {
    this.subtitleText = text;
  }

  public setRetroFrame(frame: RetroFrameType) {
    this.retroFrame = frame;
  }

  public setShowSkeleton(show: boolean) {
    this.showSkeleton = show;
  }

  public setSensitivity(multiplier: number) {
    this.sensitivity = Math.max(0.5, Math.min(2.0, multiplier));
  }

  public setWatermark(author: string, title: string) {
    this.watermarkAuthor = author;
    this.watermarkText = title;
  }

  private isProcessingFrame = false;

  public async start(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<boolean> {
    this.videoElement = video;
    this.canvasElement = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Wait until MediaPipe scripts are loaded on window
    let attempts = 0;
    while ((!window.Hands || !window.Camera) && attempts < 35) {
      await new Promise((res) => setTimeout(res, 100));
      attempts++;
    }

    if (!window.Hands) {
      console.warn('MediaPipe Hands library not found on window. Click/keyboard mode active.');
      return false;
    }

    try {
      if (!globalHandsInstance) {
        const MEDIAPIPE_VERSION = '0.4.1675469240';
        globalHandsInstance = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_VERSION}/${file}`,
        });

        globalHandsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });

        // Pre-initialize WASM and packed assets before camera stream begins
        if (typeof globalHandsInstance.initialize === 'function') {
          handsInitPromise = globalHandsInstance.initialize().catch((initErr: any) => {
            console.warn('MediaPipe hands pre-initialization notice:', initErr);
          });
        } else {
          handsInitPromise = Promise.resolve();
        }
      }

      this.handsInstance = globalHandsInstance;
      
      if (handsInitPromise) {
        await handsInitPromise;
      }

      // Update callback to the current engine instance
      this.handsInstance.onResults((results: any) => this.onResults(results));

      if (this.cameraInstance) {
        try {
          this.cameraInstance.stop();
        } catch {
          // ignore
        }
      }

      this.isProcessingFrame = false;
      this.cameraInstance = new window.Camera(this.videoElement, {
        onFrame: async () => {
          if (!this.isRunning || !this.videoElement || !this.handsInstance || this.isProcessingFrame) {
            return;
          }
          if (this.videoElement.readyState < 2) {
            return;
          }
          this.isProcessingFrame = true;
          try {
            await this.handsInstance.send({ image: this.videoElement });
          } catch (err) {
            // frame drop recovery
          } finally {
            this.isProcessingFrame = false;
          }
        },
        width: 1280,
        height: 720,
      });

      this.isRunning = true;
      await this.cameraInstance.start();
      return true;
    } catch (err) {
      console.error('Error starting MediaPipe camera tracker:', err);
      return false;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.cameraInstance && typeof this.cameraInstance.stop === 'function') {
      try {
        this.cameraInstance.stop();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
    }
    if (this.ctx && this.canvasElement) {
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
    this.callbacks.onHandStatusChange(false, 0);
  }

  // Trigger manual touch (from keyboard shortcut or on-screen click fallback)
  public triggerManualTouch(hand: HandId = 'Right', finger: FingerId) {
    const event: TouchTriggerEvent = {
      hand,
      finger,
      timestamp: Date.now(),
      distance: 0.05,
    };
    this.callbacks.onTouch(event);


  }

  private onResults(results: any) {
    if (!this.ctx || !this.canvasElement) return;

    const canvas = this.canvasElement;
    const ctx = this.ctx;

    // Match canvas display resolution
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 640;
      canvas.height = canvas.clientHeight || 480;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
    const handCount = hasHands ? results.multiHandLandmarks.length : 0;
    this.callbacks.onHandStatusChange(hasHands, handCount);

    if (hasHands) {
      // 1. Prepare detected hands with physical screen coordinates
      // In mirrored camera: screenX = (1 - rawLandmark[0].x) * canvas.width
      const detectedList: Array<{
        landmarks: Landmark[];
        screenCenterX: number;
      }> = [];

      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const rawLandmarks: Landmark[] = results.multiHandLandmarks[i];
        // Calculate average screen X of wrist (0) and middle MCP (9)
        const wristX = (1 - rawLandmarks[0].x) * canvas.width;
        const middleX = (1 - rawLandmarks[9].x) * canvas.width;
        const screenCenterX = (wristX + middleX) / 2;
        detectedList.push({ landmarks: rawLandmarks, screenCenterX });
      }

      // 2. Determine Left vs Right Hand strictly based on screen perspective:
      // "面对电脑镜头，左边的就是左手" -> screenCenterX on the left half is ALWAYS 'Left'
      let classifiedHands: Array<{ landmarks: Landmark[]; handLabel: HandId }> = [];

      if (detectedList.length === 1) {
        const hand = detectedList[0];
        // If single hand is on left side or center-left, it's Left; else Right
        const handLabel: HandId = hand.screenCenterX < canvas.width * 0.52 ? 'Left' : 'Right';
        classifiedHands.push({ landmarks: hand.landmarks, handLabel });
      } else if (detectedList.length >= 2) {
        // Sort by screenCenterX ascending (leftmost to rightmost on screen)
        detectedList.sort((a, b) => a.screenCenterX - b.screenCenterX);
        // The one on the left is ALWAYS Left Hand; the one on the right is ALWAYS Right Hand!
        classifiedHands.push({ landmarks: detectedList[0].landmarks, handLabel: 'Left' });
        classifiedHands.push({ landmarks: detectedList[1].landmarks, handLabel: 'Right' });
      }

      // 3. Render hands and calculate pinch contact
      for (const item of classifiedHands) {
        if (this.showSkeleton) {
          this.renderFullHandSkeleton(ctx, item.landmarks, canvas.width, canvas.height, item.handLabel);
        }
        this.renderFingertipDotsAndWords(ctx, item.landmarks, canvas.width, canvas.height, item.handLabel);
        this.processPinchGestures(item.landmarks, item.handLabel);
      }
    }

    // 4. Render active particles & water ripples

    // 5. Render Top Watermark Title & Bottom Subtitle
    this.renderOverlayGraphics(ctx, canvas.width, canvas.height);

    // 6. Render Retro Frame Overlay (if enabled)
    this.renderRetroFrame(ctx, canvas.width, canvas.height);

    ctx.restore();
  }

  // Calculate distances & trigger pinch events
  private processPinchGestures(
    landmarks: Landmark[],
    hand: HandId
  ) {
    if (landmarks.length < 21) return;

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Reference hand scale: distance between Wrist (0) and Middle MCP (9)
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];
    const handScale = Math.hypot(
      middleMCP.x - wrist.x,
      middleMCP.y - wrist.y
    ) || 0.25;

    const fingerTips: Record<FingerId, Landmark> = {
      index: indexTip,
      middle: middleTip,
      ring: ringTip,
      pinky: pinkyTip,
    };

    const now = Date.now();
    const effectiveThreshold = this.baseThreshold * this.sensitivity;
    const effectiveRelease = this.releaseThreshold * this.sensitivity;

    (['index', 'middle', 'ring', 'pinky'] as FingerId[]).forEach((finger) => {
      const tip = fingerTips[finger];
      const rawDist = Math.hypot(tip.x - thumbTip.x, tip.y - thumbTip.y);
      const normalizedDist = rawDist / handScale;

      const state = this.pinchStates[hand][finger];
      state.distance = normalizedDist;

      // Check pinch condition with hysteresis
      if (!state.isPinching && normalizedDist < effectiveThreshold) {
        if (now - state.lastTriggerTime > this.cooldownMs) {
          state.isPinching = true;
          state.lastTriggerTime = now;

          // Trigger sound and callbacks!
          this.callbacks.onTouch({
            hand,
            finger,
            timestamp: now,
            distance: normalizedDist,
          });

        }
      } else if (state.isPinching && normalizedDist > effectiveRelease) {
        // Released contact
        state.isPinching = false;
      }
    });
  }

  // Render pure Fingertip Dots & Floating Words (matching user screenshot / Finger Touch Piano aesthetic)
  private renderFingertipDotsAndWords(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    hand: HandId
  ) {
    const getScreenCoord = (lm: Landmark) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
    });

    // 1. Thumb (White Dot ●)
    const thumbCoord = getScreenCoord(landmarks[4]);
    ctx.save();
    ctx.beginPath();
    ctx.arc(thumbCoord.x, thumbCoord.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 2. Define fingers with their specific colors matching the user screenshot
    // In user screenshot:
    // Left Hand (Pinky->Index): "I"(cyan), "mochi"(coral/pink), "smile"(yellow/orange), "me"(magenta)
    // Right Hand (Index->Pinky): "you"(purple), "make"(green), "flora"(blue), "love"(teal/cyan)
    const fingerDetails: Array<{
      idx: number;
      finger: FingerId;
      color: string;
      glowColor: string;
    }> = [
      { 
        idx: 8, 
        finger: 'index', 
        color: hand === 'Left' ? '#f43f5e' : '#a855f7', // Left: Hot Magenta, Right: Violet
        glowColor: '#ec4899',
      },
      { 
        idx: 12, 
        finger: 'middle', 
        color: hand === 'Left' ? '#facc15' : '#4ade80', // Left: Amber Yellow, Right: Mint Green
        glowColor: '#fbbf24',
      },
      { 
        idx: 16, 
        finger: 'ring', 
        color: hand === 'Left' ? '#fb7185' : '#38bdf8', // Left: Coral Pink, Right: Sky Blue
        glowColor: '#f43f5e',
      },
      { 
        idx: 20, 
        finger: 'pinky', 
        color: hand === 'Left' ? '#22d3ee' : '#2dd4bf', // Left: Cyan, Right: Teal
        glowColor: '#06b6d4',
      },
    ];

    fingerDetails.forEach(({ idx, finger, color, glowColor }) => {
      const pt = getScreenCoord(landmarks[idx]);
      const isPinching = this.pinchStates[hand][finger].isPinching;
      const wordText = this.labels[hand][finger] || '';

      // --- Fingertip Dot Rendering ---
      ctx.save();
      const dotRadius = isPinching ? 6 : 4;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);

      if (isPinching) {
        // Successful pinch contact: Flash bright glowing yellow/emerald/white!
        ctx.fillStyle = '#fef08a'; // Bright yellow flash
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 24;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Normal state: Vibrant circular red/colored dot with white/dark ring
        ctx.fillStyle = '#ef4444'; // Red dot as in screenshot
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // --- Floating Word / Note Text Rendering ---
      if (wordText) {
        ctx.save();
        ctx.font = '700 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const textY = pt.y - (isPinching ? 18 : 14);

        // Dark outline for maximum readability on any background
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineJoin = 'round';
        ctx.strokeText(wordText, pt.x, textY);

        // Vibrant colored text fill
        ctx.fillStyle = isPinching ? '#ffffff' : color;
        if (isPinching) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 16;
        }
        ctx.fillText(wordText, pt.x, textY);
        ctx.restore();
      }
    });
  }

  // Optional full skeleton (only drawn if showSkeleton is toggled on)
  private renderFullHandSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    hand: HandId
  ) {
    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17],
    ];

    const getScreenCoord = (lm: Landmark) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
    });

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = hand === 'Left' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 114, 182, 0.4)';
    ctx.lineCap = 'round';

    CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = getScreenCoord(landmarks[startIdx]);
      const p2 = getScreenCoord(landmarks[endIdx]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Top Watermark & Bottom Subtitle overlay
  private renderOverlayGraphics(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // 1. Top Header Watermark (as seen in screenshot: @mia.aimaker / Finger Touch Piano)
    ctx.textAlign = 'center';
    
    // Author tag
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(this.watermarkAuthor, width / 2, 28);

    // Title
    ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 6;
    ctx.fillText(this.watermarkText, width / 2, 54);

    // 2. Bottom Spoken Sentence Subtitle (e.g. "you make flora love me smile mochi I")
    if (this.subtitleText) {
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
    }

    ctx.restore();
  }

  // Render Retro Frame Overlays (None, Frutiger Aero, Y2K VHS, Polaroid, Retro OS, Cyber Matrix)
  private renderRetroFrame(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (this.retroFrame === 'none') return;

    ctx.save();

    if (this.retroFrame === 'frutiger_aero') {
      // Frutiger Aero: Translucent Aqua Water Border with Gloss Highlights
      const borderWidth = 18;
      
      // Outer glass gradient frame
      const frameGrad = ctx.createLinearGradient(0, 0, width, height);
      frameGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      frameGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      frameGrad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');

      ctx.strokeStyle = frameGrad;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);

      // Inner crisp white border line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2);

      // Glossy curved lens reflection at top
      ctx.beginPath();
      ctx.ellipse(width / 2, borderWidth + 10, width * 0.4, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

    } else if (this.retroFrame === 'y2k_vhs') {
      // Y2K Camcorder OSD: 🔴 REC, Battery, Timecode, Safe Corners
      const margin = 24;
      const cornerLen = 28;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.5;

      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(margin, margin + cornerLen);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + cornerLen, margin);
      ctx.stroke();

      // Top-Right corner
      ctx.beginPath();
      ctx.moveTo(width - margin - cornerLen, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + cornerLen);
      ctx.stroke();

      // Bottom-Left corner
      ctx.beginPath();
      ctx.moveTo(margin, height - margin - cornerLen);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + cornerLen, height - margin);
      ctx.stroke();

      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(width - margin - cornerLen, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - cornerLen);
      ctx.stroke();

      // 🔴 REC indicator (flashing)
      const flash = Math.floor(Date.now() / 600) % 2 === 0;
      ctx.beginPath();
      ctx.arc(margin + 16, margin + 18, 6, 0, Math.PI * 2);
      ctx.fillStyle = flash ? '#ef4444' : 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('REC  SP 0:02:45', margin + 28, margin + 23);

      // Battery & Tape info
      ctx.textAlign = 'right';
      ctx.fillText('🔋 [■■■]  TAPE 100%', width - margin - 8, margin + 23);

      // Date / Timestamp at bottom left
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      ctx.textAlign = 'left';
      ctx.fillText(dateStr, margin + 8, height - margin - 10);

    } else if (this.retroFrame === 'polaroid') {
      // Polaroid Film Frame
      const sideMargin = 16;
      const topMargin = 16;
      const bottomMargin = 52;

      ctx.fillStyle = '#f8fafc'; // Crisp off-white photo paper
      // Top bar
      ctx.fillRect(0, 0, width, topMargin);
      // Left bar
      ctx.fillRect(0, 0, sideMargin, height);
      // Right bar
      ctx.fillRect(width - sideMargin, 0, sideMargin, height);
      // Bottom thick margin
      ctx.fillRect(0, height - bottomMargin, width, bottomMargin);

      // Polaroid handwritten title
      ctx.font = 'italic 600 16px "Comic Sans MS", "Caveat", cursive, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText('Finger Touch Piano Memories ✨ ' + new Date().toLocaleDateString(), width / 2, height - 18);

    } else if (this.retroFrame === 'retro_os') {
      // Windows 98 / Classic OS Desktop window
      const barHeight = 28;
      const border = 6;

      // Bevel outer borders
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, width, barHeight + border);
      ctx.fillRect(0, 0, border, height);
      ctx.fillRect(width - border, 0, border, height);
      ctx.fillRect(0, height - border, width, border);

      // Titlebar gradient (Classic Win 98 Navy Blue)
      const titleGrad = ctx.createLinearGradient(0, border, width, barHeight);
      titleGrad.addColorStop(0, '#000080');
      titleGrad.addColorStop(1, '#1084d0');
      ctx.fillStyle = titleGrad;
      ctx.fillRect(border, border, width - border * 2, barHeight);

      // Title text
      ctx.font = 'bold 12px "MS Sans Serif", Tahoma, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('🎹 Finger Touch Piano Camera Live Feed [v1.0.98]', border + 8, border + 18);

      // Window Control buttons [_ | □ | ✕]
      const btnSize = 16;
      const btnY = border + 6;
      ['✕', '□', '_'].forEach((sym, idx) => {
        const btnX = width - border - 22 - idx * 20;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(btnX, btnY, btnSize, btnSize);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(btnX, btnY, btnSize, btnSize);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sym, btnX + btnSize / 2, btnY + 12);
      });

    } else if (this.retroFrame === 'cyber_matrix') {
      // Cyber Neon Matrix HUD
      const inset = 14;
      const bracket = 36;

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;

      // 4 Tech brackets
      // TL
      ctx.beginPath();
      ctx.moveTo(inset, inset + bracket);
      ctx.lineTo(inset, inset);
      ctx.lineTo(inset + bracket, inset);
      ctx.stroke();

      // TR
      ctx.beginPath();
      ctx.moveTo(width - inset - bracket, inset);
      ctx.lineTo(width - inset, inset);
      ctx.lineTo(width - inset, inset + bracket);
      ctx.stroke();

      // BL
      ctx.beginPath();
      ctx.moveTo(inset, height - inset - bracket);
      ctx.lineTo(inset, height - inset);
      ctx.lineTo(inset + bracket, height - inset);
      ctx.stroke();

      // BR
      ctx.beginPath();
      ctx.moveTo(width - inset - bracket, height - inset);
      ctx.lineTo(width - inset, height - inset);
      ctx.lineTo(width - inset, height - inset - bracket);
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 1;
      const cx = width / 2;
      const cy = height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 15);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Particle explosion & water ripples
  private addRipple(x: number, y: number, color: string) {
    this.rippleEffects.push({
      x,
      y,
      radius: 5,
      maxRadius: 65,
      color,
      alpha: 0.9,
    });
  }

  private addParticles(x: number, y: number, color: string, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 1.0,
      });
    }
  }

  private renderEffects(ctx: CanvasRenderingContext2D) {
    // 1. Ripples
    for (let i = this.rippleEffects.length - 1; i >= 0; i--) {
      const rip = this.rippleEffects[i];
      rip.radius += 3.5;
      rip.alpha -= 0.045;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.rippleEffects.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.globalAlpha = Math.max(0, rip.alpha);
      ctx.lineWidth = 2.5;
      ctx.shadowColor = rip.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Sparkle Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // subtle gravity
      p.alpha -= 0.035;
      p.life -= 0.035;

      if (p.life <= 0 || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }
}
