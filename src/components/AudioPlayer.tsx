import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface AudioPlayerProps {
  isEnabled: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (vol: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isEnabled,
  volume,
  onToggle,
  onVolumeChange,
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);

  // Web Audio Ambient Synthesizer
  const startSynth = () => {
    if (isPlayingRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Create peaceful atmospheric chord frequencies: C3, G3, B3, E4
      const freqs = [130.81, 196.0, 246.94, 329.63];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Low pass filter for warm, cozy architectural tone
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + idx * 80, ctx.currentTime);

        // Slow LFO for gentle breathing swell
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.03, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start();
      });

      isPlayingRef.current = true;
    } catch (err) {
      console.warn('Audio synthesis could not start:', err);
    }
  };

  const stopSynth = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      gainNodeRef.current = null;
    }
    isPlayingRef.current = false;
  };

  useEffect(() => {
    if (isEnabled) {
      startSynth();
    } else {
      stopSynth();
    }
    return () => {
      stopSynth();
    };
  }, [isEnabled]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        volume * 0.15,
        audioCtxRef.current.currentTime,
        0.1
      );
    }
  }, [volume]);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        id="bg-audio-toggle-btn"
        onClick={onToggle}
        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
          isEnabled
            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            : 'bg-neutral-900/70 text-neutral-400 border-white/10 hover:text-white'
        }`}
        title={isEnabled ? 'Mute Background Ambience' : 'Play Background Ambience'}
        aria-label="Background Audio"
      >
        {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Floating Volume Slider on Hover */}
      {showSlider && isEnabled && (
        <div className="absolute left-full ml-2 px-3 py-1.5 bg-neutral-900/90 border border-white/10 rounded-xl shadow-xl flex items-center gap-2 z-40 backdrop-blur">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1 accent-sky-400 bg-neutral-700 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-neutral-400 font-mono">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
