import React, { useState } from 'react';
import { Hotspot, RoomScene } from '../types';
import { ArrowUpRight, Tag, Info, Compass, Sparkles, ExternalLink, Move } from 'lucide-react';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  screenX: number;
  screenY: number;
  isVisible: boolean;
  isEditMode: boolean;
  targetRoom?: RoomScene;
  onClick: () => void;
  onEdit?: () => void;
}

export const HotspotMarker: React.FC<HotspotMarkerProps> = ({
  hotspot,
  screenX,
  screenY,
  isVisible,
  isEditMode,
  targetRoom,
  onClick,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  // Custom accent color or defaults based on type
  const accentColor = hotspot.customColor || (
    hotspot.type === 'navigation' ? '#3b82f6' :
    hotspot.type === 'product' ? '#f43f5e' :
    hotspot.type === 'info' ? '#10b981' : '#8b5cf6'
  );

  return (
    <div
      id={`hotspot-${hotspot.id}`}
      className="absolute top-0 left-0 pointer-events-auto select-none z-20"
      style={{
        transform: `translate3d(${screenX}px, ${screenY}px, 0px) translate(-50%, -50%)`,
        transition: 'opacity 0.2s ease-out',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Pulsing Aura */}
      <div
        className="absolute -inset-2.5 rounded-full animate-ping opacity-40 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Main Hotspot Button */}
      <button
        id={`hotspot-btn-${hotspot.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`relative group flex items-center justify-center rounded-full shadow-xl transition-all duration-200 cursor-pointer ${
          isEditMode
            ? 'ring-2 ring-amber-400 bg-amber-500 hover:scale-110'
            : 'hover:scale-115 active:scale-95'
        }`}
        style={{
          width: hotspot.type === 'navigation' ? 44 : 38,
          height: hotspot.type === 'navigation' ? 44 : 38,
          backgroundColor: isEditMode ? '#d97706' : accentColor,
          boxShadow: `0 0 16px ${accentColor}80, 0 4px 12px rgba(0,0,0,0.35)`,
        }}
        title={hotspot.title}
        aria-label={hotspot.title}
      >
        {/* Inner glow circle */}
        <div className="absolute inset-1 rounded-full bg-white/25 border border-white/40" />

        {/* Dynamic Icon */}
        <div className="relative text-white flex items-center justify-center">
          {hotspot.type === 'navigation' ? (
            <ArrowUpRight className="w-5 h-5 drop-shadow group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          ) : hotspot.type === 'product' ? (
            <Tag className="w-4 h-4 drop-shadow" />
          ) : hotspot.type === 'info' ? (
            <Info className="w-4 h-4 drop-shadow" />
          ) : (
            <ExternalLink className="w-4 h-4 drop-shadow" />
          )}
        </div>

        {/* Small badge indicator for products */}
        {hotspot.type === 'product' && hotspot.price && (
          <span className="absolute -bottom-1 -right-2 bg-neutral-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white/30 shadow-md">
            {hotspot.price}
          </span>
        )}
      </button>

      {/* Hover Card / Tooltip */}
      {(isHovered || isEditMode) && (
        <div
          className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-max max-w-[240px] bg-neutral-900/90 backdrop-blur-md text-white rounded-xl p-2.5 shadow-2xl border border-white/15 pointer-events-auto z-30 transition-all duration-200"
          style={{ transformOrigin: 'bottom center' }}
        >
          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-neutral-900/90" />

          {/* Navigation Preview */}
          {hotspot.type === 'navigation' && targetRoom ? (
            <div className="flex flex-col gap-1 text-center">
              <div className="text-[11px] font-medium tracking-wide uppercase text-sky-400 flex items-center justify-center gap-1">
                <Compass className="w-3 h-3" /> Teleport To
              </div>
              <div className="text-xs font-semibold text-white">
                {targetRoom.name}
              </div>
              <div className="text-[10px] text-neutral-400">
                Click to explore room
              </div>
            </div>
          ) : hotspot.type === 'product' ? (
            <div className="flex items-center gap-2.5">
              {hotspot.imageUrl && (
                <img
                  src={hotspot.imageUrl}
                  alt={hotspot.title}
                  className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  {hotspot.brand || 'Featured Item'}
                </span>
                <span className="text-xs font-semibold text-white truncate">
                  {hotspot.title}
                </span>
                {hotspot.price && (
                  <span className="text-xs font-bold text-emerald-400">
                    {hotspot.price}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Architectural Detail
              </span>
              <span className="text-xs font-medium text-neutral-100">
                {hotspot.title}
              </span>
            </div>
          )}

          {/* Edit Mode quick actions */}
          {isEditMode && onEdit && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] text-amber-400 font-mono">
                {Math.round(hotspot.yaw)}° / {Math.round(hotspot.pitch)}°
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-[10px] px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded flex items-center gap-1"
              >
                <Move className="w-3 h-3" /> Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
