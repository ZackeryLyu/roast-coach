
import React, { useRef, useEffect, useState } from 'react';
import { AppState, CapturedMedia } from '../types';

interface CameraViewProps {
  onCapture: (media: CapturedMedia) => void;
  onStartRecord: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onStartRecord, appState, setAppState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<'photo' | 'video'>('video');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("无法访问摄像头:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onCapture({ dataUrl, type: 'image', mimeType: 'image/jpeg' });
    }
  };

  const startRecording = () => {
    if (!stream) return;
    onStartRecord();
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        onCapture({ 
          dataUrl: reader.result as string, 
          type: 'video', 
          mimeType: 'video/mp4' 
        });
      };
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setAppState(AppState.RECORDING);
    
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* 录像时间显示 */}
      {appState === AppState.RECORDING && (
        <div className="absolute top-16 left-0 right-0 flex justify-center z-20">
            <div className="px-4 py-1.5 bg-red-600 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white text-xs font-black tracking-widest uppercase">REC 00:{recordingTime.toString().padStart(2, '0')}</span>
            </div>
        </div>
      )}

      {/* 底部控制中心 */}
      <div className="absolute inset-x-0 bottom-0 p-8 pb-[calc(env(safe-area-inset-bottom)+20px)] flex flex-col items-center gap-8 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        
        {/* 模式切换 */}
        <div className="flex gap-8 items-center">
            <button 
                onClick={() => setMode('photo')}
                className={`text-sm font-black tracking-widest transition-colors ${mode === 'photo' ? 'text-white' : 'text-white/40'}`}
            >
                拍照
            </button>
            <button 
                onClick={() => setMode('video')}
                className={`text-sm font-black tracking-widest transition-colors ${mode === 'video' ? 'text-white' : 'text-white/40'}`}
            >
                视频
            </button>
        </div>

        {/* 主按钮 */}
        <div className="relative flex items-center justify-center">
            {appState === AppState.IDLE && (
                <button
                    onClick={mode === 'photo' ? capturePhoto : startRecording}
                    className={`relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]`}
                >
                    <div className={`transition-all duration-300 ${mode === 'video' ? 'w-16 h-16 bg-red-600 rounded-full' : 'w-16 h-16 bg-white rounded-full'}`} />
                </button>
            )}

            {appState === AppState.RECORDING && (
                <button
                    onClick={stopRecording}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-transform"
                >
                    <div className="w-8 h-8 bg-red-600 rounded-lg animate-pulse" />
                </button>
            )}
        </div>
        
        <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">准备好迎接吐槽了吗？</p>
      </div>

      {/* 辅助对齐线 */}
      <div className="absolute inset-0 border-[1px] border-white/10 pointer-events-none m-12 rounded-[40px]" />
    </div>
  );
};

export default CameraView;
