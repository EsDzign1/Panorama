import React, { useState, useRef } from 'react';
import { RoomScene, TourProject } from '../types';
import {
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  FolderOpen,
  Check,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SceneManagerModalProps {
  rooms: RoomScene[];
  currentRoomId: string;
  project: TourProject;
  onAddRoom: (room: RoomScene) => void;
  onDeleteRoom: (roomId: string) => void;
  onSelectRoom: (roomId: string) => void;
  onImportProject: (imported: TourProject) => void;
  onClose: () => void;
}

export const SceneManagerModal: React.FC<SceneManagerModalProps> = ({
  rooms,
  currentRoomId,
  project,
  onAddRoom,
  onDeleteRoom,
  onSelectRoom,
  onImportProject,
  onClose,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<RoomScene['category']>('living');
  const [newPanoramaUrl, setNewPanoramaUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (FileReader to Data URL)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG or PNG equirectangular panorama).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setNewPanoramaUrl(result);
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newPanoramaUrl.trim()) return;

    const newRoom: RoomScene = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      category: newRoomCategory,
      panoramaUrl: newPanoramaUrl.trim(),
      initialYaw: 0,
      initialPitch: 0,
      fov: 70,
      floorPlanPosition: {
        x: 20 + (rooms.length * 18) % 65,
        y: 20 + (rooms.length * 15) % 65,
      },
      description: newDescription.trim(),
      hotspots: [],
    };

    onAddRoom(newRoom);
    onSelectRoom(newRoom.id);
    setIsAddingNew(false);
    setNewRoomName('');
    setNewPanoramaUrl('');
    setPreviewImage(null);
  };

  // Export Tour Project JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/\s+/g, '-')}-tour.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Tour Project JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as TourProject;
        if (parsed.rooms && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
          onImportProject(parsed);
          onClose();
        } else {
          alert('Invalid project JSON structure.');
        }
      } catch (err) {
        alert('Could not parse project file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="scene-manager-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="scene-manager-card"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-800/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white">Room &amp; Scene Studio</h3>
              <p className="text-xs text-neutral-400">
                Manage 360° panoramas, upload custom renders, and export tour configurations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Custom 360° Scene
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                title="Export Tour Project as JSON"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>

              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                title="Restore Tour Project from JSON"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Import JSON
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </div>
          </div>

          {/* Add New Room Form Drawer */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateRoom}
              className="p-4 bg-neutral-800/60 rounded-xl border border-blue-500/30 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> New 360° Panorama Scene
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Room Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Zen Tea Room &amp; Library"
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Room Category
                  </label>
                  <select
                    value={newRoomCategory}
                    onChange={(e) => setNewRoomCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="living">Living Room</option>
                    <option value="kitchen">Kitchen &amp; Dining</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="outdoor">Balcony &amp; Terrace</option>
                    <option value="office">Home Office</option>
                    <option value="gallery">Gallery &amp; Exhibition</option>
                    <option value="custom">Custom Space</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop Panorama Upload */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  360° Equirectangular Image (2:1 aspect ratio) <span className="text-rose-400">*</span>
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-neutral-700 hover:border-blue-500/70 rounded-xl bg-neutral-850 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-6 h-6 text-neutral-400 group-hover:text-blue-400 transition-colors mb-1.5" />
                  <span className="text-xs text-neutral-300 group-hover:text-white font-medium">
                    Click to select or drag &amp; drop 360° image (JPEG/PNG)
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5">
                    Supports 4K / 2K spherical equirectangular renders from 3ds Max, Blender, SketchUp, or Coohom
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {/* Or Paste URL */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Or enter image URL:
                </label>
                <input
                  type="url"
                  value={newPanoramaUrl}
                  onChange={(e) => {
                    setNewPanoramaUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="https://example.com/panorama.jpg"
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-neutral-700">
                  <img src={previewImage} alt="Panorama Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-2 bg-black/70 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded">
                    Equirectangular Ready
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || !newPanoramaUrl.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Create Scene
                </button>
              </div>
            </form>
          )}

          {/* Current Rooms List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Tour Scenes ({rooms.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => {
                const isActive = room.id === currentRoomId;
                return (
                  <div
                    key={room.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-sky-500 bg-sky-950/20 shadow-md'
                        : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative w-16 h-12 rounded-lg bg-neutral-800 overflow-hidden shrink-0">
                      <img
                        src={room.thumbnailUrl || room.panoramaUrl}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{room.name}</h4>
                      <p className="text-[10px] text-neutral-400 capitalize">
                        {room.category} • {room.hotspots.length} hotspots
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isActive && (
                        <button
                          onClick={() => onSelectRoom(room.id)}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-[11px] font-medium rounded transition-colors"
                        >
                          View
                        </button>
                      )}
                      {rooms.length > 1 && (
                        <button
                          onClick={() => onDeleteRoom(room.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Delete scene"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
