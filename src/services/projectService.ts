import { useMapStore } from '../stores/mapStore';
import { useEquipmentStore } from '../stores/equipmentStore';

/**
 * Project structure represents the serializable format of a project
 */
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  mapState: {
    imageUrl: string | null;
    pixelsPerMeter: number;
    calibrationPoints: any[];
    activeCalibrationLine: any | null;
    showGrid: boolean;
    gridSpacing: number;
  };
  equipmentState: {
    items: any[];
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
  static createNewProject(name: string = 'Untitled Project'): Project {
    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: this.PROJECT_VERSION,
      mapState: {
        imageUrl: null,
        pixelsPerMeter: 1,
        calibrationPoints: [],
        activeCalibrationLine: null,
        showGrid: true,
        gridSpacing: 3,
      },
      equipmentState: {
        items: [],
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
      imageUrl: mapState.imageUrl,
      pixelsPerMeter: mapState.pixelsPerMeter,
      calibrationPoints: mapState.calibrationPoints,
      activeCalibrationLine: mapState.activeCalibrationLine,
      showGrid: mapState.showGrid,
      gridSpacing: mapState.gridSpacing,
    };
    project.equipmentState = {
      items: equipmentState.items,
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
    mapStore.setImageUrl(project.mapState.imageUrl);
    mapStore.setPixelsPerMeter(project.mapState.pixelsPerMeter);
    mapStore.clearCalibration();
    if (project.mapState.activeCalibrationLine) {
      // Need to properly reconstruct calibration
      // This is simplified and would need to be expanded
    }
    if (project.mapState.showGrid !== undefined) {
      if (mapStore.showGrid !== project.mapState.showGrid) {
        mapStore.toggleGrid();
      }
      mapStore.setGridSpacing(project.mapState.gridSpacing);
    }

    // Update the equipment store
    const equipmentStore = useEquipmentStore.getState();
    equipmentStore.clearAll();
    project.equipmentState.items.forEach(item => {
      equipmentStore.addItem(item);
    });

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
}
