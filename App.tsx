
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- TYPES ---
export enum RoastStyle {
  SAVAGE = 'Savage',
  PROFESSIONAL = 'Passive Aggressive Professional',
  PUNNY = 'Dad Jokes / Punny',
  TOUGH_LOVE = 'Tough Love Coach'
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

// --- SERVICE LOGIC ---
const getRoastPrompt = (style: RoastStyle, content: string, hasImage: boolean) => {
  return `Act as a world-class "Roast Coach". Your goal is to provide a hilarious, witty, and sharp critique of the user's input. 
  Style requested: ${style}.
  
  Instructions:
  1. Be creative and funny.
  2. If the input is code, roast the logic, naming, and indentation.
  3. If it's a design/image, roast the aesthetics and UI/UX.
  4. If it's text, roast the grammar, ego, or content.
  5. Keep it punchy. Use bullet points for specific "burns".
  6. Avoid extreme toxicity, keep it in the realm of "good-natured ribbing" but don't pull punches.
  7. If there is an image, refer to specific visual elements.
  
  Input to roast:
  ${content || (hasImage ? "Review the provided image." : "Nothing provided? Your silence is as empty as your GitHub contribution graph.")}`;
};

async function* streamRoast(
  style: RoastStyle, 
  content: string, 
  image?: ImageData
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  if (!process.env.API_KEY) {
    yield "Error: API_KEY is missing. Please set it in your environment variables.";
    return;
  }

  const prompt = getRoastPrompt(style, content, !!image);
  const parts: any[] = [{ text: prompt }];
  
  if (image) {
    parts.push({
      inlineData: {
        data: image.base64.split(',')[1],
        mimeType: image.mimeType,
      },
    });
  }

  try {
    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    yield "Error: My roast engine stalled. Maybe your input was so bad it broke the AI. Check your connection and API key.";
  }
}

// --- COMPONENTS ---

const Header: React.FC = () => (
  <header className="py-8 px-4 text-center">
    <div className="inline-block px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-4 tracking-wider uppercase">
      AI-Powered Critique
    </div>
    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
      ROAST <span className="text-transparent bg-clip-text roast-gradient">COACH</span>
    </h1>
    <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
      Upload your code, designs, or life choices. Get roasted by the most advanced (and opinionated) AI on the planet.
    </p>
  </header>
);

const InputSection: React.FC<{
  text: string;
  setText: (t: string) => void;
  style: RoastStyle;
  setStyle: (s: RoastStyle) => void;
  onRoast: () => void;
  isLoading: boolean;
  image: ImageData | null;
  setImage: (img: ImageData | null) => void;
}> = ({ text, setText, style, setStyle, onRoast, isLoading, image, setImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ base64: reader.result as string, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">What are we roasting today?</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste code, a LinkedIn bio, or just tell me your latest 'genius' idea..."
          className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-zinc-200 placeholder:text-zinc-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Critique Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as RoastStyle)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
          >
            {Object.values(RoastStyle).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Visual Evidence (Optional)</label>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {image ? 'Change Image' : 'Add Image'}
            </button>
            {image && (
              <button 
                onClick={() => setImage(null)}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl hover:bg-rose-500/20 transition-colors"
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      </div>

      {image && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800">
          <img src={image.base64} alt="Roast target" className="w-full h-full object-cover" />
        </div>
      )}

      <button
        onClick={onRoast}
        disabled={isLoading || (!text.trim() && !image)}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-[0.98] ${
          isLoading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'roast-gradient text-white hover:shadow-rose-500/20 hover:scale-[1.01]'
        }`}
      >
        {isLoading ? 'Generating Burns...' : 'UNLEASH THE ROAST'}
      </button>
    </div>
  );
};

const RoastOutput: React.FC<{ content: string; isStreaming: boolean }> = ({ content, isStreaming }) => {
  if (!content && !isStreaming) return null;
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-1 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400">
        <div className="bg-zinc-950 rounded-[calc(1rem-1px)] p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">The Verdict</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap font-medium italic">
              {content || "Analyzing your questionable decisions..."}
              {isStreaming && <span className="inline-block w-2 h-5 ml-1 bg-rose-500 animate-bounce" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

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
      setRoastContent("Something went catastrophic. Check your API key or try again later.");
    } finally {
      setIsStreaming(false);
    }
  }, [inputText, style, image]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20 selection:bg-rose-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full -translate-y-1/2"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        <Header />
        <main className="mt-8 space-y-12">
          <InputSection 
            text={inputText} setText={setInputText}
            style={style} setStyle={setStyle}
            onRoast={handleRoast} isLoading={isStreaming}
            image={image} setImage={setImage}
          />
          <RoastOutput content={roastContent} isStreaming={isStreaming} />
        </main>
      </div>
    </div>
  );
};

export default App;
