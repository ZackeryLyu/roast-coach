
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import RoastOutput from './components/RoastOutput';
import { RoastStyle, ImageData } from './types';
import { streamRoast } from './services/geminiService';

declare global {
  // Define the AIStudio interface for platform integration.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Modifier conflict fix: Mark as optional to match platform's global window definition.
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

  useEffect(() => {
    const checkKey = async () => {
      // Check if the user has already selected an API key via the platform dialog.
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setNeedsKey(!hasKey);
        } catch (e) {
          console.error("Error checking key selection:", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Mitigate race condition: assume selection was successful after triggering the dialog.
        setNeedsKey(false);
      } catch (e) {
        console.error("Error opening key selector:", e);
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
      const errorMsg = error.message || "";
      
      if (errorMsg === "MISSING_API_KEY") {
        if (window.aistudio) {
          setNeedsKey(true);
          setRoastContent("Selection required: Please select an API key using the button above to continue.");
        } else {
          setRoastContent("Deployment Error: API_KEY is missing from your environment variables.");
        }
      } else if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API_KEY")) {
        // Reset key selection state and prompt for re-selection if the key is invalid or not found.
        setNeedsKey(true);
        setRoastContent("The API key provided is invalid or doesn't have access to this model. Please re-select or check your credentials.");
      } else {
        setRoastContent(`Roast Engine Error: ${errorMsg || "The AI is currently speechless. Check your network or API quota."}`);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [inputText, style, image]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20 relative overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        <Header />
        
        {needsKey && window.aistudio && (
          <div className="max-w-3xl mx-auto mb-8 p-6 glass-panel rounded-2xl border-rose-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Gemini 3 Key Required</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-md">
              You are running in a restricted environment. Please select a paid project API key to unleash the full power of Gemini 3.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline ml-1">Docs</a>
            </p>
            <button 
              onClick={handleOpenSelectKey}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Select API Key
            </button>
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
