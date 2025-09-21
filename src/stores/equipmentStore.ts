import { create } from 'zustand';
import { EquipmentService, EquipmentTemplate, EquipmentCategory } from '../services/equipmentService';
import {
  useUndoRedoStore,
  createEquipmentAddAction,
  createEquipmentRemoveAction,
  createEquipmentBulkMoveAction
} from './undoRedoStore';

// Define equipment item structure
export interface EquipmentItem {
  id: string;
  name: string;
  category?: EquipmentCategory;
  x: number;
  y: number;
  width: number; // in pixels (for rectangles)
  height: number; // in pixels (for rectangles)
  rotation: number;
  color: string;
  type: string;
  templateId: string;
  shape: 'rectangle' | 'circle';
  // Real-world dimensions in feet
  realWorldWidth?: number; // in feet (for rectangles)
  realWorldHeight?: number; // in feet (for rectangles)
  realWorldRadius?: number; // in feet (for circles)
  minSpacing?: number; // in feet
  // Clearance zone parameters in feet
  clearanceLeft?: number; // in feet (for rectangles)
  clearanceRight?: number; // in feet (for rectangles)
  clearanceTop?: number; // in feet (for rectangles)
  clearanceBottom?: number; // in feet (for rectangles)
  clearanceRadius?: number; // in feet (for circles)
  // Additional equipment properties
  capacity?: number; // number of people
  weight?: number; // in lbs
  verticalHeight?: number; // in feet
  turnAroundTime?: number; // in minutes
  powerLoad?: number; // power consumption in watts/amps
  powerGen?: number; // power generation in watts/amps
  ticketCount?: number; // number of tickets required
  // Visibility control
  visible?: boolean; // whether item is visible on canvas (default: true)
}

// Define the state structure
interface EquipmentState {
  items: EquipmentItem[];
  selectedIds: string[];
  clipboardItems: EquipmentItem[];
  equipmentLibrary: EquipmentTemplate[];
  
  // Actions
  addItem: (item: Omit<EquipmentItem, 'id'>) => void;
  addItemFromTemplate: (templateId: string, x: number, y: number, pixelsPerFoot: number) => string | null;
  updateItem: (id: string, updates: Partial<EquipmentItem>) => void;
  updateItemWithDimensions: (id: string, updates: Partial<EquipmentItem>, pixelsPerFoot: number) => void;
  updateTemplate: (templateId: string, updates: Partial<EquipmentTemplate>) => void;
  updateEquipmentLibrary: (templates: EquipmentTemplate[]) => void;
  removeItem: (id: string) => void;
  removeSelectedItems: () => void;
  selectItem: (id: string | null) => void;
  selectMultiple: (id: string, append: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  moveItem: (id: string, x: number, y: number) => void;
  moveSelectedItems: (deltaX: number, deltaY: number) => void;
  rotateItem: (id: string, rotation: number) => void;
  resizeItem: (id: string, width: number, height: number) => void;
  updateItemDimensions: (pixelsPerFoot: number) => void;
  toggleItemVisibility: (id: string) => void;
  copySelectedItems: () => void;
  pasteItems: (x?: number, y?: number) => void;
  clearAll: () => void;

  // Undo/Redo actions
  undoLastAction: () => void;
  redoLastAction: () => void;

  // Helpers
  getSelectedItems: () => EquipmentItem[];
  isSelected: (id: string) => boolean;
}

// Create the store
export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  items: [],
  selectedIds: [],
  clipboardItems: [],
  equipmentLibrary: EquipmentService.getEquipmentTemplates(),
  
  // Implement actions
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: `item-${Date.now()}` }]
  })),
  
  addItemFromTemplate: (templateId, x, y, pixelsPerFoot) => {
    const template = get().equipmentLibrary.find(t => t.id === templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return null;
    }
    
    const pixelDimensions = EquipmentService.getPixelDimensions(template, pixelsPerFoot);
    
    // Validate placement
    const validation = EquipmentService.validatePlacement(
      {
        x,
        y,
        width: pixelDimensions.width,
        height: pixelDimensions.height,
        minSpacing: template.minSpacing
      },
      get().items.map(item => ({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        minSpacing: item.minSpacing
      })),
      pixelsPerFoot
    );
    
    if (!validation.valid) {
      console.warn('Equipment placement validation failed:', validation.error);
      return null;
    }
    
    const newItem: EquipmentItem = {
      id: `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      category: template.category,
      x,
      y,
      width: pixelDimensions.width,
      height: pixelDimensions.height,
      rotation: 0,
      color: template.color,
      type: template.category,
      templateId: template.id,
      shape: template.shape,
      realWorldWidth: template.width,
      realWorldHeight: template.height,
      realWorldRadius: template.radius,
      minSpacing: template.minSpacing,
      // Copy clearance parameters from template
      clearanceLeft: template.clearanceLeft,
      clearanceRight: template.clearanceRight,
      clearanceTop: template.clearanceTop,
      clearanceBottom: template.clearanceBottom,
      clearanceRadius: template.clearanceRadius,
      // Copy additional equipment properties from template
      capacity: template.capacity,
      weight: template.weight,
      verticalHeight: template.verticalHeight,
      turnAroundTime: template.turnAroundTime
    };
    
    set((state) => ({
      items: [...state.items, newItem]
    }));

    // Record action for undo/redo
    const { addAction } = useUndoRedoStore.getState();
    addAction(createEquipmentAddAction(newItem));

    return newItem.id;
  },
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  updateItemWithDimensions: (id: string, updates: Partial<EquipmentItem>, pixelsPerFoot: number) => set((state) => ({
    items: state.items.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, ...updates };
      
      // Recalculate pixel dimensions if real-world dimensions changed
      if (updates.realWorldWidth || updates.realWorldHeight || updates.realWorldRadius || updates.shape) {
        let pixelDimensions;
        if (updatedItem.shape === 'circle' && updatedItem.realWorldRadius) {
          pixelDimensions = EquipmentService.convertCircleToPixelDimensions(
            updatedItem.realWorldRadius,
            pixelsPerFoot
          );
        } else if (updatedItem.realWorldWidth && updatedItem.realWorldHeight) {
          pixelDimensions = EquipmentService.convertToPixelDimensions(
            updatedItem.realWorldWidth,
            updatedItem.realWorldHeight,
            pixelsPerFoot
          );
        }
        
        if (pixelDimensions) {
          updatedItem.width = pixelDimensions.width;
          updatedItem.height = pixelDimensions.height;
        }
      }
      
      return updatedItem;
    })
  })),
  
  updateTemplate: (templateId, updates) => set((state) => ({
    equipmentLibrary: state.equipmentLibrary.map(template => 
      template.id === templateId ? { ...template, ...updates } : template
    )
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id),
    selectedIds: state.selectedIds.filter(selectedId => selectedId !== id)
  })),
  
  removeSelectedItems: () => {
    const state = get();
    const itemsToRemove = state.items.filter(item => state.selectedIds.includes(item.id));

    if (itemsToRemove.length === 0) return;

    // Record action for undo/redo
    const { addAction } = useUndoRedoStore.getState();
    addAction(createEquipmentRemoveAction(itemsToRemove, state.selectedIds));

    set((state) => ({
      items: state.items.filter(item => !state.selectedIds.includes(item.id)),
      selectedIds: []
    }));
  },
  
  selectItem: (id) => set({ selectedIds: id ? [id] : [] }),
  
  selectMultiple: (id, append) => set((state) => {
    if (!id) return { selectedIds: [] };
    
    if (append) {
      // If already selected, deselect it
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter(selectedId => selectedId !== id) };
      }
      // Otherwise, add to selection
      return { selectedIds: [...state.selectedIds, id] };
    } else {
      // Replace selection
      return { selectedIds: [id] };
    }
  }),
  
  selectAll: () => set((state) => ({
    selectedIds: state.items.map(item => item.id)
  })),
  
  deselectAll: () => set({ selectedIds: [] }),
  moveItem: (id, x, y) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, x, y } : item
    )
  })),
  
  moveSelectedItems: (deltaX, deltaY) => {
    const state = get();
    const selectedItems = state.items.filter(item => state.selectedIds.includes(item.id));

    if (selectedItems.length === 0) return;

    // Prepare data for undo/redo
    const moveData = selectedItems.map(item => ({
      id: item.id,
      name: item.name,
      previousX: item.x,
      previousY: item.y,
      newX: item.x + deltaX,
      newY: item.y + deltaY
    }));

    // Record action for undo/redo
    const { addAction } = useUndoRedoStore.getState();
    addAction(createEquipmentBulkMoveAction(moveData));

    set((state) => ({
      items: state.items.map(item =>
        state.selectedIds.includes(item.id)
          ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
          : item
      )
    }));
  },
  rotateItem: (id, rotation) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, rotation } : item
    )
  })),
  resizeItem: (id, width, height) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, width, height } : item
    )
  })),
  
  updateItemDimensions: (pixelsPerFoot) => set((state) => ({
    items: state.items.map(item => {
      // Skip items without valid dimensions
      if (item.shape === 'rectangle' && (!item.realWorldWidth || !item.realWorldHeight)) {
        return item;
      }
      if (item.shape === 'circle' && !item.realWorldRadius) {
        return item;
      }
      
      let pixelDimensions;
      if (item.shape === 'circle' && item.realWorldRadius) {
        pixelDimensions = EquipmentService.convertCircleToPixelDimensions(
          item.realWorldRadius,
          pixelsPerFoot
        );
      } else if (item.realWorldWidth && item.realWorldHeight) {
        pixelDimensions = EquipmentService.convertToPixelDimensions(
          item.realWorldWidth,
          item.realWorldHeight,
          pixelsPerFoot
        );
      } else {
        return item;
      }
      return {
        ...item,
        width: pixelDimensions.width,
        height: pixelDimensions.height
      };
    })
  })),
  
  toggleItemVisibility: (id: string) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, visible: !(item.visible ?? true) } : item
    )
  })),
  
  clearAll: () => set({ items: [], selectedIds: [], clipboardItems: [] }),
  
  copySelectedItems: () => {
    const state = get();
    const selectedItems = state.items.filter(item => state.selectedIds.includes(item.id));
    set({ clipboardItems: JSON.parse(JSON.stringify(selectedItems)) });
  },
  
  pasteItems: (x, y) => {
    const state = get();
    if (state.clipboardItems.length === 0) return;
    
    // Default paste location is center of current view if not specified
    const pasteX = x !== undefined ? x : 400; // Default x if not specified
    const pasteY = y !== undefined ? y : 300; // Default y if not specified
    
    // Calculate the center of the copied items
    const bounds = state.clipboardItems.reduce(
      (acc, item) => ({
        minX: Math.min(acc.minX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxX: Math.max(acc.maxX, item.x + item.width),
        maxY: Math.max(acc.maxY, item.y + item.height)
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    // Calculate offset from original center to new paste location
    const offsetX = pasteX - centerX;
    const offsetY = pasteY - centerY;
    
    // Create new items with offset and new IDs
    const newItems = state.clipboardItems.map(item => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: item.x + offsetX,
      y: item.y + offsetY
    }));
    
    const newIds = newItems.map(item => item.id);
    
    set(state => ({
      items: [...state.items, ...newItems],
      selectedIds: newIds
    }));
  },
  
  // Helper methods
  getSelectedItems: () => {
    const state = get();
    return state.items.filter(item => state.selectedIds.includes(item.id));
  },
  
  updateEquipmentLibrary: (templates: EquipmentTemplate[]) => set({ equipmentLibrary: templates }),
  
  isSelected: (id) => {
    return get().selectedIds.includes(id);
  },

  // Undo/Redo implementation
  undoLastAction: () => {
    const { undo, setUndoing } = useUndoRedoStore.getState();
    const actionToUndo = undo();

    if (!actionToUndo) return;

    switch (actionToUndo.type) {
      case 'EQUIPMENT_ADD':
        // Undo add: remove the item
        set((state) => ({
          items: state.items.filter(item => item.id !== actionToUndo.undoData.itemId),
          selectedIds: state.selectedIds.filter(id => id !== actionToUndo.undoData.itemId)
        }));
        break;

      case 'EQUIPMENT_REMOVE':
        // Undo remove: restore the items
        set((state) => ({
          items: [...state.items, ...actionToUndo.undoData.items],
          selectedIds: actionToUndo.undoData.selectedIds
        }));
        break;

      case 'EQUIPMENT_MOVE':
        // Undo move: restore previous positions
        if (actionToUndo.undoData.items) {
          // Bulk move
          set((state) => ({
            items: state.items.map(item => {
              const undoItem = actionToUndo.undoData.items.find((u: any) => u.id === item.id);
              return undoItem ? { ...item, x: undoItem.x, y: undoItem.y } : item;
            })
          }));
        } else {
          // Single move
          set((state) => ({
            items: state.items.map(item =>
              item.id === actionToUndo.undoData.itemId
                ? { ...item, x: actionToUndo.undoData.previousX, y: actionToUndo.undoData.previousY }
                : item
            )
          }));
        }
        break;

      case 'EQUIPMENT_ROTATE':
        // Undo rotate: restore previous rotation
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToUndo.undoData.itemId
              ? { ...item, rotation: actionToUndo.undoData.previousRotation }
              : item
          )
        }));
        break;

      case 'EQUIPMENT_RESIZE':
        // Undo resize: restore previous dimensions
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToUndo.undoData.itemId
              ? { ...item, width: actionToUndo.undoData.previousWidth, height: actionToUndo.undoData.previousHeight }
              : item
          )
        }));
        break;

      case 'EQUIPMENT_UPDATE':
        // Undo update: restore previous data
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToUndo.undoData.itemId
              ? { ...item, ...actionToUndo.undoData.previousData }
              : item
          )
        }));
        break;
    }

    setUndoing(false);
  },

  redoLastAction: () => {
    const { redo, setRedoing } = useUndoRedoStore.getState();
    const actionToRedo = redo();

    if (!actionToRedo) return;

    switch (actionToRedo.type) {
      case 'EQUIPMENT_ADD':
        // Redo add: add the item back
        set((state) => ({
          items: [...state.items, actionToRedo.redoData.item]
        }));
        break;

      case 'EQUIPMENT_REMOVE':
        // Redo remove: remove the items again
        set((state) => ({
          items: state.items.filter(item => !actionToRedo.redoData.itemIds.includes(item.id)),
          selectedIds: []
        }));
        break;

      case 'EQUIPMENT_MOVE':
        // Redo move: apply new positions
        if (actionToRedo.redoData.items) {
          // Bulk move
          set((state) => ({
            items: state.items.map(item => {
              const redoItem = actionToRedo.redoData.items.find((r: any) => r.id === item.id);
              return redoItem ? { ...item, x: redoItem.x, y: redoItem.y } : item;
            })
          }));
        } else {
          // Single move
          set((state) => ({
            items: state.items.map(item =>
              item.id === actionToRedo.redoData.itemId
                ? { ...item, x: actionToRedo.redoData.newX, y: actionToRedo.redoData.newY }
                : item
            )
          }));
        }
        break;

      case 'EQUIPMENT_ROTATE':
        // Redo rotate: apply new rotation
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToRedo.redoData.itemId
              ? { ...item, rotation: actionToRedo.redoData.newRotation }
              : item
          )
        }));
        break;

      case 'EQUIPMENT_RESIZE':
        // Redo resize: apply new dimensions
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToRedo.redoData.itemId
              ? { ...item, width: actionToRedo.redoData.newWidth, height: actionToRedo.redoData.newHeight }
              : item
          )
        }));
        break;

      case 'EQUIPMENT_UPDATE':
        // Redo update: apply new data
        set((state) => ({
          items: state.items.map(item =>
            item.id === actionToRedo.redoData.itemId
              ? { ...item, ...actionToRedo.redoData.newData }
              : item
          )
        }));
        break;
    }

    setRedoing(false);
  }
}));
