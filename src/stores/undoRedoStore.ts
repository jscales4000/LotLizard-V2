import { create } from 'zustand';
import { EquipmentItem } from './equipmentStore';
import { MeasurementLine, PerimeterPoint, Perimeter } from './mapStore';

// Define action types for undo/redo system
export type ActionType =
  | 'EQUIPMENT_ADD'
  | 'EQUIPMENT_REMOVE'
  | 'EQUIPMENT_MOVE'
  | 'EQUIPMENT_ROTATE'
  | 'EQUIPMENT_RESIZE'
  | 'EQUIPMENT_UPDATE'
  | 'EQUIPMENT_PASTE'
  | 'EQUIPMENT_CLEAR_ALL'
  | 'MEASUREMENT_ADD'
  | 'MEASUREMENT_REMOVE'
  | 'MEASUREMENT_CLEAR_ALL'
  | 'PERIMETER_ADD_POINT'
  | 'PERIMETER_CLOSE'
  | 'PERIMETER_CLEAR'
  | 'CALIBRATION_SET'
  | 'CALIBRATION_CLEAR';

// Define the data structure for each action
export interface UndoRedoAction {
  id: string;
  type: ActionType;
  timestamp: number;
  description: string;
  undoData: any;
  redoData: any;
}

// Equipment-specific action data interfaces
export interface EquipmentAddAction {
  type: 'EQUIPMENT_ADD';
  undoData: { itemId: string };
  redoData: { item: EquipmentItem };
}

export interface EquipmentRemoveAction {
  type: 'EQUIPMENT_REMOVE';
  undoData: { items: EquipmentItem[]; selectedIds: string[] };
  redoData: { itemIds: string[] };
}

export interface EquipmentMoveAction {
  type: 'EQUIPMENT_MOVE';
  undoData: { itemId: string; previousX: number; previousY: number };
  redoData: { itemId: string; newX: number; newY: number };
}

export interface EquipmentBulkMoveAction {
  type: 'EQUIPMENT_MOVE';
  undoData: { items: Array<{ id: string; x: number; y: number }> };
  redoData: { items: Array<{ id: string; x: number; y: number }> };
}

export interface EquipmentRotateAction {
  type: 'EQUIPMENT_ROTATE';
  undoData: { itemId: string; previousRotation: number };
  redoData: { itemId: string; newRotation: number };
}

export interface EquipmentResizeAction {
  type: 'EQUIPMENT_RESIZE';
  undoData: { itemId: string; previousWidth: number; previousHeight: number };
  redoData: { itemId: string; newWidth: number; newHeight: number };
}

export interface EquipmentUpdateAction {
  type: 'EQUIPMENT_UPDATE';
  undoData: { itemId: string; previousData: Partial<EquipmentItem> };
  redoData: { itemId: string; newData: Partial<EquipmentItem> };
}

// Measurement-specific action data interfaces
export interface MeasurementAddAction {
  type: 'MEASUREMENT_ADD';
  undoData: { lineId: string };
  redoData: { line: MeasurementLine };
}

export interface MeasurementRemoveAction {
  type: 'MEASUREMENT_REMOVE';
  undoData: { line: MeasurementLine };
  redoData: { lineId: string };
}

// Perimeter-specific action data interfaces
export interface PerimeterAddPointAction {
  type: 'PERIMETER_ADD_POINT';
  undoData: { pointCount: number };
  redoData: { point: PerimeterPoint };
}

export interface PerimeterCloseAction {
  type: 'PERIMETER_CLOSE';
  undoData: { currentPerimeter: PerimeterPoint[] };
  redoData: { perimeter: Perimeter };
}

// Define the undo/redo state structure
interface UndoRedoState {
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
  maxHistorySize: number;
  isUndoing: boolean;
  isRedoing: boolean;

  // Actions
  addAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => void;
  undo: () => UndoRedoAction | null;
  redo: () => UndoRedoAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;

  // Internal state management
  setUndoing: (isUndoing: boolean) => void;
  setRedoing: (isRedoing: boolean) => void;
}

// Create the undo/redo store
export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50, // Limit history to prevent memory issues
  isUndoing: false,
  isRedoing: false,

  addAction: (action) => {
    const state = get();

    // Don't add actions during undo/redo operations
    if (state.isUndoing || state.isRedoing) {
      return;
    }

    const newAction: UndoRedoAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      undoStack: [
        ...state.undoStack.slice(-(state.maxHistorySize - 1)), // Keep within size limit
        newAction
      ],
      redoStack: [] // Clear redo stack when new action is added
    }));
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) {
      return null;
    }

    const actionToUndo = state.undoStack[state.undoStack.length - 1];

    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, actionToUndo],
      isUndoing: true
    }));

    return actionToUndo;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) {
      return null;
    }

    const actionToRedo = state.redoStack[state.redoStack.length - 1];

    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, actionToRedo],
      isRedoing: true
    }));

    return actionToRedo;
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  canRedo: () => {
    return get().redoStack.length > 0;
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: []
    });
  },

  getUndoDescription: () => {
    const state = get();
    if (state.undoStack.length === 0) {
      return null;
    }
    return state.undoStack[state.undoStack.length - 1].description;
  },

  getRedoDescription: () => {
    const state = get();
    if (state.redoStack.length === 0) {
      return null;
    }
    return state.redoStack[state.redoStack.length - 1].description;
  },

  setUndoing: (isUndoing) => {
    set({ isUndoing });
  },

  setRedoing: (isRedoing) => {
    set({ isRedoing });
  },
}));

// Helper functions to create specific action types
export const createEquipmentAddAction = (item: EquipmentItem): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_ADD',
  description: `Add ${item.name}`,
  undoData: { itemId: item.id },
  redoData: { item }
});

export const createEquipmentRemoveAction = (items: EquipmentItem[], selectedIds: string[]): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_REMOVE',
  description: items.length === 1 ? `Remove ${items[0].name}` : `Remove ${items.length} items`,
  undoData: { items: [...items], selectedIds: [...selectedIds] },
  redoData: { itemIds: items.map(item => item.id) }
});

export const createEquipmentMoveAction = (itemId: string, itemName: string, previousX: number, previousY: number, newX: number, newY: number): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_MOVE',
  description: `Move ${itemName}`,
  undoData: { itemId, previousX, previousY },
  redoData: { itemId, newX, newY }
});

export const createEquipmentBulkMoveAction = (items: Array<{ id: string; name: string; previousX: number; previousY: number; newX: number; newY: number }>): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_MOVE',
  description: items.length === 1 ? `Move ${items[0].name}` : `Move ${items.length} items`,
  undoData: {
    items: items.map(item => ({ id: item.id, x: item.previousX, y: item.previousY }))
  },
  redoData: {
    items: items.map(item => ({ id: item.id, x: item.newX, y: item.newY }))
  }
});

export const createEquipmentRotateAction = (itemId: string, itemName: string, previousRotation: number, newRotation: number): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_ROTATE',
  description: `Rotate ${itemName}`,
  undoData: { itemId, previousRotation },
  redoData: { itemId, newRotation }
});

export const createEquipmentResizeAction = (itemId: string, itemName: string, previousWidth: number, previousHeight: number, newWidth: number, newHeight: number): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_RESIZE',
  description: `Resize ${itemName}`,
  undoData: { itemId, previousWidth, previousHeight },
  redoData: { itemId, newWidth, newHeight }
});

export const createEquipmentUpdateAction = (itemId: string, itemName: string, previousData: Partial<EquipmentItem>, newData: Partial<EquipmentItem>): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'EQUIPMENT_UPDATE',
  description: `Update ${itemName}`,
  undoData: { itemId, previousData },
  redoData: { itemId, newData }
});

export const createMeasurementAddAction = (line: MeasurementLine): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'MEASUREMENT_ADD',
  description: `Add measurement line`,
  undoData: { lineId: line.id },
  redoData: { line }
});

export const createMeasurementRemoveAction = (line: MeasurementLine): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'MEASUREMENT_REMOVE',
  description: `Remove measurement line`,
  undoData: { line },
  redoData: { lineId: line.id }
});

export const createPerimeterAddPointAction = (point: PerimeterPoint, pointCount: number): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'PERIMETER_ADD_POINT',
  description: `Add perimeter point ${pointCount + 1}`,
  undoData: { pointCount },
  redoData: { point }
});

export const createPerimeterCloseAction = (currentPerimeter: PerimeterPoint[], perimeter: Perimeter): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type: 'PERIMETER_CLOSE',
  description: `Close perimeter`,
  undoData: { currentPerimeter: [...currentPerimeter] },
  redoData: { perimeter }
});