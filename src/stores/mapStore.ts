import { create } from 'zustand';
import { CalibrationPoint, CalibrationLine, CalibrationService } from '../services/calibrationService';

// Define the state structure
interface MapState {
  scale: number;
  position: { x: number; y: number };
  imageUrl: string | null;

  isCalibrationMode: boolean;
  isPanningMode: boolean; // Added state for pan/move tool mode
  calibrationPoints: CalibrationPoint[];
  activeCalibrationLine: CalibrationLine | null;
  currentCalibrationLine: { startPoint: CalibrationPoint | null; endPoint: CalibrationPoint | null } | null;
  pixelsPerFoot: number;

  // Grid settings
  showGrid: boolean;
  gridSpacing: number; // in feet
  gridColor: string;
  gridOpacity: number; // 0.0 to 1.0
  
  // Calibration settings
  showCalibrationLine: boolean;
  
  // Equipment display settings
  showEquipmentLabels: boolean;
  showClearanceZones: boolean;
  
  // Actions
  setScale: (scale: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setImageUrl: (url: string | null) => void;

  setPixelsPerFoot: (pixelsPerFoot: number) => void;
  toggleCalibrationMode: () => void;
  addCalibrationPoint: (point: CalibrationPoint) => void;
  clearCalibrationPoints: () => void;
  startCalibrationLine: (point: CalibrationPoint) => void;
  completeCalibrationLine: (endPoint: CalibrationPoint, realWorldDistance: number) => void;
  clearCalibration: () => void;
  updatePixelsPerFoot: () => void;
  
  // Grid actions
  toggleGrid: () => void;
  toggleCalibrationLine: () => void;
  setGridSpacing: (spacing: number) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (opacity: number) => void;
  
  // Equipment display actions
  toggleEquipmentLabels: () => void;
  toggleClearanceZones: () => void;
  
  // Pan/move actions
  setIsPanningMode: (isPanning: boolean) => void;
  
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

  isCalibrationMode: false,
  isPanningMode: false,
  calibrationPoints: [],
  activeCalibrationLine: null,
  currentCalibrationLine: null,
  pixelsPerFoot: 1,

  // Grid settings
  showGrid: true,
  gridSpacing: 10, // 10 feet
  gridColor: '#333333',
  gridOpacity: 0.3,
  
  // Calibration settings
  showCalibrationLine: true,
  
  // Equipment display settings
  showEquipmentLabels: true,
  showClearanceZones: true,
  
  // Implement actions
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setImageUrl: (imageUrl) => set({ imageUrl }),

  setPixelsPerFoot: (pixelsPerFoot) => set({ pixelsPerFoot }),
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
        pixelsPerFoot: calibrationLine.pixelsPerFoot
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
    pixelsPerFoot: 1
  }),
  
  updatePixelsPerFoot: () => {
    const state = get();
    if (state.activeCalibrationLine) {
      set({ pixelsPerFoot: state.activeCalibrationLine.pixelsPerFoot });
    } else {
      set({ pixelsPerFoot: 1 });
    }
  },
  
  // Grid actions
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleCalibrationLine: () => set((state) => ({ showCalibrationLine: !state.showCalibrationLine })),
  setGridSpacing: (spacing) => set({ gridSpacing: spacing }),
  setGridColor: (color) => set({ gridColor: color }),
  setGridOpacity: (opacity) => set({ gridOpacity: opacity }),
  
  // Equipment display actions
  toggleEquipmentLabels: () => set((state) => ({ showEquipmentLabels: !state.showEquipmentLabels })),
  toggleClearanceZones: () => set((state) => ({ showClearanceZones: !state.showClearanceZones })),
  
  // Pan/move actions
  setIsPanningMode: (isPanning) => set({ isPanningMode: isPanning }),
  
  // Zoom actions
  zoomIn: () => set((state) => ({ scale: Math.min(5, state.scale * 1.2) })),
  zoomOut: () => set((state) => ({ scale: Math.max(0.1, state.scale / 1.2) })),
  
  // Fixed zoomToFit that uses 183% zoom and centers content
  zoomToFit: () => {
    // We need to use a function that takes a callback to get the current state values
    set((state) => {
      // Get canvas dimensions from DOM - this runs on the client side
      const canvas = document.querySelector('canvas');
      if (!canvas) return { scale: 1.83, position: { x: 0, y: 0 } };
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      let contentWidth = 800; // Default content width if no image or items
      let contentHeight = 600; // Default content height if no image or items
      
      // If we have an image, use its dimensions
      if (state.imageUrl) {
        // Try to get the image element (might not be loaded yet)
        const img = new Image();
        img.src = state.imageUrl;
        
        if (img.width && img.height) {
          contentWidth = img.width;
          contentHeight = img.height;
        }
      }
      
      // Fixed scale of 183% as requested
      const newScale = 1.83;
      
      // Center the content in the canvas
      const newX = (canvasWidth - contentWidth * newScale) / 2;
      const newY = (canvasHeight - contentHeight * newScale) / 2;
      
      return { 
        scale: newScale, 
        position: { x: newX, y: newY } 
      };
    });
  },
  
  resetZoom: () => set({ scale: 1 })
}));
