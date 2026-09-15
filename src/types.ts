/**
 * 360° Panorama Viewer Types & Models
 * Supports Coohom-style virtual tours with interactive hotspots and embed integrations.
 */

export type HotspotType = 'navigation' | 'product' | 'info' | 'link';

export interface Hotspot {
  id: string;
  type: HotspotType;
  /** Horizontal angle in degrees [0, 360) */
  yaw: number;
  /** Vertical angle in degrees [-85, 85] (positive = up, negative = down) */
  pitch: number;
  title: string;
  description?: string;
  
  // Navigation specific
  targetRoomId?: string;
  
  // Product specific
  price?: string;
  productUrl?: string;
  imageUrl?: string;
  brand?: string;
  dimensions?: string;
  material?: string;
  
  // Customization
  iconType?: 'arrow' | 'tag' | 'info' | 'eye' | 'star' | 'circle';
  customColor?: string;
}

export interface FloorPlanPoint {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface RoomScene {
  id: string;
  name: string;
  category: 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'outdoor' | 'office' | 'gallery' | 'custom';
  panoramaUrl: string;
  thumbnailUrl?: string;
  initialYaw: number;
  initialPitch: number;
  fov?: number;
  floorPlanPosition: FloorPlanPoint;
  hotspots: Hotspot[];
  description?: string;
}

export interface TourSettings {
  autoRotate: boolean;
  autoRotateSpeed: number; // degrees per frame or speed multiplier (e.g. 0.3)
  showHotspots: boolean;
  showFloorPlan: boolean;
  showRoomBar: boolean;
  bgAudioEnabled: boolean;
  bgAudioVolume: number;
  enableGyro: boolean;
  fovMin: number;
  fovMax: number;
  defaultFov: number;
  compassNorthAngle: number; // offset in degrees for compass
}

export interface TourProject {
  id: string;
  title: string;
  designer: string;
  company?: string;
  description: string;
  viewCount: number;
  defaultRoomId: string;
  floorPlanUrl?: string;
  rooms: RoomScene[];
  settings: TourSettings;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedOptions {
  roomId: string;
  autoRotate: boolean;
  controls: 'full' | 'minimal' | 'none';
  showHotspots: boolean;
  showFloorPlan: boolean;
  width: string;
  height: string;
  theme: 'dark' | 'light';
}
