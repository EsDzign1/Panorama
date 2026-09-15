import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Hotspot, RoomScene, TourSettings } from '../types';
import { HotspotMarker } from './HotspotMarker';
import { getProceduralPano } from '../data/defaultTour';
import { Compass, Glasses, X } from 'lucide-react';

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
  isGyroActive?: boolean;
  onToggleVr?: () => void;
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
  isGyroActive = false,
  onToggleVr,
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
  const [, setLon] = useState<number>(currentRoom.initialYaw || 0);
  const [, setLat] = useState<number>(currentRoom.initialPitch || 0);
  const [, setFov] = useState<number>(currentRoom.fov || settings.defaultFov || 70);
  const [isLoadingTexture, setIsLoadingTexture] = useState<boolean>(true);
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([]);
  const [hasGyroSupport, setHasGyroSupport] = useState<boolean>(false);

  // Interaction refs (avoid re-render triggers in 60fps animation loop)
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
    touchStartFov: 70,
    lastTouchX: 0,
    lastTouchY: 0,
    hasDraggedSignificantly: false,
    autoRotate: settings.autoRotate,
    autoRotateSpeed: settings.autoRotateSpeed,
    // Device orientation sensor states
    isGyroActive: isGyroActive || isVrMode,
    deviceAlpha: 0,
    deviceBeta: 0,
    deviceGamma: 0,
    deviceOrient: 0,
    hasDeviceData: false,
    gyroYawOffset: 0,
    isVrMode: isVrMode,
  });

  // Sync settings & props into stateRef
  useEffect(() => {
    stateRef.current.autoRotate = settings.autoRotate;
    stateRef.current.autoRotateSpeed = settings.autoRotateSpeed;
    stateRef.current.isGyroActive = isGyroActive || isVrMode;
    stateRef.current.isVrMode = isVrMode;
  }, [settings.autoRotate, settings.autoRotateSpeed, isGyroActive, isVrMode]);

  // Keep Lon/Lat/Fov in sync when currentRoom changes
  useEffect(() => {
    stateRef.current.lon = currentRoom.initialYaw || 0;
    stateRef.current.lat = currentRoom.initialPitch || 0;
    stateRef.current.fov = currentRoom.fov || settings.defaultFov || 70;
    stateRef.current.lonVelocity = 0;
    stateRef.current.latVelocity = 0;
    stateRef.current.gyroYawOffset = 0;
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
        // Fallback to procedural high-definition texture
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

  // Device Orientation Listener (Mobile Gyroscope)
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        setHasGyroSupport(true);
        stateRef.current.deviceAlpha = e.alpha;
        stateRef.current.deviceBeta = e.beta;
        stateRef.current.deviceGamma = e.gamma;
        stateRef.current.hasDeviceData = true;
      }
    };

    const handleScreenOrientation = () => {
      const orient = window.orientation ? Number(window.orientation) : (window.screen.orientation ? window.screen.orientation.angle : 0);
      stateRef.current.deviceOrient = orient;
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    window.addEventListener('orientationchange', handleScreenOrientation);
    handleScreenOrientation();

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('orientationchange', handleScreenOrientation);
    };
  }, []);

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

    // WebGL Renderer with graceful context handling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (e) {
      console.error('WebGL initialization failed:', e);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

    // Three.js Orientation Helpers for Gyro
    const deviceEuler = new THREE.Euler();
    const deviceQuat = new THREE.Quaternion();
    const zee = new THREE.Vector3(0, 0, 1);
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 on X

    // Animation & Render Loop
    let animationFrameId: number;
    let lastReportedYaw = -999;
    let lastYawUpdateTime = 0;
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      frameCount++;
      const state = stateRef.current;
      const rawWidth = containerRef.current?.clientWidth || window.innerWidth;
      const rawHeight = containerRef.current?.clientHeight || window.innerHeight;
      const cWidth = Math.max(1, rawWidth);
      const cHeight = Math.max(1, rawHeight);

      // Inertia & Damping when dragging ends
      if (!state.isUserInteracting) {
        if (state.autoRotate && !state.isGyroActive) {
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
      state.lon = (state.lon % 360 + 360) % 360;

      // Update camera FOV
      camera.fov = state.fov;

      let currentActiveYaw = state.lon;

      if (state.isGyroActive && state.hasDeviceData) {
        // Mobile Gyro Sensor Fusion
        const alpha = THREE.MathUtils.degToRad(state.deviceAlpha);
        const beta = THREE.MathUtils.degToRad(state.deviceBeta);
        const gamma = THREE.MathUtils.degToRad(state.deviceGamma);
        const orient = THREE.MathUtils.degToRad(state.deviceOrient);

        deviceEuler.set(beta, alpha, -gamma, 'YXZ');
        deviceQuat.setFromEuler(deviceEuler);
        deviceQuat.multiply(q1);
        deviceQuat.multiply(q0.setFromAxisAngle(zee, -orient));

        // Apply device quaternion to camera
        camera.quaternion.copy(deviceQuat);

        // Allow manual touch drag yaw offset
        if (state.lon !== 0) {
          camera.rotateY(THREE.MathUtils.degToRad(state.lon));
        }

        // Extract forward vector to keep radar & compass synced
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        let calcYaw = THREE.MathUtils.radToDeg(Math.atan2(forward.x, -forward.z));
        if (calcYaw < 0) calcYaw += 360;
        currentActiveYaw = calcYaw;
      } else {
        // Standard Euler LookAt
        const phi = THREE.MathUtils.degToRad(90 - state.lat);
        const theta = THREE.MathUtils.degToRad(state.lon);

        const target = new THREE.Vector3(
          500 * Math.sin(phi) * Math.cos(theta),
          500 * Math.cos(phi),
          500 * Math.sin(phi) * Math.sin(theta)
        );

        camera.lookAt(target);
        currentActiveYaw = state.lon;
      }

      // Throttle yaw updates to parent to prevent 60fps React re-renders of the whole app
      if (onYawChange) {
        const now = performance.now();
        const yawDiff = Math.abs(currentActiveYaw - lastReportedYaw);
        if ((yawDiff > 1.2 && now - lastYawUpdateTime > 80) || now - lastYawUpdateTime > 400) {
          lastReportedYaw = currentActiveYaw;
          lastYawUpdateTime = now;
          onYawChange(currentActiveYaw);
        }
      }

      // Render Scene: Stereoscopic VR (Left/Right) or Standard
      if (state.isVrMode) {
        const halfWidth = Math.max(1, Math.floor(cWidth / 2));
        renderer.setScissorTest(true);

        // Left Eye
        renderer.setViewport(0, 0, halfWidth, cHeight);
        renderer.setScissor(0, 0, halfWidth, cHeight);
        camera.aspect = halfWidth / cHeight;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        // Right Eye
        renderer.setViewport(halfWidth, 0, halfWidth, cHeight);
        renderer.setScissor(halfWidth, 0, halfWidth, cHeight);
        renderer.render(scene, camera);

        renderer.setScissorTest(false);
      } else {
        renderer.setViewport(0, 0, cWidth, cHeight);
        camera.aspect = cWidth / cHeight;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }

      // Project Hotspots to 2D Screen Space
      // Update when camera moves or on initial frames
      const isMoving = state.isUserInteracting || Math.abs(state.lonVelocity) > 0.005 || Math.abs(state.latVelocity) > 0.005 || state.autoRotate || (state.isGyroActive && state.hasDeviceData);
      
      if (!state.isVrMode && settings.showHotspots && currentRoom.hotspots.length > 0 && containerRef.current) {
        if (isMoving || frameCount < 15) {
          const projected: ProjectedHotspot[] = currentRoom.hotspots.map((hotspot) => {
            const hPhi = THREE.MathUtils.degToRad(90 - hotspot.pitch);
            const hTheta = THREE.MathUtils.degToRad(hotspot.yaw);

            const hPos = new THREE.Vector3(
              500 * Math.sin(hPhi) * Math.cos(hTheta),
              500 * Math.cos(hPhi),
              500 * Math.sin(hPhi) * Math.sin(hTheta)
            );

            hPos.project(camera);
            const isVisible = hPos.z < 1;
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
        }
      } else if (projectedHotspots.length > 0) {
        setProjectedHotspots([]);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Responsive Viewport Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
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

  // Touch and Multi-Touch Handlers (Pinch to Zoom + Drag Pan)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        stateRef.current.isUserInteracting = true;
        const t = e.touches[0];
        stateRef.current.lastTouchX = t.clientX;
        stateRef.current.lastTouchY = t.clientY;
        stateRef.current.onMouseDownMouseX = t.clientX;
        stateRef.current.onMouseDownMouseY = t.clientY;
        stateRef.current.onMouseDownLon = stateRef.current.lon;
        stateRef.current.onMouseDownLat = stateRef.current.lat;
        stateRef.current.lonVelocity = 0;
        stateRef.current.latVelocity = 0;
        stateRef.current.hasDraggedSignificantly = false;
      } else if (e.touches.length === 2) {
        stateRef.current.isUserInteracting = false;
        stateRef.current.lonVelocity = 0;
        stateRef.current.latVelocity = 0;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        stateRef.current.touchStartDist = Math.hypot(dx, dy);
        stateRef.current.touchStartFov = stateRef.current.fov;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent mobile browser page bounce & pull-to-refresh
      if (e.cancelable) {
        e.preventDefault();
      }

      if (e.touches.length === 1 && stateRef.current.isUserInteracting) {
        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const prevX = stateRef.current.lastTouchX || curX;
        const prevY = stateRef.current.lastTouchY || curY;
        const deltaX = curX - prevX;
        const deltaY = curY - prevY;

        stateRef.current.lastTouchX = curX;
        stateRef.current.lastTouchY = curY;

        const totalDx = curX - stateRef.current.onMouseDownMouseX;
        const totalDy = curY - stateRef.current.onMouseDownMouseY;
        if (Math.hypot(totalDx, totalDy) > 6) {
          stateRef.current.hasDraggedSignificantly = true;
        }

        const factor = (stateRef.current.fov / 70) * 0.18;
        stateRef.current.lon = (stateRef.current.lon - deltaX * factor) % 360;
        stateRef.current.lat = Math.max(-85, Math.min(85, stateRef.current.lat + deltaY * factor));
        stateRef.current.lonVelocity = -deltaX * factor * 0.45;
        stateRef.current.latVelocity = deltaY * factor * 0.45;
      } else if (e.touches.length === 2 && stateRef.current.touchStartDist > 0) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const distDelta = stateRef.current.touchStartDist - currentDist;
        const fovDelta = distDelta * 0.16;
        const newFov = Math.max(
          settings.fovMin,
          Math.min(settings.fovMax, stateRef.current.touchStartFov + fovDelta)
        );
        stateRef.current.fov = newFov;
        setFov(newFov);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        stateRef.current.isUserInteracting = false;
        stateRef.current.touchStartDist = 0;
      } else if (e.touches.length === 1) {
        stateRef.current.isUserInteracting = true;
        const t = e.touches[0];
        stateRef.current.lastTouchX = t.clientX;
        stateRef.current.lastTouchY = t.clientY;
        stateRef.current.onMouseDownMouseX = t.clientX;
        stateRef.current.onMouseDownMouseY = t.clientY;
        stateRef.current.onMouseDownLon = stateRef.current.lon;
        stateRef.current.onMouseDownLat = stateRef.current.lat;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [settings.fovMin, settings.fovMax]);

  // Pointer Event Handlers for Mouse (Desktop)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // Handled by native touch listeners
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
    if (e.pointerType === 'touch') return;
    if (!stateRef.current.isUserInteracting) return;

    const dx = e.clientX - stateRef.current.onMouseDownMouseX;
    const dy = e.clientY - stateRef.current.onMouseDownMouseY;

    if (Math.hypot(dx, dy) > 4) {
      stateRef.current.hasDraggedSignificantly = true;
    }

    const factor = (stateRef.current.fov / 70) * 0.18;
    const newLon = (stateRef.current.onMouseDownLon - dx * factor) % 360;
    const newLat = Math.max(-85, Math.min(85, stateRef.current.onMouseDownLat + dy * factor));

    stateRef.current.lonVelocity = -(dx * factor * 0.05);
    stateRef.current.latVelocity = dy * factor * 0.05;

    stateRef.current.lon = newLon;
    stateRef.current.lat = newLat;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    stateRef.current.isUserInteracting = false;
  };

  // Canvas Click (for Edit Mode Hotspot Placement)
  const handleCanvasClick = (e: React.MouseEvent) => {
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
      className="relative w-full h-full overflow-hidden bg-neutral-950 select-none cursor-grab active:cursor-grabbing touch-none"
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
        className="w-full h-full block"
      />

      {/* Stereoscopic VR Mode UI Overlay */}
      {isVrMode && (
        <>
          {/* Center Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/20 z-40 pointer-events-none" />

          {/* Left Eye Reticle */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            <div className="w-3 h-3 rounded-full border border-white/60 bg-white/20" />
          </div>

          {/* Right Eye Reticle */}
          <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            <div className="w-3 h-3 rounded-full border border-white/60 bg-white/20" />
          </div>

          {/* Exit VR Button */}
          {onToggleVr && (
            <button
              onClick={onToggleVr}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-950/90 text-white border border-white/25 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-neutral-900 cursor-pointer pointer-events-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit VR View</span>
            </button>
          )}
        </>
      )}

      {/* Gyro Sensor Active Notification */}
      {isGyroActive && !isVrMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur shadow-lg flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>Motion Look Active: Move or tilt device to look around</span>
        </div>
      )}

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
        {!isVrMode &&
          settings.showHotspots &&
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
