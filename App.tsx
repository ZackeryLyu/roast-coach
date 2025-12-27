
import React, { useState, useEffect } from 'react';
import { AppState, CapturedMedia, RoastResponse } from './types';
import CameraView from './components/CameraView';
import RoastDisplay from './components/RoastDisplay';
import { analyzeMovement } from './services/geminiService';

// 音效配置
const SOUNDS = {
  SHUTTER: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  START: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  STOP: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3'
};

const LOADING_MESSAGES = [
  "正在查阅《健身刑法典》...",
  "AI 正在屏住呼吸观看...",
  "分析结果过于震撼，处理器正在吸氧...",
  "正在联系附近的物理老师重写重力公式...",
  "正在计算你的动作与人类文明的距离...",
  "评估完成 40%：发现了一种新型的扭动方式...",
  "正在把你的视频投稿给《迷惑行为大赏》..."
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [roastResult, setRoastResult] = useState<RoastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  // 音效播放函数
  const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.4;
    audio.play().catch(e => console.debug("Audio play blocked", e));
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.navigator && window.navigator.vibrate) {
      const duration = type === 'light' ? 15 : type === 'medium' ? 30 : 60;
      window.navigator.vibrate(duration);
    }
  };

  // 轮换加载文案
  useEffect(() => {
    let interval: number;
    if (appState === AppState.ANALYZING) {
      interval = window.setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [appState]);

  const handleCapture = async (media: CapturedMedia) => {
    if (media.type === 'image') playSound(SOUNDS.SHUTTER);
    else playSound(SOUNDS.STOP);
    
    triggerHaptic('heavy');
    setCapturedMedia(media);
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const result = await analyzeMovement(media.dataUrl, media.mimeType);
      playSound(SOUNDS.SUCCESS);
      setRoastResult(result);
      setAppState(AppState.RESULT);
      triggerHaptic('medium');
    } catch (err: any) {
      playSound(SOUNDS.ERROR);
      console.error("AI 鉴定出错:", err);
      setError("AI 看了你的动作后拒绝评价... 也许是太震撼了？");
      setAppState(AppState.IDLE);
    }
  };

  const onStartRecord = () => {
    playSound(SOUNDS.START);
    triggerHaptic('light');
  };

  const handleReset = () => {
    triggerHaptic('light');
    setAppState(AppState.IDLE);
    setCapturedMedia(null);
    setRoastResult(null);
    setError(null);
  };

  return (
    <div className="relative w-full h-screen bg-black select-none overflow-hidden pt-safe pb-safe">
      {appState !== AppState.RESULT && (
        <CameraView 
            appState={appState} 
            setAppState={setAppState} 
            onCapture={handleCapture}
            onStartRecord={onStartRecord}
        />
      )}

      {appState === AppState.ANALYZING && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl px-8">
            <div className="relative mb-12">
                <div className="w-40 h-40 border-[2px] border-emerald-500/20 rounded-full animate-ping absolute" />
                <div className="w-40 h-40 border-[8px] border-emerald-500/10 rounded-full" />
                <div className="absolute top-0 left-0 w-40 h-40 border-[8px] border-emerald-500 border-t-transparent border-r-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-emerald-400 font-black text-2xl tracking-tighter">SCANNING</span>
                    <span className="text-emerald-500/50 text-[10px] font-bold">BIO-METRIC</span>
                </div>
            </div>
            <h2 className="text-white text-2xl font-black italic tracking-tighter mb-4 text-center h-8">
                {loadingMsg}
            </h2>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-progress" style={{ width: '100%' }} />
            </div>
        </div>
      )}

      {appState === AppState.RESULT && roastResult && capturedMedia && (
        <RoastDisplay 
            roast={roastResult} 
            media={capturedMedia} 
            onReset={handleReset} 
        />
      )}

      {error && (
          <div className="fixed top-20 left-6 right-6 z-50 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-10">
              {error}
          </div>
      )}

      {appState === AppState.IDLE && (
        <div className="absolute top-[calc(env(safe-area-inset-top)+20px)] left-0 right-0 text-center pointer-events-none z-20">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            <span className="text-emerald-500">ROAST</span>COACH
          </h1>
          <p className="text-[10px] font-bold text-white/30 tracking-[0.5em] mt-1">AI 毒舌运动教练 · 鉴定你的废柴时刻</p>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default App;
