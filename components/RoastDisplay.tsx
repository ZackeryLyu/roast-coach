
import React, { useState, useEffect } from 'react';
import { RoastResponse, CapturedMedia } from '../types';

interface RoastDisplayProps {
  roast: RoastResponse;
  media: CapturedMedia;
  onReset: () => void;
}

const RoastDisplay: React.FC<RoastDisplayProps> = ({ roast, media, onReset }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = roast.score;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / 30));
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 30);
    
    return () => clearInterval(timer);
  }, [roast.score]);

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score > 80) return '甚至有点专业';
    if (score > 60) return '平平无奇路人甲';
    if (score > 40) return '重力在对你冷笑';
    return '建议销毁这段录像';
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = media.dataUrl;
    link.download = `RoastCoach_${roast.score}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto animate-in fade-in duration-500">
      <div className="min-h-screen flex flex-col p-6 pb-[calc(env(safe-area-inset-bottom)+120px)] pt-[env(safe-area-inset-top)]">
        
        {/* Header with Score Gauge */}
        <div className="mt-6 mb-8 flex flex-col items-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle 
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - displayScore / 100)}
                strokeLinecap="round"
                className={`${getScoreColor(displayScore)} transition-all duration-300`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-black italic tracking-tighter ${getScoreColor(displayScore)}`}>{displayScore}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Movement Score</span>
            </div>
          </div>
          <p className={`mt-4 font-black italic tracking-widest uppercase text-sm ${getScoreColor(displayScore)}`}>
            {getScoreLabel(displayScore)}
          </p>
        </div>

        {/* Media Preview Card */}
        <div className="relative w-full aspect-[4/5] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 border border-white/10 ring-1 ring-white/5">
          {media.type === 'image' ? (
            <img src={media.dataUrl} alt="Moment" className="w-full h-full object-cover brightness-[0.9]" />
          ) : (
            <video src={media.dataUrl} autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.9]" />
          )}
          
          <div className="absolute top-6 left-6 flex gap-2">
             <div className="px-3 py-1 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Evidence
             </div>
             <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                Analyzed by AI
             </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="text-emerald-500 font-black text-xs tracking-[0.3em] mb-2 uppercase">AI 获得勋章</div>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter italic leading-none">{roast.nickName}</h3>
            <div className="flex flex-wrap gap-2">
              {roast.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-xl rounded-xl text-[11px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">#{tag.replace('#','')}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Roast Comment Box */}
        <div className="bg-[#1c1c1e] rounded-[32px] p-8 border border-white/5 mb-8 relative">
          <div className="absolute -top-3 left-8 px-4 py-1 bg-white text-black text-[10px] font-black rounded-full uppercase tracking-widest">鉴定结论</div>
          <p className="text-xl leading-relaxed font-bold text-gray-100 italic">
            “{roast.comment}”
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+20px)] flex gap-3 z-50">
          <button 
            onClick={onReset}
            className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center active:scale-90 transition-transform border border-white/10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button 
            onClick={downloadImage}
            className="flex-1 h-14 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center active:scale-95 transition-transform border border-white/10"
          >
            保存海报
          </button>
          <button 
            onClick={handleShare}
            className="flex-[2] h-14 rounded-2xl bg-emerald-500 text-black font-black flex items-center justify-center active:scale-95 transition-transform shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
          >
            分享朋友圈
          </button>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-end justify-center" onClick={() => setShowShareModal(false)}>
          <div className="bg-[#1c1c1e] w-full rounded-t-[40px] p-8 pb-[calc(env(safe-area-inset-bottom)+20px)] animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-black text-white italic tracking-tight uppercase">朋友圈分享</span>
                <button 
                    className="px-8 py-2 bg-[#07C160] text-white rounded-full font-black tracking-widest text-sm"
                    onClick={() => {
                        alert("已成功生成分享链接！");
                        setShowShareModal(false);
                    }}
                >
                    发表
                </button>
            </div>
            <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <textarea 
                        className="w-full bg-transparent text-lg text-white border-none focus:ring-0 resize-none h-24 placeholder:text-gray-600"
                        placeholder="想对大家（和AI）说点什么..."
                        autoFocus
                        defaultValue={`救命，这个AI说我是“${roast.nickName}”，我不要面子的吗？！😂 #RoastCoach #运动鉴定 #AI毒舌`}
                    />
                </div>
                <div className="flex gap-4 items-start">
                    <div className="w-24 h-32 rounded-xl bg-gray-800 overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                        {media.type === 'image' ? (
                          <img src={media.dataUrl} className="w-full h-full object-cover" />
                        ) : (
                          <video src={media.dataUrl} className="w-full h-full object-cover" muted playsInline />
                        )}
                    </div>
                    <div className="space-y-3 pt-2">
                         <div className="flex items-center gap-2 text-white/50 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                            <span>📍 宇宙尽头的健身房</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                            <span>👥 公开</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoastDisplay;
