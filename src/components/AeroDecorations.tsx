import React, { useState, useEffect } from 'react';

export const AeroDecorations: React.FC = () => {
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate gentle background bubbles
    const bubbleList = Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      left: 5 + (i * 11) % 90,
      size: 20 + ((i * 17) % 35),
      duration: 12 + ((i * 3) % 10),
      delay: (i * 1.5) % 8,
    }));
    setBubbles(bubbleList);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background aquatic ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-teal-300/15 blur-3xl" />
      <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-pink-300/10 blur-3xl" />

      {/* Floating Frutiger Aero Water Orbs */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border border-white/50 backdrop-blur-[1px] opacity-40 animate-float"
          style={{
            left: `${b.left}%`,
            bottom: '-40px',
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 40%, rgba(56,189,248,0.3) 100%)',
            boxShadow: '0 4px 12px rgba(56,189,248,0.2), inset -2px -2px 4px rgba(14,165,233,0.3), inset 2px 2px 4px rgba(255,255,255,0.8)',
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* Swimming Frutiger Aero Goldfish Motif in bottom corner */}
      <div className="absolute bottom-6 right-8 opacity-25 hover:opacity-75 transition-opacity duration-300 flex items-center gap-2">
        <span className="text-3xl filter drop-shadow animate-float">🐠</span>
        <span className="text-[10px] font-digital text-sky-800 tracking-wider">AERO_AQUATIC_V1</span>
      </div>
    </div>
  );
};
