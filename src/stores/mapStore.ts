import { create } from 'zustand';
import { CalibrationPoint, CalibrationLine, CalibrationService } from '../services/calibrationService';

// Define the state structure
interface MapState {
  scale: number;
  position: { x: number; y: number };
  imageUrl: string | null;
  isCalibrationMode: boolean;
  calibrationPoints: CalibrationPoint[];
  activeCalibrationLine: CalibrationLine | null;
  currentCalibrationLine: { startPoint: CalibrationPoint | null; endPoint: CalibrationPoint | null } | null;
  pixelsPerMeter: number;
  
  // Actions
  setScale: (scale: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setImageUrl: (url: string | null) => void;
  toggleCalibrationMode: () => void;
  addCalibrationPoint: (point: CalibrationPoint) => void;
  clearCalibrationPoints: () => void;
  startCalibrationLine: (point: CalibrationPoint) => void;
  completeCalibrationLine: (endPoint: CalibrationPoint, realWorldDistance: number) => void;
  clearCalibration: () => void;
  updatePixelsPerMeter: () => void;
}

// Create the store
export const useMapStore = create<MapState>((set, get) => ({
  scale: 1.0,
  position: { x: 0, y: 0 },
  imageUrl: null,
  isCalibrationMode: false,
  calibrationPoints: [],
  activeCalibrationLine: null,
  currentCalibrationLine: null,
  pixelsPerMeter: 1,
  
  // Implement actions
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
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
  }
}));
