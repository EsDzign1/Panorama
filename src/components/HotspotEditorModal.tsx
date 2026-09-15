import React, { useState } from 'react';
import { Hotspot, HotspotType, RoomScene } from '../types';
import { X, Trash2, ArrowUpRight, Tag, Info, Compass } from 'lucide-react';

interface HotspotEditorModalProps {
  hotspot: Partial<Hotspot>;
  rooms: RoomScene[];
  currentRoomId: string;
  onSave: (hotspot: Hotspot) => void;
  onDelete?: (hotspotId: string) => void;
  onClose: () => void;
}

export const HotspotEditorModal: React.FC<HotspotEditorModalProps> = ({
  hotspot,
  rooms,
  currentRoomId,
  onSave,
  onDelete,
  onClose,
}) => {
  const [type, setType] = useState<HotspotType>(hotspot.type || 'navigation');
  const [title, setTitle] = useState(hotspot.title || '');
  const [description, setDescription] = useState(hotspot.description || '');
  const [targetRoomId, setTargetRoomId] = useState(
    hotspot.targetRoomId || rooms.find((r) => r.id !== currentRoomId)?.id || ''
  );
  const [price, setPrice] = useState(hotspot.price || '');
  const [brand, setBrand] = useState(hotspot.brand || '');
  const [dimensions, setDimensions] = useState(hotspot.dimensions || '');
  const [material, setMaterial] = useState(hotspot.material || '');
  const [productUrl, setProductUrl] = useState(hotspot.productUrl || '');
  const [imageUrl, setImageUrl] = useState(hotspot.imageUrl || '');
  const [yaw, setYaw] = useState(Math.round(hotspot.yaw ?? 0));
  const [pitch, setPitch] = useState(Math.round(hotspot.pitch ?? 0));
  const [customColor, setCustomColor] = useState(hotspot.customColor || '#3b82f6');

  const otherRooms = rooms.filter((r) => r.id !== currentRoomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedHotspot: Hotspot = {
      id: hotspot.id || `hotspot-${Date.now()}`,
      type,
      title: title.trim(),
      description: description.trim(),
      yaw,
      pitch,
      customColor,
      ...(type === 'navigation' && { targetRoomId }),
      ...(type === 'product' && {
        price: price.trim(),
        brand: brand.trim(),
        dimensions: dimensions.trim(),
        material: material.trim(),
        productUrl: productUrl.trim(),
        imageUrl: imageUrl.trim(),
      }),
    };

    onSave(savedHotspot);
  };

  return (
    <div
      id="hotspot-editor-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="hotspot-editor-card"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-800/50">
          <div>
            <h3 className="text-base font-bold text-white">
              {hotspot.id ? 'Edit Hotspot' : 'Add New 360° Hotspot'}
            </h3>
            <p className="text-xs text-neutral-400">
              Placed at Spherical coordinates: Yaw {yaw}°, Pitch {pitch}°
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Hotspot Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('navigation');
                  setCustomColor('#3b82f6');
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'navigation'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
                Teleport Room
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('product');
                  setCustomColor('#f43f5e');
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'product'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <Tag className="w-5 h-5" />
                Product Tag
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('info');
                  setCustomColor('#10b981');
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'info'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <Info className="w-5 h-5" />
                Design Note
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'navigation'
                  ? 'e.g. Gourmet Kitchen & Dining'
                  : type === 'product'
                  ? 'e.g. Camaleonda Bouclé Sofa'
                  : 'e.g. Architectural Slatted Wall'
              }
              className="w-full px-3.5 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Navigation Target Room */}
          {type === 'navigation' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Destination Room
              </label>
              {otherRooms.length > 0 ? (
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {otherRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/50">
                  You only have 1 room. Create another room in Scene Manager to link them together!
                </p>
              )}
            </div>
          )}

          {/* Product Specific Fields */}
          {type === 'product' && (
            <div className="space-y-3 p-3.5 bg-neutral-800/50 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="$2,450"
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Brand / Designer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="B&B Italia"
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="240cm × 100cm × 70cm"
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Material / Finish
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Walnut / Bouclé"
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Product Purchase / Catalog Link
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add architectural notes, specifications, or details..."
              className="w-full px-3.5 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Fine Tuning Coordinates */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Yaw (0° - 360°)</span>
                <span className="font-mono text-white">{yaw}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={yaw}
                onChange={(e) => setYaw(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Pitch (-85° to 85°)</span>
                <span className="font-mono text-white">{pitch}°</span>
              </div>
              <input
                type="range"
                min="-85"
                max="85"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Marker Color:</span>
            {['#3b82f6', '#f43f5e', '#10b981', '#d97706', '#8b5cf6', '#06b6d4'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setCustomColor(col)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  customColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            {hotspot.id && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(hotspot.id!)}
                className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/40 transition-colors"
              >
                {hotspot.id ? 'Update Hotspot' : 'Place Hotspot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
