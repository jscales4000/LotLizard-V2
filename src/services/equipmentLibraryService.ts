import { EquipmentTemplate } from './equipmentService';

export interface EquipmentLibraryExport {
  metadata: {
    version: string;
    description: string;
    exportDate: string;
    totalItems: number;
    includesCustomTemplates: boolean;
  };
  templates: EquipmentTemplate[];
}

export interface EquipmentLibraryImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'append';
  includeCustomOnly?: boolean;
  categoryFilter?: string[];
}

export class EquipmentLibraryService {
  /**
   * Export equipment library to JSON format
   */
  static exportLibrary(
    templates: EquipmentTemplate[], 
    options?: {
      includeCustomOnly?: boolean;
      categoryFilter?: string[];
      filename?: string;
    }
  ): void {
    let filteredTemplates = templates;

    // Filter by custom templates only if requested
    if (options?.includeCustomOnly) {
      filteredTemplates = templates.filter(template => template.isCustom);
    }

    // Filter by categories if specified
    if (options?.categoryFilter && options.categoryFilter.length > 0) {
      filteredTemplates = filteredTemplates.filter(template => 
        options.categoryFilter!.includes(template.category)
      );
    }

    const exportData: EquipmentLibraryExport = {
      metadata: {
        version: '2.0',
        description: 'LotLizard V2 Equipment Library Export',
        exportDate: new Date().toISOString(),
        totalItems: filteredTemplates.length,
        includesCustomTemplates: filteredTemplates.some(t => t.isCustom)
      },
      templates: filteredTemplates
    };

    // Create and download the file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options?.filename || `equipment-library-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import equipment library from JSON file
   */
  static async importLibrary(
    file: File,
    currentTemplates: EquipmentTemplate[],
    options: EquipmentLibraryImportOptions
  ): Promise<EquipmentTemplate[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData: EquipmentLibraryExport = JSON.parse(content);
          
          // Validate import data structure
          if (!importData.templates || !Array.isArray(importData.templates)) {
            throw new Error('Invalid equipment library file format');
          }

          let importedTemplates = importData.templates;

          // Filter by categories if specified
          if (options.categoryFilter && options.categoryFilter.length > 0) {
            importedTemplates = importedTemplates.filter(template =>
              options.categoryFilter!.includes(template.category)
            );
          }

          let finalTemplates: EquipmentTemplate[];

          switch (options.mergeStrategy) {
            case 'replace':
              finalTemplates = importedTemplates;
              break;
              
            case 'append':
              // Add imported templates to existing ones, handling ID conflicts
              finalTemplates = [...currentTemplates];
              importedTemplates.forEach(importedTemplate => {
                // Create a unique ID for this template
                const uniqueId = this.generateUniqueId(importedTemplate.id, finalTemplates);
                finalTemplates.push({ ...importedTemplate, id: uniqueId });
              });
              break;
              
            case 'merge':
            default:
              // Merge templates, replacing existing ones with same ID
              finalTemplates = [...currentTemplates];
              importedTemplates.forEach(importedTemplate => {
                const existingIndex = finalTemplates.findIndex(t => t.id === importedTemplate.id);
                if (existingIndex >= 0) {
                  finalTemplates[existingIndex] = importedTemplate;
                } else {
                  finalTemplates.push(importedTemplate);
                }
              });
              break;
          }

          resolve(finalTemplates);
        } catch (error) {
          reject(new Error(`Failed to import equipment library: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Save equipment library to browser's local storage
   */
  static saveLibraryToLocalStorage(templates: EquipmentTemplate[], key: string = 'lotlizard-equipment-library'): void {
    try {
      const libraryData: EquipmentLibraryExport = {
        metadata: {
          version: '2.0',
          description: 'LotLizard V2 Equipment Library - Local Storage',
          exportDate: new Date().toISOString(),
          totalItems: templates.length,
          includesCustomTemplates: templates.some(t => t.isCustom)
        },
        templates
      };
      
      localStorage.setItem(key, JSON.stringify(libraryData));
    } catch (error) {
      console.error('Failed to save equipment library to local storage:', error);
      throw new Error('Failed to save equipment library locally');
    }
  }

  /**
   * Load equipment library from browser's local storage
   */
  static loadLibraryFromLocalStorage(key: string = 'lotlizard-equipment-library'): EquipmentTemplate[] | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const libraryData: EquipmentLibraryExport = JSON.parse(stored);
      return libraryData.templates || null;
    } catch (error) {
      console.error('Failed to load equipment library from local storage:', error);
      return null;
    }
  }

  /**
   * Get library backup/restore options
   */
  static createLibraryBackup(templates: EquipmentTemplate[]): string {
    const backupData: EquipmentLibraryExport = {
      metadata: {
        version: '2.0',
        description: 'LotLizard V2 Equipment Library Backup',
        exportDate: new Date().toISOString(),
        totalItems: templates.length,
        includesCustomTemplates: templates.some(t => t.isCustom)
      },
      templates
    };
    
    return JSON.stringify(backupData);
  }

  /**
   * Restore library from backup string
   */
  static restoreLibraryFromBackup(backupString: string): EquipmentTemplate[] {
    try {
      const backupData: EquipmentLibraryExport = JSON.parse(backupString);
      return backupData.templates || [];
    } catch (error) {
      throw new Error('Invalid backup data format');
    }
  }

  /**
   * Export a single equipment template as JSON file
   */
  static exportTemplate(template: EquipmentTemplate): void {
    try {
      const templateData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        template: template
      };
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_template.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export template:', error);
      throw new Error('Failed to export template');
    }
  }

  /**
   * Import a single equipment template from JSON file
   */
  static async importTemplate(): Promise<EquipmentTemplate | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          // Debug: Log the imported data structure
          console.log('Imported template data structure:', data);
          console.log('Has template property:', 'template' in data);
          console.log('Has templates property:', 'templates' in data);
          console.log('Template type:', typeof data.template);

          let template: any;

          // Handle both single template format and equipment library format
          if (data.template && typeof data.template === 'object') {
            // Single template format: { template: {...} }
            template = data.template;
            console.log('Importing single template format');
          } else if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
            // Equipment library format: { templates: [...] } - take the first template
            template = data.templates[0];
            console.log('Importing from equipment library format (using first template)');
          } else {
            console.error('Template validation failed - data structure:', data);
            throw new Error('Invalid template file format. Expected either { template: {...} } or { templates: [...] }');
          }
          
          // Debug: Log template before validation
          console.log('Template to validate:', template);

          // Validate the template structure
          if (!this.validateTemplate(template)) {
            console.error('Template validation failed for:', template);
            throw new Error('Invalid template structure - check console for details');
          }

          console.log('Template validation passed successfully');

          // Mark as custom template since it's being imported
          template.isCustom = true;
          
          resolve(template);
        } catch (error) {
          console.error('Failed to import template:', error);
          reject(new Error('Failed to import template: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  /**
   * Generate a unique ID for imported templates to avoid conflicts
   */
  private static generateUniqueId(baseId: string, existingTemplates: EquipmentTemplate[]): string {
    const existingIds = new Set(existingTemplates.map(t => t.id));
    let newId = baseId;
    let counter = 1;
    
    while (existingIds.has(newId)) {
      newId = `${baseId}-imported-${counter}`;
      counter++;
    }
    
    return newId;
  }

  /**
   * Validate equipment template structure
   */
  static validateTemplate(template: any): template is EquipmentTemplate {
    const validCategories = ['mega-rides', 'rides', 'kiddy-rides', 'food', 'games', 'equipment', 'office', 'home', 'bunks', 'utility', 'custom'];

    try {
      // Basic required fields
      const basicValidation = (
        typeof template === 'object' &&
        template !== null &&
        typeof template.id === 'string' &&
        typeof template.name === 'string' &&
        typeof template.category === 'string' &&
        validCategories.includes(template.category) &&
        typeof template.color === 'string' &&
        typeof template.description === 'string' &&
        typeof template.capacity === 'number' &&
        typeof template.weight === 'number' &&
        typeof template.verticalHeight === 'number' &&
        typeof template.turnAroundTime === 'number' &&
        (template.shape === 'rectangle' || template.shape === 'circle')
      );

      if (!basicValidation) {
        console.log('Basic validation failed for template:', template);
        return false;
      }

      // Shape-specific validation
      const shapeValidation = template.shape === 'rectangle'
        ? (typeof template.width === 'number' && typeof template.height === 'number')
        : (typeof template.radius === 'number');

      if (!shapeValidation) {
        console.log('Shape validation failed for template:', template);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Template validation error:', error);
      return false;
    }
  }
}
