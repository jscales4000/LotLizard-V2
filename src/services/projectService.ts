import { useMapStore } from '../stores/mapStore';
import { useEquipmentStore } from '../stores/equipmentStore';

/**
 * Project structure represents the serializable format of a project
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  mapState: {
    scale: number;
    position: { x: number; y: number };
    imageUrl: string | null;
    pixelsPerFoot: number;
    calibrationPoints: any[];
    activeCalibrationLine: any | null;
    showGrid: boolean;
    gridSpacing: number;
    gridColor: string;
    gridOpacity: number;
    showCalibrationLine: boolean;
    showEquipmentLabels: boolean;
    showClearanceZones: boolean;
  };
  equipmentState: {
    items: any[];
    selectedIds: string[];
  };
  metadata: {
    lastSaved: number;
    autoSave: boolean;
    tags: string[];
  };
}

/**
 * Service for handling project operations such as create, save, load, export, import
 */
export class ProjectService {
  private static readonly STORAGE_KEY = 'lot-lizard-projects';
  private static readonly CURRENT_PROJECT_KEY = 'lot-lizard-current-project';
  private static readonly PROJECT_VERSION = '1.0.0';

  /**
   * Create a new project with default settings
   */
  static createNewProject(name: string = 'Untitled Project', description?: string): Project {
    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: this.PROJECT_VERSION,
      mapState: {
        scale: 1.0,
        position: { x: 0, y: 0 },
        imageUrl: null,
        pixelsPerFoot: 1,
        calibrationPoints: [],
        activeCalibrationLine: null,
        showGrid: true,
        gridSpacing: 10,
        gridColor: '#333333',
        gridOpacity: 0.3,
        showCalibrationLine: true,
        showEquipmentLabels: true,
        showClearanceZones: true,
      },
      equipmentState: {
        items: [],
        selectedIds: [],
      },
      metadata: {
        lastSaved: Date.now(),
        autoSave: false,
        tags: [],
      }
    };

    return project;
  }

  /**
   * Save the current state of map and equipment stores to a project
   */
  static saveCurrentState(name?: string): Project {
    // Get the current map and equipment state
    const mapState = useMapStore.getState();
    const equipmentState = useEquipmentStore.getState();
    
    // Get the current project or create a new one
    let project = this.getCurrentProject();
    if (!project) {
      project = this.createNewProject(name);
    } else if (name) {
      project.name = name;
    }

    // Update the project data
    project.updatedAt = Date.now();
    project.mapState = {
      scale: mapState.scale,
      position: mapState.position,
      imageUrl: mapState.imageUrl,
      pixelsPerFoot: mapState.pixelsPerFoot,
      calibrationPoints: mapState.calibrationPoints,
      activeCalibrationLine: mapState.activeCalibrationLine,
      showGrid: mapState.showGrid,
      gridSpacing: mapState.gridSpacing,
      gridColor: mapState.gridColor,
      gridOpacity: mapState.gridOpacity,
      showCalibrationLine: mapState.showCalibrationLine,
      showEquipmentLabels: mapState.showEquipmentLabels,
      showClearanceZones: mapState.showClearanceZones,
    };
    project.equipmentState = {
      items: equipmentState.items,
      selectedIds: equipmentState.selectedIds,
    };
    project.metadata = {
      ...project.metadata,
      lastSaved: Date.now(),
    };

    // Save the project to local storage
    this.saveProject(project);
    this.setCurrentProject(project.id);

    return project;
  }

  /**
   * Load a project and update the map and equipment stores
   */
  static loadProject(projectId: string): boolean {
    const project = this.getProject(projectId);
    
    if (!project) {
      console.error(`Project with ID ${projectId} not found`);
      return false;
    }

    // Update the map store
    const mapStore = useMapStore.getState();

    // Set basic map state
    mapStore.setScale(project.mapState.scale || 1.0);
    mapStore.setPosition(project.mapState.position || { x: 0, y: 0 });
    mapStore.setImageUrl(project.mapState.imageUrl);
    mapStore.setPixelsPerFoot(project.mapState.pixelsPerFoot || 1);

    // Clear and restore calibration
    mapStore.clearCalibration();
    if (project.mapState.calibrationPoints) {
      project.mapState.calibrationPoints.forEach(point => {
        mapStore.addCalibrationPoint(point);
      });
    }
    if (project.mapState.activeCalibrationLine) {
      // Restore active calibration line and update pixels per foot
      useMapStore.setState({
        activeCalibrationLine: project.mapState.activeCalibrationLine,
        pixelsPerFoot: project.mapState.activeCalibrationLine.pixelsPerFoot || 1
      });
    }

    // Restore display settings
    if (project.mapState.showGrid !== mapStore.showGrid) {
      mapStore.toggleGrid();
    }
    mapStore.setGridSpacing(project.mapState.gridSpacing || 10);

    if (project.mapState.gridColor) {
      mapStore.setGridColor(project.mapState.gridColor);
    }

    if (project.mapState.gridOpacity !== undefined) {
      mapStore.setGridOpacity(project.mapState.gridOpacity);
    }

    if (project.mapState.showCalibrationLine !== undefined && project.mapState.showCalibrationLine !== mapStore.showCalibrationLine) {
      mapStore.toggleCalibrationLine();
    }

    if (project.mapState.showEquipmentLabels !== undefined && project.mapState.showEquipmentLabels !== mapStore.showEquipmentLabels) {
      mapStore.toggleEquipmentLabels();
    }

    if (project.mapState.showClearanceZones !== undefined && project.mapState.showClearanceZones !== mapStore.showClearanceZones) {
      mapStore.toggleClearanceZones();
    }

    // Update the equipment store
    const equipmentStore = useEquipmentStore.getState();
    equipmentStore.clearAll();

    // Restore equipment items
    project.equipmentState.items.forEach(item => {
      useEquipmentStore.setState(state => ({
        items: [...state.items, { ...item, id: item.id || `restored-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }]
      }));
    });

    // Restore selection state
    if (project.equipmentState.selectedIds) {
      useEquipmentStore.setState({ selectedIds: project.equipmentState.selectedIds });
    }

    // Set as current project
    this.setCurrentProject(project.id);

    return true;
  }

  /**
   * Save a project to local storage
   */
  static saveProject(project: Project): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
  }

  /**
   * Get all projects from local storage
   */
  static getAllProjects(): Project[] {
    const projectsJson = localStorage.getItem(this.STORAGE_KEY);
    if (!projectsJson) {
      return [];
    }
    
    try {
      return JSON.parse(projectsJson);
    } catch (error) {
      console.error('Error parsing projects from local storage:', error);
      return [];
    }
  }

  /**
   * Get a project by ID
   */
  static getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(project => project.id === id) || null;
  }

  /**
   * Get the current project ID
   */
  static getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY);
  }

  /**
   * Get the current project
   */
  static getCurrentProject(): Project | null {
    const currentProjectId = this.getCurrentProjectId();
    if (!currentProjectId) {
      return null;
    }
    
    return this.getProject(currentProjectId);
  }

  /**
   * Set the current project ID
   */
  static setCurrentProject(id: string | null): void {
    if (id) {
      localStorage.setItem(this.CURRENT_PROJECT_KEY, id);
    } else {
      localStorage.removeItem(this.CURRENT_PROJECT_KEY);
    }
  }

  /**
   * Export a project to a JSON file
   */
  static exportProject(projectId: string): string {
    const project = this.getProject(projectId) || this.getCurrentProject();

    if (!project) {
      throw new Error('No project to export');
    }

    const jsonData = JSON.stringify(project, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

    return dataUri;
  }

  /**
   * Save project to file system using File System Access API
   */
  static async saveProjectToFile(projectId?: string): Promise<void> {
    const project = projectId ? this.getProject(projectId) : this.getCurrentProject();

    if (!project) {
      throw new Error('No project to save');
    }

    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.lotlizard`,
          types: [
            {
              description: 'LotLizard Project Files',
              accept: {
                'application/json': ['.lotlizard', '.json']
              }
            }
          ]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(project, null, 2));
        await writable.close();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          throw new Error('Failed to save project to file system');
        }
      }
    } else {
      // Fallback to download method
      const dataUri = this.exportProject(projectId || project.id);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.lotlizard`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Open project from file system using File System Access API
   */
  static async openProjectFromFile(): Promise<Project | null> {
    // Check if File System Access API is supported
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'LotLizard Project Files',
              accept: {
                'application/json': ['.lotlizard', '.json']
              }
            }
          ]
        });

        const file = await fileHandle.getFile();
        const content = await file.text();
        const project = this.importProject(content);
        return project;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          throw new Error('Failed to open project from file system');
        }
        return null;
      }
    } else {
      // Fallback to input element method
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.lotlizard,.json';

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const project = this.importProject(content);
              resolve(project);
            } catch (error) {
              reject(new Error('Failed to import project: Invalid format'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        };

        input.oncancel = () => resolve(null);
        input.click();
      });
    }
  }

  /**
   * Import a project from JSON data
   */
  static importProject(jsonData: string): Project {
    try {
      const project: Project = JSON.parse(jsonData);
      
      // Validate project structure
      if (!project.id || !project.mapState || !project.equipmentState) {
        throw new Error('Invalid project format');
      }

      // Generate a new ID to prevent overwriting existing projects
      project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      project.updatedAt = Date.now();
      
      // Save the imported project
      this.saveProject(project);
      
      return project;
    } catch (error) {
      console.error('Error importing project:', error);
      throw new Error('Failed to import project: Invalid format');
    }
  }
  
  /**
   * Get recent projects (last 5)
   */
  static getRecentProjects(): Project[] {
    const projects = this.getAllProjects();
    return projects
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }

  /**
   * Delete a project by ID
   */
  static deleteProject(projectId: string): boolean {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);

    if (filteredProjects.length === projects.length) {
      return false; // Project not found
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));

    // Clear current project if it was the deleted one
    if (this.getCurrentProjectId() === projectId) {
      this.setCurrentProject(null);
    }

    return true;
  }

  /**
   * Duplicate a project
   */
  static duplicateProject(projectId: string, newName?: string): Project | null {
    const originalProject = this.getProject(projectId);
    if (!originalProject) {
      return null;
    }

    const duplicatedProject: Project = {
      ...originalProject,
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalProject.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...originalProject.metadata,
        lastSaved: Date.now(),
      }
    };

    this.saveProject(duplicatedProject);
    return duplicatedProject;
  }

  /**
   * Auto-save current state if auto-save is enabled
   */
  static autoSave(): void {
    const currentProject = this.getCurrentProject();
    if (currentProject && currentProject.metadata.autoSave) {
      this.saveCurrentState();
    }
  }

  /**
   * Get project statistics
   */
  static getProjectStats(projectId: string): {
    equipmentCount: number;
    totalArea: number;
    lastModified: string;
    hasCalibration: boolean;
  } | null {
    const project = this.getProject(projectId);
    if (!project) {
      return null;
    }

    return {
      equipmentCount: project.equipmentState.items.length,
      totalArea: 0, // Could calculate based on equipment footprints
      lastModified: new Date(project.updatedAt).toLocaleDateString(),
      hasCalibration: !!project.mapState.activeCalibrationLine,
    };
  }

  /**
   * Search projects by name or description
   */
  static searchProjects(query: string): Project[] {
    const projects = this.getAllProjects();
    const searchTerm = query.toLowerCase();

    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      (project.description && project.description.toLowerCase().includes(searchTerm))
    );
  }
}
