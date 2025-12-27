
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import RoastOutput from './components/RoastOutput';
import { RoastStyle, ImageData } from './types';
import { streamRoast } from './services/geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<RoastStyle>(RoastStyle.SAVAGE);
  const [image, setImage] = useState<ImageData | null>(null);
  const [roastContent, setRoastContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch roast:", error);
      setRoastContent("Something went catastrophic. Even the AI is speechless. Check your API key or try again later.");
    } finally {
      setIsStreaming(false);
    }
  }, [inputText, style, image]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20 selection:bg-rose-500/30">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        <Header />
        
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
        
        <footer className="mt-24 text-center text-zinc-600 text-sm">
          <p>© {new Date().getFullYear()} Roast Coach. Handle with care, ego may vary.</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50 font-mono">Powered by Gemini 3 Pro</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
