
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
      setRoastContent("Something went wrong. The AI couldn't handle this level of failure.");
    } finally {
      setIsStreaming(false);
    }
  }, [inputText, style, image]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20 relative overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
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
      </div>
    </div>
  );
};

export default App;
