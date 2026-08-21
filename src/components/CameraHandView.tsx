import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FingerId, HandId, TouchTriggerEvent, DualHandRecord, RetroFrameType } from '../types';
import { FINGER_CONFIGS, FRAME_OPTIONS } from '../utils/presets';
import { HandTrackerEngine } from '../utils/handTracker';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Sliders, 
  Hand, 
  Keyboard, 
  RotateCw, 
  Camera as PhotoIcon, 
  Video, 
  Square, 
  Palette,
  Eye,
  Download
} from 'lucide-react';

interface CameraHandViewProps {
  language: Language;
  onTouch: (event: TouchTriggerEvent) => void;
  activeFingers: DualHandRecord<boolean>;
  fingerLabels: DualHandRecord<string>;
  subLabels?: DualHandRecord<string>;
  subtitleText?: string;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const CameraHandView: React.FC<CameraHandViewProps> = ({
  language,
  onTouch,
  activeFingers,
  fingerLabels,
  subLabels,
  subtitleText = '',
  isCameraActive,
  onToggleCamera,
}) => {
  const t = TRANSLATIONS[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<HandTrackerEngine | null>(null);

  const [handDetected, setHandDetected] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<RetroFrameType>('none');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [, setLastTouchFeedback] = useState<{ hand: HandId; finger: FingerId; time: number } | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Flash notification feedback
  const [flashFeedback, setFlashFeedback] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Stable touch ref to avoid restarting camera on prop changes
  const onTouchRef = useRef(onTouch);
  onTouchRef.current = onTouch;

  // Initialize tracker once
  useEffect(() => {
    const engine = new HandTrackerEngine({
      onTouch: (evt) => {
        onTouchRef.current(evt);
        setLastTouchFeedback({ hand: evt.hand, finger: evt.finger, time: Date.now() });
      },
      onHandStatusChange: (detected, count) => {
        setHandDetected(detected);
        setHandCount(count);
      },
    });

    trackerRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  // Update dynamic properties on tracker without restarting camera
  useEffect(() => {
    if (trackerRef.current) {
      trackerRef.current.setLabels(fingerLabels);
      trackerRef.current.setSubtitle(subtitleText);
      trackerRef.current.setRetroFrame(selectedFrame);
      trackerRef.current.setShowSkeleton(showSkeleton);
    }
  }, [fingerLabels, subtitleText, selectedFrame, showSkeleton]);

  // Start / Stop camera when isCameraActive changes
  useEffect(() => {
    if (!trackerRef.current) return;

    if (isCameraActive && videoRef.current && canvasRef.current) {
      trackerRef.current.start(videoRef.current, canvasRef.current);
    } else {
      trackerRef.current.stop();
    }
  }, [isCameraActive]);

  // Manual camera restart helper
  const handleRestartCamera = useCallback(async () => {
    if (!trackerRef.current || !videoRef.current || !canvasRef.current) return;
    trackerRef.current.stop();
    await new Promise((r) => setTimeout(r, 200));
    await trackerRef.current.start(videoRef.current, canvasRef.current);
    showNotification('🔄 ' + (language === 'zh' ? '摄像头已重新启动' : 'Camera restarted'));
  }, [language]);

  // Keyboard shortcut listener for dual hands
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = e.key.toLowerCase();

      const leftKeyMap: Record<string, FingerId> = {
        a: 'index',
        s: 'middle',
        d: 'ring',
        f: 'pinky',
      };

      const rightKeyMap: Record<string, FingerId> = {
        '1': 'index',
        '2': 'middle',
        '3': 'ring',
        '4': 'pinky',
        j: 'index',
        k: 'middle',
        l: 'ring',
        ';': 'pinky',
      };

      if (leftKeyMap[key]) {
        const finger = leftKeyMap[key];
        trackerRef.current?.triggerManualTouch('Left', finger);
        setLastTouchFeedback({ hand: 'Left', finger, time: Date.now() });
      } else if (rightKeyMap[key]) {
        const finger = rightKeyMap[key];
        trackerRef.current?.triggerManualTouch('Right', finger);
        setLastTouchFeedback({ hand: 'Right', finger, time: Date.now() });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = (msg: string) => {
    setFlashFeedback(msg);
    setTimeout(() => setFlashFeedback(null), 2500);
  };

  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    trackerRef.current?.setSensitivity(val);
  };

  const handleManualClick = (hand: HandId, finger: FingerId) => {
    trackerRef.current?.triggerManualTouch(hand, finger);
    setLastTouchFeedback({ hand, finger, time: Date.now() });
  };

  // 📸 Take Snapshot / Photo from composite canvas + video
  const handleTakePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    // Trigger visual camera shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Create temporary full-resolution offscreen canvas
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = canvas.width;
    captureCanvas.height = canvas.height;
    const captureCtx = captureCanvas.getContext('2d');

    if (!captureCtx) return;

    // 1. Draw mirrored video frame if active
    if (isCameraActive && video.videoWidth > 0) {
      captureCtx.save();
      captureCtx.translate(captureCanvas.width, 0);
      captureCtx.scale(-1, 1);
      captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      captureCtx.restore();
    } else {
      // Dark gradient background if camera off
      const bgGrad = captureCtx.createLinearGradient(0, 0, 0, captureCanvas.height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#0284c7');
      captureCtx.fillStyle = bgGrad;
      captureCtx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    }

    // 2. Overlay landmark canvas (dots, words, subtitles, retro frame)
    captureCtx.drawImage(canvas, 0, 0);

    // 3. Trigger download
    try {
      const dataUrl = captureCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `Finger Touch Piano_Photo_${timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showNotification(t.photoTaken || '📸 Photo saved!');
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  };

  // 🎥 Video Recording
  const handleStartRecording = () => {
    if (!canvasRef.current || !videoRef.current) return;

    try {
      // Create a composited stream by rendering video + canvas to a hidden recording canvas loop
      const recCanvas = document.createElement('canvas');
      recCanvas.width = canvasRef.current.width || 1280;
      recCanvas.height = canvasRef.current.height || 720;
      const recCtx = recCanvas.getContext('2d');
      if (!recCtx) return;

      let isRecLoopRunning = true;
      const drawFrame = () => {
        if (!isRecLoopRunning) return;
        if (videoRef.current && isCameraActive && videoRef.current.videoWidth > 0) {
          recCtx.save();
          recCtx.translate(recCanvas.width, 0);
          recCtx.scale(-1, 1);
          recCtx.drawImage(videoRef.current, 0, 0, recCanvas.width, recCanvas.height);
          recCtx.restore();
        } else {
          recCtx.fillStyle = '#0f172a';
          recCtx.fillRect(0, 0, recCanvas.width, recCanvas.height);
        }
        if (canvasRef.current) {
          recCtx.drawImage(canvasRef.current, 0, 0);
        }
        requestAnimationFrame(drawFrame);
      };
      drawFrame();

      const stream = recCanvas.captureStream(30);
      recordedChunksRef.current = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        isRecLoopRunning = false;
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.download = `Finger Touch Piano_Video_${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(language === 'zh' ? '🎥 视频录制完成并已下载！' : '🎥 Video recorded & downloaded!');
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      showNotification('Recording error. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div 
      id="camera-hand-container"
      className="aero-glass-card rounded-3xl p-4 sm:p-5 flex flex-col gap-4 border border-white/70 shadow-2xl relative overflow-hidden"
    >
      {/* Top Bar with Camera Status & Action Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold backdrop-blur-md border ${
              !isCameraActive
                ? 'bg-slate-200/80 text-slate-700 border-slate-300'
                : handDetected
                ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300 shadow-sm'
                : 'bg-amber-100/90 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {!isCameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.cameraPaused}</span>
              </>
            ) : handDetected ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>
                  ✨ {t.handDetected} ({handCount} {t.handsCount})
                </span>
              </>
            ) : (
              <>
                <Hand className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.showHands}</span>
              </>
            )}
          </div>

          {/* Recording Timer Badge if active */}
          {isRecording && (
            <div className="px-3 py-1.5 rounded-full bg-red-500/90 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>REC {formatTime(recordingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Action buttons: Camera Toggle, Restart, Photo, Video, Settings */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Camera ON/OFF */}
          <button
            id="btn-toggle-camera"
            onClick={onToggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isCameraActive
                ? 'aero-btn text-slate-800'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
            }`}
          >
            {isCameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5 text-sky-700" />
                <span>{t.turnOffCamera}</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>{t.enableCamera}</span>
              </>
            )}
          </button>

          {/* Restart Camera */}
          {isCameraActive && (
            <button
              id="btn-restart-camera"
              onClick={handleRestartCamera}
              className="aero-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer hover:text-sky-700"
              title={t.restartCamera || 'Restart Camera'}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.restartCamera || '重启'}</span>
            </button>
          )}

          {/* Snapshot Photo Button */}
          <button
            id="btn-take-photo"
            onClick={handleTakePhoto}
            className="aero-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer hover:bg-sky-100 active:scale-95"
            title={t.photoCapture || 'Take Photo'}
          >
            <PhotoIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.photoCapture || '拍照'}</span>
          </button>

          {/* Video Record Button */}
          {!isRecording ? (
            <button
              id="btn-start-record"
              onClick={handleStartRecording}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              title={t.videoRecord || 'Record Video'}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{t.videoRecord || '录像'}</span>
            </button>
          ) : (
            <button
              id="btn-stop-record"
              onClick={handleStopRecording}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-md flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 animate-pulse"
              title={t.stopRecording || 'Stop Recording'}
            >
              <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>{t.stopRecording || '停止'}</span>
            </button>
          )}

          {/* Settings button */}
          <button
            id="btn-toggle-camera-settings"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              showSettings ? 'bg-sky-200 text-sky-900 shadow-inner' : 'aero-btn text-slate-700'
            }`}
            title="Adjust Gesture Sensitivity & Frames"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Settings: Sensitivity, Skeleton Toggle & Retro Frames */}
      {showSettings && (
        <div className="p-3.5 rounded-2xl bg-white/75 border border-white/90 backdrop-blur-md flex flex-col gap-3 text-xs text-slate-700 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Sensitivity */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{t.sensitivity}:</span>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={sensitivity}
                onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                className="accent-sky-500 cursor-pointer w-28 sm:w-36"
              />
              <span className="font-digital text-sky-700 font-bold">{sensitivity.toFixed(1)}x</span>
            </div>

            {/* Skeleton vs Fingertip-Only Toggle */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{language === 'zh' ? '骨骼显示' : 'Skeleton'}:</span>
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
                  showSkeleton
                    ? 'bg-sky-500 text-white border-sky-600'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {showSkeleton ? (t.showSkeleton || '显示骨骼') : (t.onlyFingertips || '仅指尖圆点')}
              </button>
            </div>

            {/* Shortcuts info */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Keyboard className="w-3 h-3 text-slate-400" />
              <span>{t.shortcutsInfo}</span>
            </div>
          </div>

          {/* Retro Frame Selector Toolbar */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.retroFrames || '复古边框滤镜'}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedFrame(opt.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border ${
                    selectedFrame === opt.id
                      ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-sky-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{language === 'zh' ? opt.nameZh : opt.nameEn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Video & Hand Visualizer Stage */}
      <div 
        id="camera-canvas-stage"
        className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 border-2 border-white/80 shadow-2xl flex items-center justify-center"
      >
        {/* Shutter flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none" />
        )}

        {/* Hidden / Background mirrored video element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
            isCameraActive ? 'opacity-90' : 'hidden'
          }`}
        />

        {/* Video Overlay Tint for Frutiger Aero aesthetic */}
        {isCameraActive && (
          <div className="absolute inset-0 bg-radial from-transparent via-sky-900/10 to-sky-950/30 pointer-events-none" />
        )}

        {/* Real-time Hand Landmark Canvas (Renders Fingertip Dots, Floating Words, Watermark, Subtitles, and Retro Frames) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Toast / Notification badge in stage */}
        {flashFeedback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md text-sky-200 px-4 py-2 rounded-2xl border border-white/40 text-xs font-bold shadow-xl z-30 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{flashFeedback}</span>
          </div>
        )}

        {/* Camera Off / Fallback Graphic */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center text-center p-6 z-10 text-white/90">
            <div className="relative w-20 h-20 rounded-full water-orb flex items-center justify-center mb-3 shadow-lg">
              <Hand className="w-9 h-9 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-30" />
            </div>
            <h3 className="text-base font-bold font-display text-sky-200">
              {t.interactiveTouchMode}
            </h3>
            <p className="text-xs text-sky-300/80 max-w-sm mt-1 mb-4">
              {t.cameraFallbackDesc}
            </p>
            <button
              onClick={onToggleCamera}
              className="aero-btn px-5 py-2 rounded-xl text-xs font-bold text-slate-900 flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-sky-600" />
              <span>{t.startTracking}</span>
            </button>
          </div>
        )}

        {/* Hand Guide Silhouette when camera is on but no hand found */}
        {isCameraActive && !handDetected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/20 backdrop-blur-[1px] gap-6">
            <div className="border-2 border-dashed border-sky-400/60 rounded-3xl w-36 h-48 sm:w-44 sm:h-52 flex flex-col items-center justify-center p-3 bg-sky-500/10">
              <Hand className="w-12 h-12 text-sky-300/60 mb-2 -scale-x-100" />
              <span className="text-[11px] font-medium text-sky-200 text-center">
                {t.leftHand}
              </span>
            </div>
            <div className="border-2 border-dashed border-emerald-400/60 rounded-3xl w-36 h-48 sm:w-44 sm:h-52 flex flex-col items-center justify-center p-3 bg-emerald-500/10">
              <Hand className="w-12 h-12 text-emerald-300/60 mb-2" />
              <span className="text-[11px] font-medium text-emerald-200 text-center">
                {t.rightHand}
              </span>
            </div>
          </div>
        )}

        {/* Thumb Anchor indicator */}
        {handDetected && (
          <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-[11px] text-sky-200 font-digital flex items-center gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t.pinchTip}</span>
          </div>
        )}
      </div>

      {/* Dual Hand 8-Finger Touch Pads */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
          <span>{t.fingerControls}</span>
          <span className="text-[11px] text-slate-500">{t.pinchOrTap}</span>
        </div>

        {/* Left Hand (4 pads) & Right Hand (4 pads) Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Hand Section */}
          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1">
                <span>{t.leftHand}</span>
              </span>
              <span className="text-[10px] font-digital font-bold px-2 py-0.5 rounded-md bg-white text-sky-700 border border-sky-200">
                KEYS: A · S · D · F
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['pinky', 'ring', 'middle', 'index'] as FingerId[]).map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const isActive = activeFingers.Left[fId];
                const label = fingerLabels.Left[fId];
                const sub = subLabels?.Left?.[fId];

                return (
                  <button
                    key={`left-${fId}`}
                    id={`btn-touch-left-${fId}`}
                    onClick={() => handleManualClick('Left', fId)}
                    className={`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer border ${
                      isActive
                        ? 'scale-95 shadow-inner brightness-110'
                        : 'hover:scale-[1.03] shadow-xs'
                    }`}
                    style={{
                      background: isActive
                        ? `linear-gradient(180deg, #ffffff 0%, ${config.color} 50%, #0284c7 100%)`
                        : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.8) 100%)',
                      borderColor: isActive ? config.color : 'rgba(186, 230, 253, 0.9)',
                      boxShadow: isActive
                        ? `0 0 16px ${config.glowColor}, inset 0 2px 4px rgba(0,0,0,0.2)`
                        : '0 2px 6px rgba(0,70,140,0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-digital text-slate-900 border border-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.keyShortcutLeft}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold font-display text-slate-900 tracking-tight line-clamp-1">
                      {label}
                    </span>

                    {sub && (
                      <span className="text-[9px] font-medium text-slate-500 line-clamp-1">
                        {sub}
                      </span>
                    )}

                    {isActive && (
                      <span 
                        className="absolute inset-0 rounded-xl border-2 pointer-events-none animate-ping opacity-40"
                        style={{ borderColor: config.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Hand Section */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <span>{t.rightHand}</span>
              </span>
              <span className="text-[10px] font-digital font-bold px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200">
                KEYS: 1 · 2 · 3 · 4
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['index', 'middle', 'ring', 'pinky'] as FingerId[]).map((fId) => {
                const config = FINGER_CONFIGS[fId];
                const isActive = activeFingers.Right[fId];
                const label = fingerLabels.Right[fId];
                const sub = subLabels?.Right?.[fId];

                return (
                  <button
                    key={`right-${fId}`}
                    id={`btn-touch-right-${fId}`}
                    onClick={() => handleManualClick('Right', fId)}
                    className={`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer border ${
                      isActive
                        ? 'scale-95 shadow-inner brightness-110'
                        : 'hover:scale-[1.03] shadow-xs'
                    }`}
                    style={{
                      background: isActive
                        ? `linear-gradient(180deg, #ffffff 0%, ${config.color} 50%, #059669 100%)`
                        : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,0.8) 100%)',
                      borderColor: isActive ? config.color : 'rgba(167, 243, 208, 0.9)',
                      boxShadow: isActive
                        ? `0 0 16px ${config.glowColor}, inset 0 2px 4px rgba(0,0,0,0.2)`
                        : '0 2px 6px rgba(0,90,50,0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-digital text-slate-900 border border-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.keyShortcutRight}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold font-display text-slate-900 tracking-tight line-clamp-1">
                      {label}
                    </span>

                    {sub && (
                      <span className="text-[9px] font-medium text-slate-500 line-clamp-1">
                        {sub}
                      </span>
                    )}

                    {isActive && (
                      <span 
                        className="absolute inset-0 rounded-xl border-2 pointer-events-none animate-ping opacity-40"
                        style={{ borderColor: config.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
