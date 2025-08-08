import { create } from 'zustand';
import { EquipmentService, EquipmentTemplate } from '../services/equipmentService';

// Define equipment item structure
export interface EquipmentItem {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number; // in pixels
  height: number; // in pixels
  rotation: number;
  color: string;
  type: string;
  templateId: string;
  realWorldWidth: number; // in meters
  realWorldHeight: number; // in meters
  minSpacing?: number; // in meters
}

// Define the state structure
interface EquipmentState {
  items: EquipmentItem[];
  selectedId: string | null;
  equipmentLibrary: EquipmentTemplate[];
  
  // Actions
  addItem: (item: Omit<EquipmentItem, 'id'>) => void;
  addItemFromTemplate: (templateId: string, x: number, y: number, pixelsPerMeter: number) => string | null;
  updateItem: (id: string, updates: Partial<EquipmentItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  moveItem: (id: string, x: number, y: number) => void;
  rotateItem: (id: string, rotation: number) => void;
  resizeItem: (id: string, width: number, height: number) => void;
  updateItemDimensions: (pixelsPerMeter: number) => void;
  clearAll: () => void;
}

// Create the store
export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  items: [],
  selectedId: null,
  equipmentLibrary: EquipmentService.getEquipmentTemplates(),
  
  // Implement actions
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: `item-${Date.now()}` }]
  })),
  
  addItemFromTemplate: (templateId, x, y, pixelsPerMeter) => {
    const template = EquipmentService.getEquipmentTemplate(templateId);
    if (!template) return null;
    
    const pixelDimensions = EquipmentService.convertToPixelDimensions(
      template.width,
      template.height,
      pixelsPerMeter
    );
    
    const state = get();
    
    // Validate placement
    const validation = EquipmentService.validatePlacement(
      {
        x,
        y,
        width: pixelDimensions.width,
        height: pixelDimensions.height,
        minSpacing: template.minSpacing
      },
      state.items.map(item => ({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        minSpacing: item.minSpacing
      })),
      pixelsPerMeter
    );
    
    if (!validation.valid) {
      console.warn('Equipment placement validation failed:', validation.error);
      return null;
    }
    
    const newItem: EquipmentItem = {
      id: `item-${Date.now()}`,
      name: template.name,
      x,
      y,
      width: pixelDimensions.width,
      height: pixelDimensions.height,
      rotation: 0,
      color: template.color,
      type: template.category,
      templateId: template.id,
      realWorldWidth: template.width,
      realWorldHeight: template.height,
      minSpacing: template.minSpacing
    };
    
    set((state) => ({
      items: [...state.items, newItem]
    }));
    
    return newItem.id;
  },
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),
  selectItem: (id) => set({ selectedId: id }),
  moveItem: (id, x, y) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, x, y } : item
    )
  })),
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
  
  updateItemDimensions: (pixelsPerMeter) => set((state) => ({
    items: state.items.map(item => {
      const pixelDimensions = EquipmentService.convertToPixelDimensions(
        item.realWorldWidth,
        item.realWorldHeight,
        pixelsPerMeter
      );
      return {
        ...item,
        width: pixelDimensions.width,
        height: pixelDimensions.height
      };
    })
  })),
  clearAll: () => set({ items: [] })
}));
