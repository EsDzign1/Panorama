import React, { useState, useEffect, useCallback } from 'react';
import { initialTourProject } from './data/defaultTour';
import { Hotspot, RoomScene, TourProject } from './types';
import { PanoramaViewer } from './components/PanoramaViewer';
import { FloorPlanRadar } from './components/FloorPlanRadar';
import { RoomCarousel } from './components/RoomCarousel';
import { TopBar } from './components/TopBar';
import { HotspotModal } from './components/HotspotModal';
import { HotspotEditorModal } from './components/HotspotEditorModal';
import { EmbedModal } from './components/EmbedModal';
import { SceneManagerModal } from './components/SceneManagerModal';

export default function App() {
  // Load Project from localStorage or default
  const [project, setProject] = useState<TourProject>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('coohom_tour_project_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.rooms && parsed.rooms.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to load project from localStorage');
      }
    }
    return initialTourProject;
  });

  // Current Active Room ID
  const [currentRoomId, setCurrentRoomId] = useState<string>(() => {
    // Check URL params for starting room
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && project.rooms.some((r) => r.id === urlRoom)) {
        return urlRoom;
      }
    }
    return project.defaultRoomId || project.rooms[0]?.id || 'room-living';
  });

  // Check if loaded in Embed Mode
  const [isEmbedView, setIsEmbedView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('embed') === 'true';
    }
    return false;
  });

  // Embed URL parameters overrides
  const [controlsLevel, setControlsLevel] = useState<'full' | 'minimal' | 'clean'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lvl = params.get('controls');
      if (lvl === 'full' || lvl === 'minimal' || lvl === 'clean') return lvl;
    }
    return 'full';
  });

  // Tour Settings State
  const [settings, setSettings] = useState(project.settings);

  // Runtime View & Interaction States
  const [currentYaw, setCurrentYaw] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVrMode, setIsVrMode] = useState<boolean>(false);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);

  // Mobile Gyroscope / Motion Sensor Toggle
  const handleToggleGyro = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setIsGyroActive((prev) => !prev);
        } else {
          alert('Motion sensor permission was not granted.');
        }
      } catch (e) {
        console.warn('Gyro permission request error:', e);
        setIsGyroActive((prev) => !prev);
      }
    } else {
      setIsGyroActive((prev) => !prev);
    }
  };

  // VR Mode Toggle (Automatically activates gyro for headset view)
  const handleToggleVr = () => {
    setIsVrMode((prev) => {
      const next = !prev;
      if (next) {
        setIsGyroActive(true);
      }
      return next;
    });
  };

  // Modals
  const [activeDetailHotspot, setActiveDetailHotspot] = useState<Hotspot | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [isSceneManagerOpen, setIsSceneManagerOpen] = useState<boolean>(false);

  // Synchronize URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autorotate') === 'false') {
        setSettings((prev) => ({ ...prev, autoRotate: false }));
      }
      if (params.get('hotspots') === 'false') {
        setSettings((prev) => ({ ...prev, showHotspots: false }));
      }
      if (params.get('floorplan') === 'false') {
        setSettings((prev) => ({ ...prev, showFloorPlan: false }));
      }
    }
  }, []);

  // Save project changes to localStorage
  const saveProject = (newProject: TourProject) => {
    setProject(newProject);
    try {
      localStorage.setItem('coohom_tour_project_v1', JSON.stringify(newProject));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const currentRoom = project.rooms.find((r) => r.id === currentRoomId) || project.rooms[0];

  // Room Switcher
  const handleSelectRoom = useCallback(
    (roomId: string) => {
      const room = project.rooms.find((r) => r.id === roomId);
      if (room) {
        setCurrentRoomId(roomId);
        // PostMessage notify parent window for embed integration
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'COO_ROOM_CHANGED', roomId, roomName: room.name }, '*');
        }
      }
    },
    [project.rooms]
  );

  // PostMessage API Listener (Allows host web page to control viewer)
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'COO_NAVIGATE_ROOM' && data.roomId) {
        handleSelectRoom(data.roomId);
      } else if (data.type === 'COO_TOGGLE_AUTOROTATE') {
        setSettings((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
      } else if (data.type === 'COO_TOGGLE_HOTSPOTS') {
        setSettings((prev) => ({ ...prev, showHotspots: !prev.showHotspots }));
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [handleSelectRoom]);

  // Hotspot Click Event
  const handleHotspotClick = (hotspot: Hotspot) => {
    // Notify host if embedded
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'COO_HOTSPOT_CLICKED', hotspot }, '*');
    }

    if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
      handleSelectRoom(hotspot.targetRoomId);
    } else {
      setActiveDetailHotspot(hotspot);
    }
  };

  // Hotspot Editing & Saving
  const handleSaveHotspot = (savedHotspot: Hotspot) => {
    const updatedRooms = project.rooms.map((r) => {
      if (r.id === currentRoomId) {
        const existingIndex = r.hotspots.findIndex((h) => h.id === savedHotspot.id);
        const newHotspots = [...r.hotspots];
        if (existingIndex >= 0) {
          newHotspots[existingIndex] = savedHotspot;
        } else {
          newHotspots.push(savedHotspot);
        }
        return { ...r, hotspots: newHotspots };
      }
      return r;
    });

    saveProject({ ...project, rooms: updatedRooms, updatedAt: new Date().toISOString() });
    setEditingHotspot(null);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    const updatedRooms = project.rooms.map((r) => {
      if (r.id === currentRoomId) {
        return {
          ...r,
          hotspots: r.hotspots.filter((h) => h.id !== hotspotId),
        };
      }
      return r;
    });

    saveProject({ ...project, rooms: updatedRooms, updatedAt: new Date().toISOString() });
    setEditingHotspot(null);
  };

  // Add Custom Room / Scene
  const handleAddRoom = (newRoom: RoomScene) => {
    const updatedRooms = [...project.rooms, newRoom];
    saveProject({ ...project, rooms: updatedRooms, updatedAt: new Date().toISOString() });
  };

  const handleDeleteRoom = (roomId: string) => {
    if (project.rooms.length <= 1) {
      alert('You must have at least one scene in the tour.');
      return;
    }
    const updatedRooms = project.rooms.filter((r) => r.id !== roomId);
    if (currentRoomId === roomId) {
      setCurrentRoomId(updatedRooms[0].id);
    }
    saveProject({ ...project, rooms: updatedRooms, updatedAt: new Date().toISOString() });
  };

  const handleImportProject = (imported: TourProject) => {
    saveProject(imported);
    if (imported.rooms[0]) {
      setCurrentRoomId(imported.rooms[0].id);
    }
  };

  // Fullscreen Handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn('Fullscreen request denied:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <main
      id="coohom-panorama-app"
      className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-neutral-950 font-sans select-none"
    >
      {/* 1. Header / Top Navigation */}
      {controlsLevel !== 'clean' && !isVrMode && (
        <TopBar
          project={project}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onOpenSceneManager={() => setIsSceneManagerOpen(true)}
          onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
          bgAudioEnabled={settings.bgAudioEnabled}
          bgAudioVolume={settings.bgAudioVolume}
          onToggleAudio={() =>
            setSettings((prev) => ({ ...prev, bgAudioEnabled: !prev.bgAudioEnabled }))
          }
          onAudioVolumeChange={(vol) =>
            setSettings((prev) => ({ ...prev, bgAudioVolume: vol }))
          }
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          isEmbedView={isEmbedView}
        />
      )}

      {/* 2. Three.js 360° Equirectangular Sphere Viewer */}
      {currentRoom && (
        <PanoramaViewer
          currentRoom={currentRoom}
          allRooms={project.rooms}
          settings={settings}
          isEditMode={isEditMode}
          onHotspotClick={handleHotspotClick}
          onHotspotEdit={(hotspot) => setEditingHotspot(hotspot)}
          onPlaceHotspot={(coords) => {
            setEditingHotspot({
              type: 'navigation',
              yaw: coords.yaw,
              pitch: coords.pitch,
            });
          }}
          onYawChange={setCurrentYaw}
          isVrMode={isVrMode}
          isGyroActive={isGyroActive}
          onToggleVr={handleToggleVr}
        />
      )}

      {/* 3. Interactive Floor Plan Radar */}
      {!isVrMode && settings.showFloorPlan && controlsLevel !== 'clean' && (
        <FloorPlanRadar
          rooms={project.rooms}
          currentRoomId={currentRoomId}
          currentYaw={currentYaw}
          northOffset={settings.compassNorthAngle}
          onSelectRoom={handleSelectRoom}
        />
      )}

      {/* 4. Bottom Room Switcher Carousel & Toolbar */}
      {!isVrMode && controlsLevel !== 'clean' && (
        <RoomCarousel
          rooms={project.rooms}
          currentRoomId={currentRoomId}
          settings={settings}
          onSelectRoom={handleSelectRoom}
          onToggleAutoRotate={() =>
            setSettings((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))
          }
          onToggleHotspots={() =>
            setSettings((prev) => ({ ...prev, showHotspots: !prev.showHotspots }))
          }
          onToggleFullscreen={handleToggleFullscreen}
          onToggleVr={handleToggleVr}
          onToggleGyro={handleToggleGyro}
          isGyroActive={isGyroActive}
          onZoomIn={() =>
            setSettings((prev) => ({
              ...prev,
              defaultFov: Math.max(prev.fovMin, prev.defaultFov - 8),
            }))
          }
          onZoomOut={() =>
            setSettings((prev) => ({
              ...prev,
              defaultFov: Math.min(prev.fovMax, prev.defaultFov + 8),
            }))
          }
          isFullscreen={isFullscreen}
          isVrMode={isVrMode}
        />
      )}

      {/* 5. Product & Specification Detail Modal */}
      <HotspotModal
        hotspot={activeDetailHotspot}
        onClose={() => setActiveDetailHotspot(null)}
      />

      {/* 6. Hotspot Studio Editor Modal */}
      {editingHotspot && (
        <HotspotEditorModal
          hotspot={editingHotspot}
          rooms={project.rooms}
          currentRoomId={currentRoomId}
          onSave={handleSaveHotspot}
          onDelete={handleDeleteHotspot}
          onClose={() => setEditingHotspot(null)}
        />
      )}

      {/* 7. Embedded Integration & Share Modal */}
      {isEmbedModalOpen && (
        <EmbedModal
          rooms={project.rooms}
          currentRoomId={currentRoomId}
          onClose={() => setIsEmbedModalOpen(false)}
        />
      )}

      {/* 8. Scene & Panorama Manager Modal */}
      {isSceneManagerOpen && (
        <SceneManagerModal
          rooms={project.rooms}
          currentRoomId={currentRoomId}
          project={project}
          onAddRoom={handleAddRoom}
          onDeleteRoom={handleDeleteRoom}
          onSelectRoom={handleSelectRoom}
          onImportProject={handleImportProject}
          onClose={() => setIsSceneManagerOpen(false)}
        />
      )}
    </main>
  );
}
