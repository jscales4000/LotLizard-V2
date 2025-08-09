// Service for handling equipment operations and real-world dimensions

export interface EquipmentTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  width: number; // in meters
  height: number; // in meters
  color: string;
  description?: string;
  minSpacing?: number; // minimum spacing from other equipment in meters
  isCustom?: boolean; // flag for custom user-created equipment
}

// Type for equipment categories
export type EquipmentCategory = 'booth' | 'ride' | 'game' | 'food' | 'utility' | 'custom';

export class EquipmentService {
  private static readonly STORAGE_KEY = 'lotlizard_custom_equipment';
  
  /**
   * Standard carnival equipment templates with real-world dimensions
   */
  static getEquipmentTemplates(): EquipmentTemplate[] {
    return [
      // Booths
      {
        id: 'small-booth',
        name: 'Small Booth',
        category: 'booth',
        width: 3, // 10 feet
        height: 3, // 10 feet
        color: '#FF6B35',
        description: '10x10 ft vendor booth',
        minSpacing: 1
      },
      {
        id: 'medium-booth',
        name: 'Medium Booth',
        category: 'booth',
        width: 4.5, // 15 feet
        height: 4.5, // 15 feet
        color: '#FF8E53',
        description: '15x15 ft vendor booth',
        minSpacing: 1
      },
      {
        id: 'large-booth',
        name: 'Large Booth',
        category: 'booth',
        width: 6, // 20 feet
        height: 6, // 20 feet
        color: '#8e24aa',
        description: '20x20 ft vendor booth',
        minSpacing: 1.5
      },
      {
        id: 'calibration-square',
        name: 'Calibration Square (30×30 ft)',
        category: 'utility',
        width: 9.144, // 30 feet in meters
        height: 9.144, // 30 feet in meters
        color: '#ff5722',
        minSpacing: 2
      },
      
      // Rides
      {
        id: 'small-ride',
        name: 'Small Ride',
        category: 'ride',
        width: 9, // 30 feet
        height: 9, // 30 feet
        color: '#E74C3C',
        description: '30x30 ft ride (Tilt-a-Whirl, etc.)',
        minSpacing: 3
      },
      {
        id: 'large-ride',
        name: 'Large Ride',
        category: 'ride',
        width: 15, // 50 feet
        height: 15, // 50 feet
        color: '#C0392B',
        description: '50x50 ft ride (Ferris Wheel, etc.)',
        minSpacing: 5
      },
      
      // Games
      {
        id: 'game-booth',
        name: 'Game Booth',
        category: 'game',
        width: 2.5, // 8 feet
        height: 4, // 13 feet
        color: '#3498DB',
        description: '8x13 ft game booth',
        minSpacing: 0.5
      },
      {
        id: 'ring-toss',
        name: 'Ring Toss',
        category: 'game',
        width: 3, // 10 feet
        height: 2, // 6 feet
        color: '#5DADE2',
        description: '10x6 ft ring toss game',
        minSpacing: 1
      },
      
      // Food
      {
        id: 'food-truck',
        name: 'Food Truck',
        category: 'food',
        width: 7, // 23 feet
        height: 2.5, // 8 feet
        color: '#F39C12',
        description: '23x8 ft food truck',
        minSpacing: 2
      },
      {
        id: 'concession-stand',
        name: 'Concession Stand',
        category: 'food',
        width: 4, // 13 feet
        height: 3, // 10 feet
        color: '#F7DC6F',
        description: '13x10 ft concession stand',
        minSpacing: 1.5
      },
      
      // Utilities
      {
        id: 'restroom',
        name: 'Portable Restroom',
        category: 'utility',
        width: 1.2, // 4 feet
        height: 1.2, // 4 feet
        color: '#95A5A6',
        description: '4x4 ft portable restroom',
        minSpacing: 0.5
      },
      {
        id: 'generator',
        name: 'Generator',
        category: 'utility',
        width: 2, // 6.5 feet
        height: 1.5, // 5 feet
        color: '#7F8C8D',
        description: '6.5x5 ft generator',
        minSpacing: 3 // Safety spacing for generator
      }
    ];
  }

  /**
   * Convert real-world dimensions to pixel dimensions
   */
  static convertToPixelDimensions(
    widthMeters: number, 
    heightMeters: number, 
    pixelsPerMeter: number
  ): { width: number; height: number } {
    return {
      width: widthMeters * pixelsPerMeter,
      height: heightMeters * pixelsPerMeter
    };
  }

  /**
   * Convert pixel dimensions to real-world dimensions
   */
  static convertToRealWorldDimensions(
    widthPixels: number, 
    heightPixels: number, 
    pixelsPerMeter: number
  ): { width: number; height: number } {
    return {
      width: widthPixels / pixelsPerMeter,
      height: heightPixels / pixelsPerMeter
    };
  }

  /**
   * Check if equipment placement is valid (no overlaps, minimum spacing)
   */
  static validatePlacement(
    newEquipment: { x: number; y: number; width: number; height: number; minSpacing?: number },
    existingEquipment: Array<{ x: number; y: number; width: number; height: number; minSpacing?: number }>,
    pixelsPerMeter: number
  ): { valid: boolean; error?: string } {
    const spacing = (newEquipment.minSpacing || 1) * pixelsPerMeter;
    
    for (const existing of existingEquipment) {
      const existingSpacing = (existing.minSpacing || 1) * pixelsPerMeter;
      const requiredSpacing = Math.max(spacing, existingSpacing);
      
      // Check if rectangles overlap with spacing
      const newLeft = newEquipment.x - requiredSpacing;
      const newRight = newEquipment.x + newEquipment.width + requiredSpacing;
      const newTop = newEquipment.y - requiredSpacing;
      const newBottom = newEquipment.y + newEquipment.height + requiredSpacing;
      
      const existingLeft = existing.x;
      const existingRight = existing.x + existing.width;
      const existingTop = existing.y;
      const existingBottom = existing.y + existing.height;
      
      if (newLeft < existingRight && newRight > existingLeft &&
          newTop < existingBottom && newBottom > existingTop) {
        return {
          valid: false,
          error: `Equipment placement violates minimum spacing requirements (${newEquipment.minSpacing || 1}m)`
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Get equipment template by ID
   */
  static getEquipmentTemplate(id: string): EquipmentTemplate | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  /**
   * Get equipment templates by category
   */
  static getEquipmentByCategory(category: EquipmentCategory): EquipmentTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  /**
   * Format dimensions for display
   */
  static formatDimensions(widthMeters: number, heightMeters: number, unit: 'meters' | 'feet' = 'meters'): string {
    if (unit === 'feet') {
      const widthFeet = Math.round(widthMeters * 3.28084);
      const heightFeet = Math.round(heightMeters * 3.28084);
      return `${widthFeet}×${heightFeet} ft`;
    }
    
    return `${widthMeters.toFixed(1)}×${heightMeters.toFixed(1)} m`;
  }

  /**
   * Save a custom equipment template
   */
  static saveCustomTemplate(template: Omit<EquipmentTemplate, 'id' | 'isCustom'>): EquipmentTemplate {
    // Generate a unique ID for the new template
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the full template with the custom flag
    const newTemplate: EquipmentTemplate = {
      ...template,
      id,
      isCustom: true,
    };
    
    // Get existing custom templates from local storage
    const existingTemplates = this.getCustomTemplates();
    
    // Add the new template
    const updatedTemplates = [...existingTemplates, newTemplate];
    
    // Save back to local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTemplates));
    
    return newTemplate;
  }

  /**
   * Update an existing custom equipment template
   */
  static updateCustomTemplate(id: string, updates: Partial<Omit<EquipmentTemplate, 'id' | 'isCustom'>>): EquipmentTemplate | null {
    // Get existing custom templates from local storage
    const customTemplates = this.getCustomTemplates();
    
    // Find the template to update
    const templateIndex = customTemplates.findIndex(template => template.id === id);
    
    if (templateIndex === -1) {
      return null; // Template not found
    }
    
    // Update the template
    const updatedTemplate: EquipmentTemplate = {
      ...customTemplates[templateIndex],
      ...updates
    };
    
    // Replace in the array
    customTemplates[templateIndex] = updatedTemplate;
    
    // Save back to local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
    
    return updatedTemplate;
  }

  /**
   * Delete a custom equipment template
   */
  static deleteCustomTemplate(id: string): boolean {
    // Get existing custom templates from local storage
    const customTemplates = this.getCustomTemplates();
    
    // Filter out the template to delete
    const filteredTemplates = customTemplates.filter(template => template.id !== id);
    
    if (filteredTemplates.length === customTemplates.length) {
      return false; // Template not found
    }
    
    // Save back to local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
    
    return true;
  }

  /**
   * Get all custom equipment templates
   */
  static getCustomTemplates(): EquipmentTemplate[] {
    try {
      const customTemplatesString = localStorage.getItem(this.STORAGE_KEY);
      if (!customTemplatesString) {
        return [];
      }
      
      const customTemplates = JSON.parse(customTemplatesString);
      return Array.isArray(customTemplates) ? customTemplates : [];
    } catch (e) {
      console.error('Failed to load custom equipment templates:', e);
      return [];
    }
  }

  /**
   * Get all equipment templates (built-in and custom)
   */
  static getAllTemplates(): EquipmentTemplate[] {
    const standardTemplates = this.getEquipmentTemplates();
    const customTemplates = this.getCustomTemplates();
    
    return [...standardTemplates, ...customTemplates];
  }
}
