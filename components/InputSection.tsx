
import React, { useRef } from 'react';
import { RoastStyle, ImageData } from '../types';

interface InputSectionProps {
  text: string;
  setText: (t: string) => void;
  style: RoastStyle;
  setStyle: (s: RoastStyle) => void;
  onRoast: () => void;
  isLoading: boolean;
  image: ImageData | null;
  setImage: (img: ImageData | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  text, setText, style, setStyle, onRoast, isLoading, image, setImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          base64: reader.result as string,
          mimeType: file.type
        });
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
          placeholder="Paste code, a bio, or a bad idea..."
          className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-zinc-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as RoastStyle)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-zinc-200"
          >
            {Object.values(RoastStyle).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Image Evidence</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
          >
            {image ? 'Change Image' : 'Upload Image'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      </div>

      {image && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800">
          <img src={image.base64} alt="Target" className="w-full h-full object-cover" />
          <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
            ✕
          </button>
        </div>
      )}

      <button
        onClick={onRoast}
        disabled={isLoading || (!text.trim() && !image)}
        className="w-full py-4 rounded-xl font-bold text-lg roast-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'GENERATING BURNS...' : 'UNLEASH THE ROAST'}
      </button>
    </div>
  );
};

export default InputSection;
