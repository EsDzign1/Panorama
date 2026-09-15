import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Hotspot, RoomScene, TourSettings } from '../types';
import { HotspotMarker } from './HotspotMarker';
import { getProceduralPano } from '../data/defaultTour';

interface ProjectedHotspot {
  hotspot: Hotspot;
  screenX: number;
  screenY: number;
  isVisible: boolean;
}

interface PanoramaViewerProps {
  currentRoom: RoomScene;
  allRooms: RoomScene[];
  settings: TourSettings;
  isEditMode: boolean;
  onHotspotClick: (hotspot: Hotspot) => void;
  onHotspotEdit?: (hotspot: Hotspot) => void;
  onPlaceHotspot?: (coords: { yaw: number; pitch: number }) => void;
  onYawChange?: (yaw: number) => void;
  isVrMode?: boolean;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  currentRoom,
  allRooms,
  settings,
  isEditMode,
  onHotspotClick,
  onHotspotEdit,
  onPlaceHotspot,
  onYawChange,
  isVrMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());

  // Navigation State
  const [lon, setLon] = useState<number>(currentRoom.initialYaw || 0);
  const [lat, setLat] = useState<number>(currentRoom.initialPitch || 0);
  const [fov, setFov] = useState<number>(currentRoom.fov || settings.defaultFov || 70);
  const [isLoadingTexture, setIsLoadingTexture] = useState<boolean>(true);
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([]);

  // Interaction refs (avoid re-render triggers in animation loop)
  const stateRef = useRef({
    lon: currentRoom.initialYaw || 0,
    lat: currentRoom.initialPitch || 0,
    fov: currentRoom.fov || settings.defaultFov || 70,
    isUserInteracting: false,
    onMouseDownMouseX: 0,
    onMouseDownMouseY: 0,
    onMouseDownLon: 0,
    onMouseDownLat: 0,
    lonVelocity: 0,
    latVelocity: 0,
    touchStartDist: 0,
    hasDraggedSignificantly: false,
    autoRotate: settings.autoRotate,
    autoRotateSpeed: settings.autoRotateSpeed,
    gyroActive: settings.enableGyro,
    deviceAlpha: 0,
    deviceBeta: 0,
    deviceGamma: 0,
  });

  // Sync settings into stateRef
  useEffect(() => {
    stateRef.current.autoRotate = settings.autoRotate;
    stateRef.current.autoRotateSpeed = settings.autoRotateSpeed;
  }, [settings.autoRotate, settings.autoRotateSpeed]);

  // Keep Lon/Lat/Fov in sync when currentRoom changes
  useEffect(() => {
    stateRef.current.lon = currentRoom.initialYaw || 0;
    stateRef.current.lat = currentRoom.initialPitch || 0;
    stateRef.current.fov = currentRoom.fov || settings.defaultFov || 70;
    stateRef.current.lonVelocity = 0;
    stateRef.current.latVelocity = 0;
    setLon(currentRoom.initialYaw || 0);
    setLat(currentRoom.initialPitch || 0);
    setFov(currentRoom.fov || settings.defaultFov || 70);
  }, [currentRoom.id, currentRoom.initialYaw, currentRoom.initialPitch, currentRoom.fov, settings.defaultFov]);

  // Texture Loader with Fallback
  const loadTexture = useCallback((url: string, category: RoomScene['category']) => {
    setIsLoadingTexture(true);

    if (textureCacheRef.current.has(url)) {
      const cached = textureCacheRef.current.get(url)!;
      if (sphereMeshRef.current) {
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).map = cached;
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
      setIsLoadingTexture(false);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const applyTexture = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      textureCacheRef.current.set(url, tex);
      if (sphereMeshRef.current) {
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).map = tex;
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
      setIsLoadingTexture(false);
    };

    loader.load(
      url,
      (tex) => {
        applyTexture(tex);
      },
      undefined,
      () => {
        // Fallback to high-definition procedural texture
        const mappedTheme: 'living' | 'kitchen' | 'bedroom' | 'terrace' =
          category === 'kitchen' ? 'kitchen' :
          category === 'bedroom' ? 'bedroom' :
          category === 'outdoor' ? 'terrace' : 'living';
        const fallbackDataUrl = getProceduralPano(mappedTheme);
        loader.load(fallbackDataUrl, (fallbackTex) => {
          applyTexture(fallbackTex);
        });
      }
    );
  }, []);

  // Update Texture on room change
  useEffect(() => {
    loadTexture(currentRoom.panoramaUrl, currentRoom.category);
  }, [currentRoom.panoramaUrl, currentRoom.category, loadTexture]);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(stateRef.current.fov, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Sphere Geometry (inverted normals for 360 interior view)
    const geometry = new THREE.SphereGeometry(500, 64, 48);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Initial texture load
    loadTexture(currentRoom.panoramaUrl, currentRoom.category);

    // Animation & Render Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const state = stateRef.current;

      // Handle Inertia & Damping
      if (!state.isUserInteracting) {
        if (state.autoRotate) {
          state.lon += state.autoRotateSpeed;
        }

        // Decay velocity
        state.lon += state.lonVelocity;
        state.lat += state.latVelocity;
        state.lonVelocity *= 0.92;
        state.latVelocity *= 0.92;

        if (Math.abs(state.lonVelocity) < 0.001) state.lonVelocity = 0;
        if (Math.abs(state.latVelocity) < 0.001) state.latVelocity = 0;
      }

      // Constrain Pitch/Lat
      state.lat = Math.max(-85, Math.min(85, state.lat));
      // Normalize Lon [0, 360)
      state.lon = (state.lon % 360 + 360) % 360;

      // Notify parent for radar/compass updates (debounced by value change)
      if (onYawChange) {
        onYawChange(state.lon);
      }

      // Update Camera LookAt
      const phi = THREE.MathUtils.degToRad(90 - state.lat);
      const theta = THREE.MathUtils.degToRad(state.lon);

      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.fov = state.fov;
      camera.updateProjectionMatrix();
      camera.lookAt(target);

      // Render Scene
      renderer.render(scene, camera);

      // Project Hotspots to 2D Screen Space
      if (settings.showHotspots && currentRoom.hotspots.length > 0 && containerRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        const projected: ProjectedHotspot[] = currentRoom.hotspots.map((hotspot) => {
          const hPhi = THREE.MathUtils.degToRad(90 - hotspot.pitch);
          const hTheta = THREE.MathUtils.degToRad(hotspot.yaw);

          const hPos = new THREE.Vector3(
            500 * Math.sin(hPhi) * Math.cos(hTheta),
            500 * Math.cos(hPhi),
            500 * Math.sin(hPhi) * Math.sin(hTheta)
          );

          // Project to NDC [-1, 1]
          hPos.project(camera);

          // Check if point is in front of camera
          const isVisible = hPos.z < 1;

          // Convert NDC to screen coords
          const screenX = ((hPos.x + 1) * cWidth) / 2;
          const screenY = ((-hPos.y + 1) * cHeight) / 2;

          return {
            hotspot,
            screenX,
            screenY,
            isVisible,
          };
        });

        setProjectedHotspots(projected);
      } else if (!settings.showHotspots && projectedHotspots.length > 0) {
        setProjectedHotspots([]);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Observer for responsive viewport
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [loadTexture, settings.showHotspots, currentRoom.hotspots, currentRoom.category, currentRoom.panoramaUrl, onYawChange]);

  // Pointer Event Handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isUserInteracting = true;
    stateRef.current.onMouseDownMouseX = e.clientX;
    stateRef.current.onMouseDownMouseY = e.clientY;
    stateRef.current.onMouseDownLon = stateRef.current.lon;
    stateRef.current.onMouseDownLat = stateRef.current.lat;
    stateRef.current.lonVelocity = 0;
    stateRef.current.latVelocity = 0;
    stateRef.current.hasDraggedSignificantly = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stateRef.current.isUserInteracting) return;

    const dx = e.clientX - stateRef.current.onMouseDownMouseX;
    const dy = e.clientY - stateRef.current.onMouseDownMouseY;

    if (Math.hypot(dx, dy) > 4) {
      stateRef.current.hasDraggedSignificantly = true;
    }

    // Sensitivity scales with FOV zoom factor
    const factor = (stateRef.current.fov / 70) * 0.18;
    const newLon = (stateRef.current.onMouseDownLon - dx * factor) % 360;
    const newLat = Math.max(-85, Math.min(85, stateRef.current.onMouseDownLat + dy * factor));

    stateRef.current.lonVelocity = -(dx * factor * 0.05);
    stateRef.current.latVelocity = dy * factor * 0.05;

    stateRef.current.lon = newLon;
    stateRef.current.lat = newLat;
  };

  const handlePointerUp = () => {
    stateRef.current.isUserInteracting = false;
  };

  // Canvas Click (for Edit Mode Hotspot Placement)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // If user dragged to look around, don't place hotspot
    if (stateRef.current.hasDraggedSignificantly) return;

    if (isEditMode && onPlaceHotspot && canvasRef.current && cameraRef.current && sphereMeshRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObject(sphereMeshRef.current);

      if (intersects.length > 0) {
        const p = intersects[0].point.clone().normalize();
        // Convert normalized sphere point to Yaw and Pitch
        const pitch = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, p.y))));
        let yaw = THREE.MathUtils.radToDeg(Math.atan2(p.z, p.x));
        if (yaw < 0) yaw += 360;

        onPlaceHotspot({ yaw: Math.round(yaw), pitch: Math.round(pitch) });
      }
    }
  };

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    const newFov = Math.max(
      settings.fovMin,
      Math.min(settings.fovMax, stateRef.current.fov + zoomDelta)
    );
    stateRef.current.fov = newFov;
    setFov(newFov);
  };

  return (
    <div
      ref={containerRef}
      id="panorama-viewport"
      className="relative w-full h-full overflow-hidden bg-neutral-950 select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
    >
      {/* 360 Canvas */}
      <canvas
        ref={canvasRef}
        id="panorama-canvas"
        className={`w-full h-full block ${isVrMode ? 'filter contrast-105' : ''}`}
      />

      {/* Loading Overlay */}
      {isLoadingTexture && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/75 backdrop-blur-sm z-30 pointer-events-none transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full border-3 border-blue-500/30 border-t-blue-500 animate-spin mb-3" />
          <span className="text-sm font-medium text-white/90">Loading 360° Scene...</span>
          <span className="text-xs text-neutral-400 mt-1">{currentRoom.name}</span>
        </div>
      )}

      {/* Hotspots Layer */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {settings.showHotspots &&
          projectedHotspots.map(({ hotspot, screenX, screenY, isVisible }) => {
            const targetRoom = hotspot.targetRoomId
              ? allRooms.find((r) => r.id === hotspot.targetRoomId)
              : undefined;

            return (
              <HotspotMarker
                key={hotspot.id}
                hotspot={hotspot}
                screenX={screenX}
                screenY={screenY}
                isVisible={isVisible}
                isEditMode={isEditMode}
                targetRoom={targetRoom}
                onClick={() => onHotspotClick(hotspot)}
                onEdit={onHotspotEdit ? () => onHotspotEdit(hotspot) : undefined}
              />
            );
          })}
      </div>

      {/* Edit Mode Crosshair / Hint Banner */}
      {isEditMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-amber-500/90 text-neutral-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur flex items-center gap-2 pointer-events-none border border-white/20">
          <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping" />
          Hotspot Studio Mode: Click anywhere on the 360 scene to drop a hotspot
        </div>
      )}
    </div>
  );
};
