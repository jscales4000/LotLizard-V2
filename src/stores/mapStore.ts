import { create } from 'zustand';

// Define the state structure
interface MapState {
  scale: number;
  position: { x: number; y: number };
  imageUrl: string | null;
  isCalibrationMode: boolean;
  calibrationPoints: { x: number; y: number; realWorldDistance: number }[];
  
  // Actions
  setScale: (scale: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setImageUrl: (url: string | null) => void;
  toggleCalibrationMode: () => void;
  addCalibrationPoint: (point: { x: number; y: number; realWorldDistance: number }) => void;
  clearCalibrationPoints: () => void;
}

// Create the store
export const useMapStore = create<MapState>((set) => ({
  scale: 1.0,
  position: { x: 0, y: 0 },
  imageUrl: null,
  isCalibrationMode: false,
  calibrationPoints: [],
  
  // Implement actions
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  toggleCalibrationMode: () => set((state) => ({ isCalibrationMode: !state.isCalibrationMode })),
  addCalibrationPoint: (point) => set((state) => ({
    calibrationPoints: [...state.calibrationPoints, point]
  })),
  clearCalibrationPoints: () => set({ calibrationPoints: [] }),
}));
