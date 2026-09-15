import React, { useEffect } from 'react';
import { Hotspot } from '../types';
import { X, ExternalLink, Tag, Info, Layers, Maximize2, ShieldCheck, ShoppingBag } from 'lucide-react';

interface HotspotModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
}

export const HotspotModal: React.FC<HotspotModalProps> = ({ hotspot, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hotspot) return null;

  const isProduct = hotspot.type === 'product';

  return (
    <div
      id="hotspot-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="hotspot-modal-card"
        className="relative w-full max-w-lg bg-neutral-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="hotspot-modal-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Media Header */}
        {hotspot.imageUrl && (
          <div className="relative h-56 w-full bg-neutral-800 overflow-hidden group">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30" />
            
            {hotspot.brand && (
              <span className="absolute bottom-3 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-semibold uppercase tracking-wider text-rose-300 border border-white/10">
                {hotspot.brand}
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isProduct ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/20">
                    <Tag className="w-3 h-3" /> Designer Furnishing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Info className="w-3 h-3" /> Architectural Specification
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {hotspot.title}
              </h2>
            </div>

            {hotspot.price && (
              <div className="text-right shrink-0">
                <div className="text-xl font-extrabold text-emerald-400">
                  {hotspot.price}
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  MSRP / Est. Cost
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {hotspot.description && (
            <p className="mt-4 text-sm text-neutral-300 leading-relaxed">
              {hotspot.description}
            </p>
          )}

          {/* Product Specifications Grid */}
          {(hotspot.dimensions || hotspot.material) && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-neutral-800/60 rounded-xl border border-white/5 text-xs">
              {hotspot.dimensions && (
                <div className="flex items-start gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Dimensions</span>
                    <span className="text-neutral-200">{hotspot.dimensions}</span>
                  </div>
                </div>
              )}
              {hotspot.material && (
                <div className="flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Materials &amp; Finish</span>
                    <span className="text-neutral-200">{hotspot.material}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Architectural Asset
            </div>

            <div className="flex items-center gap-2">
              {hotspot.productUrl ? (
                <a
                  href={hotspot.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> View Product <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Close Detail
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
