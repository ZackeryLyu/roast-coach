
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 text-center">
      <div className="inline-block px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-4 tracking-wider uppercase">
        AI-Powered Critique
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
        ROAST <span className="text-transparent bg-clip-text roast-gradient">COACH</span>
      </h1>
      <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
        Upload your code, designs, or life choices. Get roasted by the most advanced AI on the planet.
      </p>
    </header>
  );
};

export default Header;
