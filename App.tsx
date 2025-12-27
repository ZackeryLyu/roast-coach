
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import RoastOutput from './components/RoastOutput';
import { RoastStyle, ImageData } from './types';
import { streamRoast } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<RoastStyle>(RoastStyle.SAVAGE);
  const [image, setImage] = useState<ImageData | null>(null);
  const [roastContent, setRoastContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  // Initial key state check
  useEffect(() => {
    const checkKeyStatus = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setNeedsKey(!hasKey);
        } catch (e) {
          setNeedsKey(true);
        }
      } else {
        // Standalone environment check
        try {
          if (!process.env.API_KEY) {
            setNeedsKey(true);
          }
        } catch {
          setNeedsKey(true);
        }
      }
    };
    checkKeyStatus();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Per guidelines, assume success and proceed to app state
        setNeedsKey(false);
      } catch (e) {
        console.error("Failed to open key selector:", e);
      }
    }
  };

  const handleRoast = useCallback(async () => {
    if (!inputText.trim() && !image) return;

    setRoastContent('');
    setIsStreaming(true);

    try {
      const streamer = streamRoast(style, inputText, image || undefined);
      let fullText = '';
      
      for await (const chunk of streamer) {
        fullText += chunk;
        setRoastContent(fullText);
      }
    } catch (error: any) {
      console.error("App Roast Error:", error);
      const msg = error.message || "";
      
      // Handle the specific error indicating a missing or invalid key
      if (msg.includes("API_KEY_NOT_FOUND") || msg.includes("API_KEY") || msg.includes("Requested entity was not found")) {
        setNeedsKey(true);
        if (window.aistudio) {
          setRoastContent("Please use the button at the top to select an API key.");
        } else {
          setRoastContent("Deployment Error: API_KEY environment variable is missing. Check your project settings.");
        }
      } else {
        setRoastContent(`Roast Engine Error: ${msg || "Unknown error occurred."}`);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [inputText, style, image]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20 relative overflow-x-hidden">
      {/* Dynamic background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        <Header />
        
        {needsKey && (
          <div className="max-w-3xl mx-auto mb-8 p-6 glass-panel rounded-2xl border-rose-500/30 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
            {window.aistudio ? (
              <>
                <p className="text-zinc-400 text-sm mb-6 max-w-md">
                  Gemini 3 Pro reasoning models require a valid API key selection from your project list.
                </p>
                <button 
                  onClick={handleOpenSelectKey}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-rose-500/30 active:scale-95"
                >
                  Select API Key
                </button>
              </>
            ) : (
              <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                No <code className="bg-zinc-800 px-1.5 rounded text-rose-400">API_KEY</code> detected. 
                Please add it to your project's environment variables (e.g., Vercel Dashboard) to enable the AI engine.
              </p>
            )}
          </div>
        )}

        <main className="mt-8 space-y-12">
          <InputSection 
            text={inputText}
            setText={setInputText}
            style={style}
            setStyle={setStyle}
            onRoast={handleRoast}
            isLoading={isStreaming}
            image={image}
            setImage={setImage}
          />
          
          <RoastOutput 
            content={roastContent}
            isStreaming={isStreaming}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
