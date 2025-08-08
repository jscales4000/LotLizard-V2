import { create } from 'zustand';

// Define equipment item structure
export interface EquipmentItem {
  id: string;
  type: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  properties: Record<string, any>;
}

// Define the state structure
interface EquipmentState {
  items: EquipmentItem[];
  selectedId: string | null;
  equipmentLibrary: {
    id: string;
    type: string;
    name: string;
    width: number;
    height: number;
    color: string;
    properties: Record<string, any>;
    thumbnail?: string;
  }[];
  
  // Actions
  addItem: (item: Omit<EquipmentItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<EquipmentItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  moveItem: (id: string, position: { x: number; y: number }) => void;
  rotateItem: (id: string, rotation: number) => void;
  resizeItem: (id: string, dimensions: { width: number; height: number }) => void;
}

// Create the store
export const useEquipmentStore = create<EquipmentState>((set) => ({
  items: [],
  selectedId: null,
  equipmentLibrary: [
    {
      id: 'booth-small',
      type: 'booth',
      name: 'Small Booth',
      width: 10,
      height: 10,
      color: '#8B4513',
      properties: { capacity: 2 }
    },
    {
      id: 'booth-medium',
      type: 'booth',
      name: 'Medium Booth',
      width: 15,
      height: 15,
      color: '#8B4513',
      properties: { capacity: 4 }
    },
    {
      id: 'booth-large',
      type: 'booth',
      name: 'Large Booth',
      width: 20,
      height: 20,
      color: '#8B4513',
      properties: { capacity: 8 }
    },
    {
      id: 'ride-small',
      type: 'ride',
      name: 'Small Ride',
      width: 30,
      height: 30,
      color: '#FF6347',
      properties: { capacity: 10, powerRequired: true }
    },
    {
      id: 'ride-large',
      type: 'ride',
      name: 'Large Ride',
      width: 50,
      height: 50,
      color: '#FF4500',
      properties: { capacity: 30, powerRequired: true }
    }
  ],
  
  // Implement actions
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: `item-${Date.now()}` }]
  })),
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
  moveItem: (id, position) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, ...position } : item
    )
  })),
  rotateItem: (id, rotation) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, rotation } : item
    )
  })),
  resizeItem: (id, dimensions) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, ...dimensions } : item
    )
  })),
}));
