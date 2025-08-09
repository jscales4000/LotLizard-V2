import { create } from 'zustand';
import { CalibrationPoint, CalibrationLine, CalibrationService } from '../services/calibrationService';

// Define the state structure
interface MapState {
  scale: number;
  position: { x: number; y: number };
  imageUrl: string | null;
  imageLocked: boolean;
  isCalibrationMode: boolean;
  calibrationPoints: CalibrationPoint[];
  activeCalibrationLine: CalibrationLine | null;
  currentCalibrationLine: { startPoint: CalibrationPoint | null; endPoint: CalibrationPoint | null } | null;
  pixelsPerMeter: number;
  
  // Grid settings
  showGrid: boolean;
  gridSpacing: number; // in meters
  gridColor: string;
  
  // Actions
  setScale: (scale: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setImageUrl: (url: string | null) => void;
  setImageLocked: (locked: boolean) => void;
  toggleCalibrationMode: () => void;
  addCalibrationPoint: (point: CalibrationPoint) => void;
  clearCalibrationPoints: () => void;
  startCalibrationLine: (point: CalibrationPoint) => void;
  completeCalibrationLine: (endPoint: CalibrationPoint, realWorldDistance: number) => void;
  clearCalibration: () => void;
  updatePixelsPerMeter: () => void;
  
  // Grid actions
  toggleGrid: () => void;
  setGridSpacing: (spacing: number) => void;
  
  // Zoom actions
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
}

// Create the store
export const useMapStore = create<MapState>((set, get) => ({
  scale: 1.0,
  position: { x: 0, y: 0 },
  imageUrl: null,
  imageLocked: false,
  isCalibrationMode: false,
  calibrationPoints: [],
  activeCalibrationLine: null,
  currentCalibrationLine: null,
  pixelsPerMeter: 1,
  
  // Grid settings
  showGrid: true,
  gridSpacing: 3, // 3 meters (approximately 10 feet)
  gridColor: '#333333',
  
  // Implement actions
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setImageLocked: (imageLocked) => set({ imageLocked }),
  toggleCalibrationMode: () => set((state) => ({ 
    isCalibrationMode: !state.isCalibrationMode,
    currentCalibrationLine: null // Reset current line when toggling mode
  })),
  
  addCalibrationPoint: (point) => set((state) => ({
    calibrationPoints: [...state.calibrationPoints, point]
  })),
  
  clearCalibrationPoints: () => set({ calibrationPoints: [] }),
  
  startCalibrationLine: (point) => set({
    currentCalibrationLine: { startPoint: point, endPoint: null }
  }),
  
  completeCalibrationLine: (endPoint, realWorldDistance) => {
    const state = get();
    if (!state.currentCalibrationLine?.startPoint) return;
    
    try {
      const calibrationLine = CalibrationService.createCalibrationLine(
        state.currentCalibrationLine.startPoint,
        endPoint,
        realWorldDistance
      );
      
      // Replace any existing calibration with the new one
      set({
        activeCalibrationLine: calibrationLine,
        currentCalibrationLine: null,
        pixelsPerMeter: calibrationLine.pixelsPerMeter
      });
    } catch (error) {
      console.error('Failed to create calibration line:', error);
      set({ currentCalibrationLine: null });
    }
  },
  
  clearCalibration: () => set({
    calibrationPoints: [],
    activeCalibrationLine: null,
    currentCalibrationLine: null,
    pixelsPerMeter: 1
  }),
  
  updatePixelsPerMeter: () => {
    const state = get();
    if (state.activeCalibrationLine) {
      set({ pixelsPerMeter: state.activeCalibrationLine.pixelsPerMeter });
    } else {
      set({ pixelsPerMeter: 1 });
    }
  },
  
  // Grid actions
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridSpacing: (spacing) => set({ gridSpacing: spacing }),
  
  // Zoom actions
  zoomIn: () => set((state) => ({ scale: Math.min(5, state.scale * 1.2) })),
  zoomOut: () => set((state) => ({ scale: Math.max(0.1, state.scale / 1.2) })),
  zoomToFit: () => set({ scale: 1, position: { x: 0, y: 0 } }),
  resetZoom: () => set({ scale: 1 })
}));
