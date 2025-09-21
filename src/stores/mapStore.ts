import { create } from 'zustand';
import { CalibrationPoint, CalibrationLine, CalibrationService } from '../services/calibrationService';

// Define measurement line interface
export interface MeasurementPoint {
  id: string;
  x: number;
  y: number;
}

export interface MeasurementLine {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  pixelDistance: number;
  realWorldDistance: number; // in feet
}

// Define the state structure
interface MapState {
  scale: number;
  position: { x: number; y: number };
  imageUrl: string | null;

  isCalibrationMode: boolean;
  isPanningMode: boolean; // Added state for pan/move tool mode
  isRulerMode: boolean; // Added state for ruler/measurement tool mode
  calibrationPoints: CalibrationPoint[];
  activeCalibrationLine: CalibrationLine | null;
  currentCalibrationLine: { startPoint: CalibrationPoint | null; endPoint: CalibrationPoint | null } | null;
  pixelsPerFoot: number;

  // Ruler/measurement settings
  measurementLines: MeasurementLine[];
  currentMeasurementLine: { startPoint: MeasurementPoint | null; endPoint: MeasurementPoint | null } | null;
  showMeasurementLines: boolean;
  selectedMeasurementId: string | null;

  // Drag state for moving measurement points
  isDragging: boolean;
  dragTarget: { lineId: string; pointType: 'start' | 'end' } | null;

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

  // Ruler/measurement actions
  toggleRulerMode: () => void;
  startMeasurementLine: (point: MeasurementPoint) => void;
  completeMeasurementLine: (endPoint: MeasurementPoint) => void;
  clearMeasurementLines: () => void;
  removeMeasurementLine: (id: string) => void;
  toggleMeasurementLines: () => void;
  selectMeasurementLine: (id: string | null) => void;
  updateMeasurementLine: (id: string, updates: Partial<MeasurementLine>) => void;

  // Drag actions for moving measurement points
  startDragging: (lineId: string, pointType: 'start' | 'end') => void;
  updateDragging: (x: number, y: number) => void;
  stopDragging: () => void;

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
  isRulerMode: false,
  calibrationPoints: [],
  activeCalibrationLine: null,
  currentCalibrationLine: null,
  pixelsPerFoot: 1,

  // Ruler/measurement settings
  measurementLines: [],
  currentMeasurementLine: null,
  showMeasurementLines: true,
  selectedMeasurementId: null,

  // Drag state
  isDragging: false,
  dragTarget: null,

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

  // Ruler/measurement actions
  toggleRulerMode: () => set((state) => ({
    isRulerMode: !state.isRulerMode,
    currentMeasurementLine: null // Reset current line when toggling mode
  })),

  startMeasurementLine: (point) => set({
    currentMeasurementLine: { startPoint: point, endPoint: null }
  }),

  completeMeasurementLine: (endPoint) => {
    const state = get();
    if (!state.currentMeasurementLine?.startPoint) return;

    const pixelDistance = CalibrationService.calculatePixelDistance(
      state.currentMeasurementLine.startPoint,
      endPoint
    );

    const realWorldDistance = CalibrationService.pixelsToFeet(pixelDistance, state.pixelsPerFoot);

    const measurementLine: MeasurementLine = {
      id: `measurement-${Date.now()}`,
      startPoint: state.currentMeasurementLine.startPoint,
      endPoint,
      pixelDistance,
      realWorldDistance
    };

    set((state) => ({
      measurementLines: [...state.measurementLines, measurementLine],
      currentMeasurementLine: null
    }));
  },

  clearMeasurementLines: () => set({ measurementLines: [], selectedMeasurementId: null }),

  removeMeasurementLine: (id) => set((state) => ({
    measurementLines: state.measurementLines.filter(line => line.id !== id),
    selectedMeasurementId: state.selectedMeasurementId === id ? null : state.selectedMeasurementId
  })),

  toggleMeasurementLines: () => set((state) => ({ showMeasurementLines: !state.showMeasurementLines })),

  selectMeasurementLine: (id) => set({ selectedMeasurementId: id }),

  updateMeasurementLine: (id, updates) => set((state) => ({
    measurementLines: state.measurementLines.map(line =>
      line.id === id ? { ...line, ...updates } : line
    )
  })),

  // Drag actions for moving measurement points
  startDragging: (lineId, pointType) => set({
    isDragging: true,
    dragTarget: { lineId, pointType }
  }),

  updateDragging: (x, y) => {
    const state = get();
    if (!state.isDragging || !state.dragTarget) return;

    const { lineId, pointType } = state.dragTarget;
    const line = state.measurementLines.find(l => l.id === lineId);
    if (!line) return;

    // Update the appropriate point
    const updates: Partial<MeasurementLine> = {};
    if (pointType === 'start') {
      updates.startPoint = { ...line.startPoint, x, y };
    } else {
      updates.endPoint = { ...line.endPoint, x, y };
    }

    // Recalculate distances
    const newStartPoint = updates.startPoint || line.startPoint;
    const newEndPoint = updates.endPoint || line.endPoint;

    // Import CalibrationService for distance calculations
    const pixelDistance = Math.sqrt(
      Math.pow(newEndPoint.x - newStartPoint.x, 2) +
      Math.pow(newEndPoint.y - newStartPoint.y, 2)
    );

    updates.pixelDistance = pixelDistance;
    updates.realWorldDistance = pixelDistance / state.pixelsPerFoot;

    // Apply updates
    set((state) => ({
      measurementLines: state.measurementLines.map(line =>
        line.id === lineId ? { ...line, ...updates } : line
      )
    }));
  },

  stopDragging: () => set({
    isDragging: false,
    dragTarget: null
  }),

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
