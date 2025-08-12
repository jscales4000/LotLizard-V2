// Equipment Category Type
export type EquipmentCategory = 
  | 'mega-rides'
  | 'rides'
  | 'kiddy-rides'
  | 'food'
  | 'games'
  | 'equipment'
  | 'office'
  | 'home'
  | 'bunks'
  | 'utility'
  | 'custom';

// Equipment Template Interface
export interface EquipmentTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  shape: 'rectangle' | 'circle';
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  description: string;
  clearanceLeft?: number;
  clearanceRight?: number;
  clearanceTop?: number;
  clearanceBottom?: number;
  clearanceRadius?: number;
  minSpacing?: number;
  capacity: number;
  weight: number;
  verticalHeight: number;
  turnAroundTime: number;
  isCustom?: boolean;
}

export class EquipmentService {
  /**
   * Get all available equipment templates with corrected properties from research-verified data
   */
  static getEquipmentTemplates(): EquipmentTemplate[] {
    return [
      // Utility - Calibration Square
      {
        id: 'calibration-square',
        name: 'Calibration Square (30x30)',
        category: 'utility' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 30, // 30 feet
        height: 30, // 30 feet
        color: '#34495E',
        description: '30x30 ft calibration reference square',
        clearanceLeft: 0,
        clearanceRight: 0,
        clearanceTop: 0,
        clearanceBottom: 0,
        capacity: 0,
        weight: 0,
        verticalHeight: 0,
        turnAroundTime: 0
      },
      
      // Professional Carnival Rides - From Corrected Equipment Library
      {
        id: 'bounce',
        name: 'Bounce',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 20,
        height: 25,
        color: '#FF6B6B',
        description: 'Bounce - Professional amusement ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 50,
        weight: 25000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'century-wheel',
        name: 'Century Wheel',
        category: 'rides' as EquipmentCategory,
        shape: 'circle' as const,
        radius: 32.5,
        color: '#4ECDC4',
        description: 'Century Wheel - Ferris wheel, 65-70 feet tall with 15 gondolas',
        clearanceRadius: 12,
        capacity: 90,
        weight: 150000,
        verticalHeight: 70,
        turnAroundTime: 5
      },
      {
        id: 'cliffhanger',
        name: 'Cliffhanger',
        category: 'rides' as EquipmentCategory,
        shape: 'circle' as const,
        radius: 37.5,
        color: '#45B7D1',
        description: 'Cliffhanger - Hang gliding simulation ride with hydraulic lift',
        clearanceRadius: 15,
        capacity: 30,
        weight: 120000,
        verticalHeight: 35,
        turnAroundTime: 4
      },
      {
        id: 'crystal-lils',
        name: 'Crystal Lils',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 70,
        height: 18,
        color: '#96CEB4',
        description: 'Crystal Lils - Professional amusement ride',
        clearanceLeft: 6,
        clearanceRight: 6,
        clearanceTop: 6,
        clearanceBottom: 6,
        capacity: 126,
        weight: 63000,
        verticalHeight: 56,
        turnAroundTime: 3
      },
      {
        id: 'euro-wheel',
        name: 'Euro Wheel',
        category: 'rides' as EquipmentCategory,
        shape: 'circle' as const,
        radius: 24,
        color: '#98D8C8',
        description: 'Euro Wheel - Ferris wheel, smaller than Century Wheel',
        clearanceRadius: 7,
        capacity: 64,
        weight: 80000,
        verticalHeight: 48,
        turnAroundTime: 4
      },
      {
        id: 'farm-train',
        name: 'Farm Train',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 60,
        height: 30,
        color: '#F7DC6F',
        description: 'Farm Train - Trackless train ride for families',
        clearanceLeft: 21,
        clearanceRight: 21,
        clearanceTop: 21,
        clearanceBottom: 21,
        capacity: 180,
        weight: 90000,
        verticalHeight: 48,
        turnAroundTime: 3
      },
      {
        id: 'freak-out',
        name: 'Freak Out',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 48,
        height: 56,
        color: '#BB8FCE',
        description: 'Freak Out - Pendulum thrill ride',
        clearanceLeft: 14,
        clearanceRight: 14,
        clearanceTop: 14,
        clearanceBottom: 14,
        capacity: 32,
        weight: 120000,
        verticalHeight: 42,
        turnAroundTime: 3
      },
      {
        id: 'himalaya',
        name: 'Himalaya',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 55,
        height: 46,
        color: '#F8C471',
        description: 'Himalaya - High-speed spinning ride with cars on undulating track',
        clearanceLeft: 22,
        clearanceRight: 22,
        clearanceTop: 22,
        clearanceBottom: 22,
        capacity: 40,
        weight: 100000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'mgr',
        name: 'MGR',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 42,
        height: 42,
        color: '#F1948A',
        description: 'MGR - Professional amusement ride',
        clearanceLeft: 24,
        clearanceRight: 24,
        clearanceTop: 24,
        clearanceBottom: 24,
        capacity: 55,
        weight: 27500,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'ring',
        name: 'Ring',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 60,
        height: 60,
        color: '#F9E79F',
        description: 'Ring - Circular spinning ride',
        clearanceLeft: 16,
        clearanceRight: 16,
        clearanceTop: 16,
        clearanceBottom: 16,
        capacity: 40,
        weight: 85000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'sand-storm',
        name: 'Sand Storm',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 50,
        height: 24,
        color: '#AED6F1',
        description: 'Sand Storm - High-capacity spinning ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 48,
        weight: 90000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'slide',
        name: 'Slide',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 20,
        height: 105,
        color: '#F5B7B1',
        description: 'Slide - Fun slide attraction for all ages',
        clearanceLeft: 4,
        clearanceRight: 4,
        clearanceTop: 4,
        clearanceBottom: 4,
        capacity: 200,
        weight: 35000,
        verticalHeight: 44,
        turnAroundTime: 1
      },
      {
        id: 'spider',
        name: 'Spider',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 48,
        height: 48,
        color: '#85C1E9',
        description: 'Spider - Spinning ride with individual car control',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 32,
        weight: 75000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'starship',
        name: 'Starship',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 46,
        height: 4,
        color: '#A9CCE3',
        description: 'Starship - Space-themed ride attraction',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 40,
        weight: 65000,
        verticalHeight: 20,
        turnAroundTime: 3
      },
      {
        id: 'swings',
        name: 'Swings',
        category: 'rides' as EquipmentCategory,
        shape: 'circle' as const,
        radius: 15,
        color: '#A3E4D7',
        description: 'Swings - Flying chairs/wave swinger ride',
        clearanceRadius: 10,
        capacity: 24,
        weight: 45000,
        verticalHeight: 24,
        turnAroundTime: 3
      },
      {
        id: 'tornado',
        name: 'Tornado',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 45,
        height: 30,
        color: '#F7DC6F',
        description: 'Tornado - Spinning ride with tornado theme',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 32,
        weight: 67500,
        verticalHeight: 25,
        turnAroundTime: 3
      },
      {
        id: 'vertigo',
        name: 'Vertigo',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 80,
        height: 40,
        color: '#D7BDE2',
        description: 'Vertigo - Large spinning thrill ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 40,
        weight: 160000,
        verticalHeight: 64,
        turnAroundTime: 4
      },
      {
        id: 'wacky-shack',
        name: 'Wacky Shack',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 40,
        height: 16,
        color: '#AED6F1',
        description: 'Wacky Shack - Dark ride/funhouse attraction',
        clearanceLeft: 9,
        clearanceRight: 9,
        clearanceTop: 9,
        clearanceBottom: 9,
        capacity: 64,
        weight: 32000,
        verticalHeight: 32,
        turnAroundTime: 5
      },
      {
        id: 'zero-gravity',
        name: 'Zero Gravity',
        category: 'rides' as EquipmentCategory,
        shape: 'circle' as const,
        radius: 27.5,
        color: '#A9DFBF',
        description: 'Zero Gravity - Round-up style ride that spins and tilts vertically',
        clearanceRadius: 10,
        capacity: 45,
        weight: 75000,
        verticalHeight: 25,
        turnAroundTime: 3
      },
      {
        id: 'zipper',
        name: 'Zipper',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 57,
        height: 17,
        color: '#F5B7B1',
        description: 'Zipper - Iconic thrill ride with rotating boom and flipping cars',
        clearanceLeft: 15,
        clearanceRight: 15,
        clearanceTop: 15,
        clearanceBottom: 15,
        capacity: 24,
        weight: 43000,
        verticalHeight: 56,
        turnAroundTime: 3
      },
      
      {        
        id: 'fury',
        name: 'Fury',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 53,
        height: 30,
        color: '#FF9F43',
        description: 'Fury - Professional amusement ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 159,
        weight: 79500,
        verticalHeight: 42,
        turnAroundTime: 3
      },
      {
        id: 'magic-maze',
        name: 'Magic Maze',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 70,
        height: 18,
        color: '#6C5CE7',
        description: 'Magic Maze - Professional amusement ride',
        clearanceLeft: 6,
        clearanceRight: 6,
        clearanceTop: 6,
        clearanceBottom: 6,
        capacity: 126,
        weight: 63000,
        verticalHeight: 56,
        turnAroundTime: 3
      },
      {
        id: 'mini-mgr',
        name: 'Mini MGR',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 22,
        height: 25,
        color: '#FD79A8',
        description: 'Mini MGR - Professional amusement ride',
        clearanceLeft: 14,
        clearanceRight: 14,
        clearanceTop: 14,
        clearanceBottom: 14,
        capacity: 30,
        weight: 15000,
        verticalHeight: 16,
        turnAroundTime: 3
      },
      {
        id: 'raiders',
        name: 'Raiders',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 60,
        height: 18,
        color: '#00B894',
        description: 'Raiders - Professional amusement ride',
        clearanceLeft: 6,
        clearanceRight: 6,
        clearanceTop: 6,
        clearanceBottom: 6,
        capacity: 108,
        weight: 54000,
        verticalHeight: 32,
        turnAroundTime: 3
      },
      {
        id: 'rockstar',
        name: 'Rockstar',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 50,
        height: 24,
        color: '#E17055',
        description: 'Rockstar - Professional amusement ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 120,
        weight: 60000,
        verticalHeight: 36,
        turnAroundTime: 3
      },
      {
        id: 'sizzler',
        name: 'Sizzler',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 60,
        height: 60,
        color: '#FDCB6E',
        description: 'Sizzler - Professional amusement ride',
        clearanceLeft: 0,
        clearanceRight: 0,
        clearanceTop: 0,
        clearanceBottom: 0,
        capacity: 180,
        weight: 90000,
        verticalHeight: 32,
        turnAroundTime: 3
      },
      {
        id: 'speedway',
        name: 'Speedway',
        category: 'rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 55,
        height: 22,
        color: '#A29BFE',
        description: 'Speedway - Professional amusement ride',
        clearanceLeft: 10,
        clearanceRight: 10,
        clearanceTop: 10,
        clearanceBottom: 10,
        capacity: 88,
        weight: 44000,
        verticalHeight: 28,
        turnAroundTime: 3
      },
      
      // Kiddy Rides
      {
        id: 'dizzy-dragon',
        name: 'Dizzy Dragon',
        category: 'kiddy-rides' as EquipmentCategory,
        shape: 'rectangle' as const,
        width: 30,
        height: 30,
        color: '#FFEAA7',
        description: 'Dizzy Dragon - Interactive spinning ride with 4 friendly dragons for children',
        clearanceLeft: 8,
        clearanceRight: 8,
        clearanceTop: 8,
        clearanceBottom: 8,
        capacity: 16,
        weight: 25000,
        verticalHeight: 12,
        turnAroundTime: 2
      }
    ];
  }

  /**
   * Convert equipment template dimensions from feet to pixels
   */
  static convertToPixelDimensions(widthFeet: number, heightFeet: number, pixelsPerFoot: number): { width: number; height: number } {
    return {
      width: widthFeet * pixelsPerFoot,
      height: heightFeet * pixelsPerFoot
    };
  }

  /**
   * Convert circular equipment template dimensions from feet to pixels
   */
  static convertCircleToPixelDimensions(radiusFeet: number, pixelsPerFoot: number): { width: number; height: number; radius: number } {
    const radiusPixels = radiusFeet * pixelsPerFoot;
    return {
      width: radiusPixels * 2,
      height: radiusPixels * 2,
      radius: radiusPixels
    };
  }

  /**
   * Get pixel dimensions for any equipment template (rectangle or circle)
   */
  static getPixelDimensions(
    template: EquipmentTemplate,
    pixelsPerFoot: number
  ): { width: number; height: number; radius?: number } {
    if (template.shape === 'circle' && template.radius) {
      return this.convertCircleToPixelDimensions(template.radius, pixelsPerFoot);
    } else if (template.shape === 'rectangle' && template.width && template.height) {
      return this.convertToPixelDimensions(template.width, template.height, pixelsPerFoot);
    }
    return { width: 30 * pixelsPerFoot, height: 30 * pixelsPerFoot };
  }

  /**
   * Validate equipment placement
   */
  static validatePlacement(
    newItem: {
      x: number;
      y: number;
      width: number;
      height: number;
      minSpacing?: number;
    },
    existingItems: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      minSpacing?: number;
    }>,
    pixelsPerFoot: number
  ): { valid: boolean; error?: string } {
    // Basic validation - can be expanded with collision detection
    if (newItem.x < 0 || newItem.y < 0) {
      return { valid: false, error: 'Item cannot be placed at negative coordinates' };
    }
    
    // For now, always return valid - collision detection can be added later
    return { valid: true };
  }

  /**
   * Delete equipment template (placeholder implementation)
   */
  static deleteEquipmentTemplate(id: string): void {
    // This method would typically interact with a backend or local storage
    // For now, it's a placeholder that doesn't do anything
    console.log(`Delete equipment template: ${id}`);
  }

  /**
   * Save equipment template (placeholder implementation)
   */
  static saveEquipmentTemplate(template: EquipmentTemplate & { isCustom?: boolean }): void {
    // This method would typically interact with a backend or local storage
    // For now, it's a placeholder that doesn't do anything
    console.log(`Save equipment template: ${template.id}`, template);
  }

  /**
   * Get all equipment templates (alias for getEquipmentTemplates)
   */
  static getAllEquipmentTemplates(): EquipmentTemplate[] {
    return this.getEquipmentTemplates();
  }

  /**
   * Format dimensions for display
   */
  static formatDimensions(width: number, height: number, unit: string): string {
    return `${width} × ${height} ${unit}`;
  }

  /**
   * Format equipment dimensions based on shape (rectangle or circle)
   */
  static formatEquipmentDimensions(item: EquipmentTemplate, unit: string = 'ft'): string {
    if (item.shape === 'circle' && item.radius) {
      return `⌀${item.radius * 2} ${unit} (radius: ${item.radius} ${unit})`;
    } else if (item.shape === 'rectangle' && item.width && item.height) {
      return `${item.width} × ${item.height} ${unit}`;
    }
    return 'Dimensions not specified';
  }
}
