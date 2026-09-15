import React, { useState } from 'react';
import { RoomScene, TourSettings } from '../types';
import {
  Play,
  Pause,
  Eye,
  EyeOff,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Glasses,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RoomCarouselProps {
  rooms: RoomScene[];
  currentRoomId: string;
  settings: TourSettings;
  onSelectRoom: (roomId: string) => void;
  onToggleAutoRotate: () => void;
  onToggleHotspots: () => void;
  onToggleFullscreen: () => void;
  onToggleVr: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFullscreen: boolean;
  isVrMode: boolean;
  isGyroActive?: boolean;
  onToggleGyro?: () => void;
}

export const RoomCarousel: React.FC<RoomCarouselProps> = ({
  rooms,
  currentRoomId,
  settings,
  onSelectRoom,
  onToggleAutoRotate,
  onToggleHotspots,
  onToggleFullscreen,
  onToggleVr,
  onZoomIn,
  onZoomOut,
  isFullscreen,
  isVrMode,
  isGyroActive = false,
  onToggleGyro,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  return (
    <div
      id="room-carousel-container"
      style={{ bottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))' }}
      className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-[98vw] w-max select-none pointer-events-auto"
    >
      {/* Floating Control Pill (Coohom Toolbar) */}
      <div
        id="tour-control-toolbar"
        className="flex items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-white/15 shadow-2xl text-white text-xs"
      >
        {/* Toggle Room Thumbnails Tray */}
        <button
          id="toggle-carousel-tray-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full transition-colors ${
            !isCollapsed ? 'bg-white/15 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Room List"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] sm:text-xs whitespace-nowrap"><span className="hidden xs:inline">Rooms </span>({rooms.length})</span>
          {isCollapsed ? <ChevronUp className="w-3 h-3 text-neutral-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />}
        </button>

        <div className="w-px h-4 bg-white/15 mx-0.5 shrink-0" />

        {/* Auto Rotate */}
        <button
          id="toolbar-autorotate-btn"
          onClick={onToggleAutoRotate}
          className={`p-1.5 rounded-full transition-colors shrink-0 ${
            settings.autoRotate
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title={settings.autoRotate ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
          aria-label="Auto Rotate"
        >
          {settings.autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Hotspots Visibility */}
        <button
          id="toolbar-hotspots-btn"
          onClick={onToggleHotspots}
          className={`p-1.5 rounded-full transition-colors shrink-0 ${
            settings.showHotspots
              ? 'text-neutral-200 hover:text-white hover:bg-white/10'
              : 'text-neutral-500 hover:text-neutral-300 bg-neutral-800'
          }`}
          title={settings.showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
          aria-label="Toggle Hotspots"
        >
          {settings.showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Gyroscope / Motion View (Phone tilt navigation) */}
        {onToggleGyro && (
          <button
            id="toolbar-gyro-btn"
            onClick={onToggleGyro}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              isGyroActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title={isGyroActive ? 'Disable Phone Motion / Gyro Control' : 'Enable Phone Motion / Gyro View'}
            aria-label="Phone Motion Control"
          >
            <Compass className={`w-4 h-4 ${isGyroActive ? 'animate-spin-slow' : ''}`} />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <button
            id="toolbar-zoomout-btn"
            onClick={onZoomOut}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="toolbar-zoomin-btn"
            onClick={onZoomIn}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* VR Cardboard Mode */}
        <button
          id="toolbar-vr-btn"
          onClick={onToggleVr}
          className={`p-1.5 rounded-full transition-colors shrink-0 ${
            isVrMode
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Stereoscopic VR Headset Mode"
          aria-label="VR Mode"
        >
          <Glasses className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          id="toolbar-fullscreen-btn"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Room Thumbnails Tray */}
      {!isCollapsed && (
        <div
          id="room-thumbnails-tray"
          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/15 shadow-2xl overflow-x-auto max-w-[96vw] scrollbar-none animate-in slide-in-from-bottom-2 duration-200"
        >
          {rooms.map((room) => {
            const isActive = room.id === currentRoomId;
            return (
              <button
                key={room.id}
                id={`room-thumb-btn-${room.id}`}
                onClick={() => onSelectRoom(room.id)}
                className={`group relative flex flex-col items-start rounded-xl overflow-hidden text-left transition-all duration-200 shrink-0 w-28 sm:w-36 cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-sky-400 scale-102 shadow-lg shadow-sky-500/20'
                    : 'opacity-70 hover:opacity-100 hover:scale-102'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative h-14 sm:h-18 w-full bg-neutral-800 overflow-hidden">
                  <img
                    src={room.thumbnailUrl || room.panoramaUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hotspots Count Badge */}
                  {room.hotspots.length > 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur text-[9px] font-bold text-sky-300 border border-white/10 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {room.hotspots.length}
                    </span>
                  )}
                </div>

                {/* Room Info */}
                <div className="w-full p-1 sm:p-1.5 bg-neutral-900 border-t border-white/5">
                  <span
                    className={`block text-[11px] sm:text-xs font-semibold truncate ${
                      isActive ? 'text-sky-400' : 'text-neutral-200'
                    }`}
                  >
                    {room.name}
                  </span>
                  <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-medium truncate">
                    {room.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
