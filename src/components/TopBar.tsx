import React from 'react';
import { TourProject } from '../types';
import {
  Code,
  FolderOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Wand2,
  Compass,
  Share2,
} from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface TopBarProps {
  project: TourProject;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenSceneManager: () => void;
  onOpenEmbedModal: () => void;
  bgAudioEnabled: boolean;
  bgAudioVolume: number;
  onToggleAudio: () => void;
  onAudioVolumeChange: (vol: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isEmbedView: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  isEditMode,
  onToggleEditMode,
  onOpenSceneManager,
  onOpenEmbedModal,
  bgAudioEnabled,
  bgAudioVolume,
  onToggleAudio,
  onAudioVolumeChange,
  isFullscreen,
  onToggleFullscreen,
  isEmbedView,
}) => {
  // If in minimal embed view, we show a clean floating badge instead of the full header
  if (isEmbedView) {
    return (
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 select-none pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur-md border border-white/15 shadow-xl text-white">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight">{project.title}</span>
        </div>
      </div>
    );
  }

  return (
    <header
      id="coohom-topbar"
      className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between pointer-events-none select-none bg-gradient-to-b from-neutral-950/85 via-neutral-950/40 to-transparent"
    >
      {/* Left: Project Branding & Title */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto min-w-0">
        {/* Coohom-style Logo Mark */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 flex-shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-neutral-950/40 rounded-[10px] flex items-center justify-center text-white">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight drop-shadow truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
              {project.title}
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              360° Tour
            </span>
          </div>
          <p className="hidden sm:flex text-[11px] text-neutral-300 font-medium drop-shadow items-center gap-1.5">
            <span>{project.designer}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">{project.viewCount.toLocaleString()} views</span>
          </p>
        </div>
      </div>

      {/* Right: Actions & Tool Toggles */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-shrink-0">
        {/* Mode Switcher: Explore vs Hotspot Studio */}
        <div className="hidden sm:flex items-center p-0.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-xs">
          <button
            id="mode-explore-btn"
            onClick={() => isEditMode && onToggleEditMode()}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              !isEditMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Explore
          </button>
          <button
            id="mode-studio-btn"
            onClick={() => !isEditMode && onToggleEditMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
              isEditMode
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3 h-3" />
            Hotspot Studio
          </button>
        </div>

        {/* Ambient Sound */}
        <AudioPlayer
          isEnabled={bgAudioEnabled}
          volume={bgAudioVolume}
          onToggle={onToggleAudio}
          onVolumeChange={onAudioVolumeChange}
        />

        {/* Scene Manager */}
        <button
          id="topbar-scenes-btn"
          onClick={onOpenSceneManager}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-neutral-200 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 shadow-lg transition-colors"
          title="Manage Tour Scenes and Panoramas"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Scenes</span>
        </button>

        {/* Embed & Share Studio */}
        <button
          id="topbar-embed-btn"
          onClick={onOpenEmbedModal}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold backdrop-blur-md shadow-lg shadow-blue-900/30 transition-colors cursor-pointer"
          title="Get Embed iFrame Code &amp; Integration Options"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Embed / Share</span>
          <span className="sm:hidden text-[11px]">Share</span>
        </button>

        {/* Fullscreen */}
        <button
          id="topbar-fullscreen-btn"
          onClick={onToggleFullscreen}
          className="p-1.5 sm:p-2 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
