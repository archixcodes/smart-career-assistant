import React from 'react';

export default function AudioWave({ isListening = false, isSpeaking = false }) {
  if (!isListening && !isSpeaking) return null;

  const barCount = 18;
  const color = isSpeaking ? 'bg-indigo-500' : 'bg-rose-500';

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 bg-slate-900/90 rounded-full shadow-inner">
      <span className="text-[11px] font-bold text-white mr-2 uppercase tracking-wider flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-indigo-400' : 'bg-rose-400'} animate-ping`} />
        {isSpeaking ? 'AI Voice Speaking...' : 'Listening to Speech...'}
      </span>
      {Array.from({ length: barCount }).map((_, i) => {
        // Varying height animation
        const delay = (i % 6) * 0.15;
        const duration = 0.6 + (i % 4) * 0.2;
        return (
          <div
            key={i}
            className={`w-1 rounded-full ${color}`}
            style={{
              animation: `pulse ${duration}s ease-in-out ${delay}s infinite alternate`,
              height: `${Math.max(6, (i * 7) % 24 + 8)}px`
            }}
          />
        );
      })}
    </div>
  );
}
