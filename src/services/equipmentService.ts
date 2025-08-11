// Service for handling equipment operations with shape-based dimensions in feet

export interface EquipmentTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  shape: 'rectangle' | 'circle';
  // Dimensions in feet
  width?: number; // in feet (for rectangles)
  height?: number; // in feet (for rectangles)
  radius?: number; // in feet (for circles)
  color: string;
  description?: string;
  minSpacing?: number; // minimum spacing from other equipment in feet
  isCustom?: boolean; // flag for custom user-created equipment
  // Default clearance zone parameters in feet
  clearanceLeft?: number; // in feet (for rectangles)
  clearanceRight?: number; // in feet (for rectangles)
  clearanceTop?: number; // in feet (for rectangles)
  clearanceBottom?: number; // in feet (for rectangles)
  clearanceRadius?: number; // in feet (for circles)
}

// Type for equipment categories
export type EquipmentCategory = 'booth' | 'ride' | 'game' | 'food' | 'utility' | 'custom';

export class EquipmentService {
  private static readonly STORAGE_KEY = 'lotlizard_custom_equipment';
  
  /**
   * Standard carnival equipment templates with real-world dimensions in feet
   */
  static getEquipmentTemplates(): EquipmentTemplate[] {
    return [
      // Booths
      {
        id: 'small-booth',
        name: 'Small Booth',
        category: 'booth',
        shape: 'rectangle',
        width: 10, // 10 feet
        height: 10, // 10 feet
        color: '#FF6B35',
        description: '10x10 ft vendor booth',
        minSpacing: 3
      },
      {
        id: 'medium-booth',
        name: 'Medium Booth',
        category: 'booth',
        shape: 'rectangle',
        width: 15, // 15 feet
        height: 15, // 15 feet
        color: '#FF8E53',
        description: '15x15 ft vendor booth',
        minSpacing: 3
      },
      {
        id: 'large-booth',
        name: 'Large Booth',
        category: 'booth',
        shape: 'rectangle',
        width: 20, // 20 feet
        height: 20, // 20 feet
        color: '#FFB366',
        description: '20x20 ft vendor booth',
        minSpacing: 4
      },
      
      // Calibration
      {
        id: 'calibration-square',
        name: 'Calibration Square (30×30 ft)',
        category: 'utility',
        shape: 'rectangle',
        width: 30, // 30 feet
        height: 30, // 30 feet
        color: '#ff5722',
        minSpacing: 2
      },
      
      // Rides
      {
        id: 'small-ride',
        name: 'Small Ride',
        category: 'ride',
        shape: 'rectangle',
        width: 30, // 30 feet
        height: 30, // 30 feet
        color: '#E74C3C',
        description: '30x30 ft ride (Tilt-a-Whirl, etc.)',
        minSpacing: 10
      },
      {
        id: 'large-ride',
        name: 'Large Ride',
        category: 'ride',
        shape: 'rectangle',
        width: 50, // 50 feet
        height: 50, // 50 feet
        color: '#C0392B',
        description: '50x50 ft ride (Ferris Wheel, etc.)',
        minSpacing: 15
      },
      {
        id: 'circular-ride',
        name: 'Circular Ride',
        category: 'ride',
        shape: 'circle',
        radius: 25, // 25 feet radius (50 ft diameter)
        color: '#8E44AD',
        description: '50 ft diameter circular ride',
        minSpacing: 15
      },
      
      // Games
      {
        id: 'game-booth',
        name: 'Game Booth',
        category: 'game',
        shape: 'rectangle',
        width: 8, // 8 feet
        height: 13, // 13 feet
        color: '#3498DB',
        description: '8x13 ft game booth',
        minSpacing: 2
      },
      {
        id: 'ring-toss',
        name: 'Ring Toss',
        category: 'game',
        shape: 'rectangle',
        width: 10, // 10 feet
        height: 6, // 6 feet
        color: '#5DADE2',
        description: '10x6 ft ring toss game',
        minSpacing: 3
      },
      
      // Food
      {
        id: 'food-truck',
        name: 'Food Truck',
        category: 'food',
        shape: 'rectangle',
        width: 23, // 23 feet
        height: 8, // 8 feet
        color: '#F39C12',
        description: '23x8 ft food truck',
        minSpacing: 6
      },
      {
        id: 'concession-stand',
        name: 'Concession Stand',
        category: 'food',
        shape: 'rectangle',
        width: 13, // 13 feet
        height: 10, // 10 feet
        color: '#F7DC6F',
        description: '13x10 ft concession stand',
        minSpacing: 4
      },
      
      // Utilities
      {
        id: 'restroom',
        name: 'Portable Restroom',
        category: 'utility',
        shape: 'rectangle',
        width: 4, // 4 feet
        height: 4, // 4 feet
        color: '#95A5A6',
        description: '4x4 ft portable restroom',
        minSpacing: 2
      },
      {
        id: 'generator',
        name: 'Generator',
        category: 'utility',
        shape: 'rectangle',
        width: 6.5, // 6.5 feet
        height: 5, // 5 feet
        color: '#7F8C8D',
        description: '6.5x5 ft generator',
        minSpacing: 10 // Safety spacing for generator
      }
    ];
  }

  /**
   * Convert real-world dimensions to pixel dimensions
   */
  static convertToPixelDimensions(
    widthFeet: number, 
    heightFeet: number, 
    pixelsPerFoot: number
  ): { width: number; height: number } {
    return {
      width: widthFeet * pixelsPerFoot,
      height: heightFeet * pixelsPerFoot
    };
  }

  /**
   * Convert circular dimensions to pixel dimensions
   */
  static convertCircleToPixelDimensions(
    radiusFeet: number,
    pixelsPerFoot: number
  ): { width: number; height: number; radius: number } {
    const pixelRadius = radiusFeet * pixelsPerFoot;
    return {
      width: pixelRadius * 2,
      height: pixelRadius * 2,
      radius: pixelRadius
    };
  }

  /**
   * Get pixel dimensions for any equipment template
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
    
    // Fallback for invalid templates
    return { width: 30 * pixelsPerFoot, height: 30 * pixelsPerFoot };
  }

  /**
   * Validate equipment placement
   */
  static validatePlacement(
    newItem: { x: number; y: number; width: number; height: number; minSpacing?: number },
    existingItems: Array<{ x: number; y: number; width: number; height: number; minSpacing?: number }>,
    pixelsPerFoot: number
  ): { valid: boolean; error?: string } {
    const minSpacingPixels = (newItem.minSpacing || 0) * pixelsPerFoot;
    
    for (const item of existingItems) {
      const distance = Math.sqrt(
        Math.pow(newItem.x - item.x, 2) + Math.pow(newItem.y - item.y, 2)
      );
      
      const requiredDistance = minSpacingPixels + ((item.minSpacing || 0) * pixelsPerFoot);
      
      if (distance < requiredDistance) {
        return {
          valid: false,
          error: `Equipment too close to existing item. Minimum spacing: ${newItem.minSpacing || 0} ft`
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Format dimensions for display
   */
  static formatDimensions(width: number, height: number, unit: 'feet' | 'meters' = 'feet'): string {
    const unitSymbol = unit === 'feet' ? 'ft' : 'm';
    return `${width.toFixed(1)} × ${height.toFixed(1)} ${unitSymbol}`;
  }

  /**
   * Save custom equipment to localStorage
   */
  static saveCustomEquipment(equipment: EquipmentTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(equipment));
    } catch (error) {
      console.error('Failed to save custom equipment:', error);
    }
  }

  /**
   * Load custom equipment from localStorage
   */
  static loadCustomEquipment(): EquipmentTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom equipment:', error);
      return [];
    }
  }

  /**
   * Get all equipment templates (standard + custom)
   */
  static getAllEquipmentTemplates(): EquipmentTemplate[] {
    return [
      ...this.getEquipmentTemplates(),
      ...this.loadCustomEquipment()
    ];
  }

  /**
   * Add or update equipment template
   */
  static saveEquipmentTemplate(template: EquipmentTemplate): void {
    const customEquipment = this.loadCustomEquipment();
    const existingIndex = customEquipment.findIndex(item => item.id === template.id);
    
    if (existingIndex >= 0) {
      customEquipment[existingIndex] = { ...template, isCustom: true };
    } else {
      customEquipment.push({ ...template, isCustom: true });
    }
    
    this.saveCustomEquipment(customEquipment);
  }

  /**
   * Delete custom equipment template
   */
  static deleteEquipmentTemplate(templateId: string): void {
    const customEquipment = this.loadCustomEquipment();
    const filtered = customEquipment.filter(item => item.id !== templateId);
    this.saveCustomEquipment(filtered);
  }
}
