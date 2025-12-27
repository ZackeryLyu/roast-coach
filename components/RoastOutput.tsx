
import React from 'react';

interface RoastOutputProps {
  content: string;
  isStreaming: boolean;
}

const RoastOutput: React.FC<RoastOutputProps> = ({ content, isStreaming }) => {
  if (!content && !isStreaming) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="p-1 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 shadow-xl">
        <div className="bg-zinc-950 rounded-[calc(1rem-1px)] p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">The Verdict</h3>
          </div>
          <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap italic">
            {content}
            {isStreaming && <span className="inline-block w-2 h-5 ml-1 bg-rose-500 animate-bounce" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoastOutput;
