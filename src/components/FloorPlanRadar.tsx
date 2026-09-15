import React, { useState } from 'react';
import { RoomScene } from '../types';
import { MapPin, Maximize2, Minimize2, Compass, Layers } from 'lucide-react';

interface FloorPlanRadarProps {
  rooms: RoomScene[];
  currentRoomId: string;
  currentYaw: number; // 0 to 360 degrees
  northOffset?: number;
  onSelectRoom: (roomId: string) => void;
}

export const FloorPlanRadar: React.FC<FloorPlanRadarProps> = ({
  rooms,
  currentRoomId,
  currentYaw,
  northOffset = 0,
  onSelectRoom,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const activeRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  // Radar heading angle (yaw rotated by northOffset)
  const radarRotation = (currentYaw + northOffset) % 360;

  if (isMinimized) {
    return (
      <button
        id="floorplan-minimized-btn"
        onClick={() => setIsMinimized(false)}
        className="absolute bottom-24 left-4 z-30 p-2.5 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-xl backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-2 text-xs font-semibold transition-all duration-200 hover:scale-105"
        title="Open Floor Plan Radar"
      >
        <Layers className="w-4 h-4 text-sky-400" />
        <span>Floor Plan</span>
      </button>
    );
  }

  return (
    <div
      id="floorplan-widget"
      className={`absolute bottom-24 left-4 z-30 bg-neutral-950/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-80 sm:w-96 h-80' : 'w-56 sm:w-64 h-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold text-white tracking-wide">Floor Plan</span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {Math.round(radarRotation)}°
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="floorplan-toggle-size-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Shrink' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            id="floorplan-minimize-btn"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <span className="text-xs font-bold px-0.5">_</span>
          </button>
        </div>
      </div>

      {/* Blueprint Canvas Container */}
      <div className="relative w-full h-[calc(100%-36px)] p-2 bg-neutral-900/60 flex items-center justify-center select-none">
        {/* Architectural Blueprint Vector Outline */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full stroke-neutral-700 fill-none"
          style={{ strokeWidth: 1 }}
        >
          {/* Outer Penthouse Walls */}
          <rect x="8" y="8" width="84" height="84" rx="3" stroke="#475569" strokeWidth="1.8" fill="#1e293b20" />
          
          {/* Room Partitions */}
          {/* Master Suite partition (top-left) */}
          <line x1="8" y1="45" x2="48" y2="45" stroke="#475569" strokeWidth="1.4" strokeDasharray="3 1" />
          <line x1="48" y1="8" x2="48" y2="45" stroke="#475569" strokeWidth="1.4" />
          {/* Kitchen / Living Room partition (right side) */}
          <line x1="62" y1="45" x2="92" y2="45" stroke="#475569" strokeWidth="1.4" />
          {/* Balcony Deck partition */}
          <line x1="55" y1="8" x2="92" y2="8" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="55" y1="8" x2="55" y2="35" stroke="#475569" strokeWidth="1.2" />

          {/* Compass Rose in Corner */}
          <g transform="translate(85, 85)">
            <circle r="6" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
            <text x="-1.8" y="-1.5" fontSize="4" fill="#38bdf8" fontWeight="bold">N</text>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="0.6" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="0.6" />
          </g>
        </svg>

        {/* Room Pins and Dynamic Radar Vision Cone */}
        {rooms.map((room) => {
          const isActive = room.id === currentRoomId;
          const posX = room.floorPlanPosition?.x ?? 50;
          const posY = room.floorPlanPosition?.y ?? 50;

          return (
            <div
              key={room.id}
              className="absolute"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Radar Vision Cone (Only on Active Room) */}
              {isActive && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-28 h-28 flex items-center justify-center transition-transform duration-75"
                  style={{
                    left: 0,
                    top: 0,
                    transform: `rotate(${radarRotation}deg)`,
                  }}
                >
                  {/* Glowing Radar Light Field / Angle of View (65 deg wedge) */}
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* 60-degree viewing cone projecting forward */}
                    <path
                      d="M 50 50 L 18 2 M 50 50 L 82 2 A 50 50 0 0 0 18 2 Z"
                      fill="url(#radarGlow)"
                      stroke="#38bdf8"
                      strokeWidth="0.75"
                      strokeDasharray="2 1"
                    />
                  </svg>
                </div>
              )}

              {/* Pin Button */}
              <button
                id={`floorplan-pin-${room.id}`}
                onClick={() => onSelectRoom(room.id)}
                className={`relative group flex items-center justify-center rounded-full transition-all duration-200 z-10 cursor-pointer ${
                  isActive
                    ? 'w-5 h-5 bg-sky-500 text-white shadow-lg ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-110'
                    : 'w-4 h-4 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:scale-115'
                }`}
                title={room.name}
              >
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 group-hover:bg-white" />
                )}

                {/* Floating Room Label Tooltip */}
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-950/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {room.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="px-3 py-1.5 bg-neutral-950 text-[10px] text-neutral-400 flex items-center justify-between border-t border-white/5">
        <span className="truncate max-w-[150px] font-medium text-sky-400">
          ● {activeRoom.name}
        </span>
        <span className="text-neutral-500">Click room to teleport</span>
      </div>
    </div>
  );
};
