export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'wait' | 'custom';
  nextTrigger?: 'manual' | 'auto' | 'event';
  eventType?: string; // For event-based progression
  skipable?: boolean;
  content?: React.ReactNode;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
}

export class OnboardingService {
  private static readonly STORAGE_KEY = 'lotlizard_onboarding_status';
  
  /**
   * Main onboarding flow for new users
   */
  static getMainOnboardingFlow(): OnboardingFlow {
    return {
      id: 'main-onboarding',
      name: 'LotLizard V2 Getting Started',
      description: 'Learn how to create projects, import maps, and manage equipment layouts',
      steps: [
        // Step 1: Welcome & Project Creation
        {
          id: 'welcome',
          title: 'Welcome to LotLizard V2!',
          description: 'Let\'s get you started with creating your first equipment layout project. We\'ll walk you through every step.',
          position: 'center',
          action: 'custom',
          nextTrigger: 'manual',
          skipable: true
        },
        {
          id: 'create-project',
          title: 'Create Your First Project',
          description: 'Click the folder icon to open the Projects drawer, then create a new project.',
          target: '[data-testid="projects-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'project-created'
        },
        
        // Step 2: Map Import
        {
          id: 'import-map-intro',
          title: 'Import a Map',
          description: 'Now let\'s import a satellite map for your project. Click the image import icon.',
          target: '[data-testid="image-import-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'image-import-opened'
        },
        {
          id: 'address-search',
          title: 'Search by Address',
          description: 'Enter an address or location name to find your project site. Try "State Fairgrounds" or a specific address.',
          target: '[data-testid="address-search-input"]',
          position: 'bottom',
          action: 'input',
          nextTrigger: 'event',
          eventType: 'address-searched'
        },
        {
          id: 'map-navigation',
          title: 'Navigate the Map',
          description: 'Use pan, tilt, and zoom controls to find the exact area for your layout. When ready, click "Import This View".',
          target: '[data-testid="map-controls"]',
          position: 'left',
          action: 'custom',
          nextTrigger: 'event',
          eventType: 'map-imported'
        },
        
        // Step 3: Calibration
        {
          id: 'calibration-intro',
          title: 'Calibrate Your Map',
          description: 'Calibration is essential for accurate measurements. Click the calibration tool to set the scale.',
          target: '[data-testid="calibration-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'calibration-started'
        },
        {
          id: 'calibration-process',
          title: 'Set Known Distance',
          description: 'Click two points on the map that represent a known distance (like a building width), then enter the real-world distance.',
          target: 'canvas',
          position: 'top',
          action: 'custom',
          nextTrigger: 'event',
          eventType: 'calibration-completed'
        },
        
        // Step 4: Adding Equipment
        {
          id: 'add-equipment-intro',
          title: 'Add Equipment to Your Layout',
          description: 'Now let\'s add some equipment! Open the Equipment Library on the right sidebar.',
          target: '[data-testid="equipment-library-tab"]',
          position: 'left',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'equipment-library-opened'
        },
        {
          id: 'drag-equipment',
          title: 'Drag Equipment to Canvas',
          description: 'Drag any equipment item from the library onto your map. Try adding a ride or food stand.',
          target: '[data-testid="equipment-item"]',
          position: 'left',
          action: 'custom',
          nextTrigger: 'event',
          eventType: 'equipment-added'
        },
        
        // Step 5: Item Modification
        {
          id: 'select-item',
          title: 'Select and Modify Equipment',
          description: 'Click on the equipment item you just added to select it. You\'ll see selection handles appear.',
          target: 'canvas',
          position: 'top',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'item-selected'
        },
        {
          id: 'edit-properties',
          title: 'Edit Equipment Properties',
          description: 'With an item selected, you can edit its properties in the Properties panel. Try changing the capacity or dimensions.',
          target: '[data-testid="properties-panel"]',
          position: 'left',
          action: 'custom',
          nextTrigger: 'event',
          eventType: 'properties-edited'
        },
        {
          id: 'move-rotate',
          title: 'Move and Rotate Items',
          description: 'Drag items to move them, or use the rotation handle to rotate. You can also use the mouse wheel to rotate selected items.',
          target: 'canvas',
          position: 'top',
          action: 'custom',
          nextTrigger: 'manual'
        },
        
        // Step 6: Template Management
        {
          id: 'save-template',
          title: 'Save Custom Templates',
          description: 'Create custom equipment templates for reuse. Click the "New" button in the Equipment Library Management section.',
          target: '[data-testid="new-template-button"]',
          position: 'left',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'template-dialog-opened'
        },
        {
          id: 'template-creation',
          title: 'Create Your Template',
          description: 'Fill in the template details like name, dimensions, and properties. This will be saved for future projects.',
          target: '[data-testid="template-form"]',
          position: 'left',
          action: 'custom',
          nextTrigger: 'event',
          eventType: 'template-created'
        },
        
        // Step 7: Project Management
        {
          id: 'save-project',
          title: 'Save Your Project',
          description: 'Save your work! Open the Projects drawer and click "Save Project" to preserve your layout.',
          target: '[data-testid="save-project-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'project-saved'
        },
        {
          id: 'export-project',
          title: 'Export and Share',
          description: 'You can export your project as JSON for backup or sharing with others. Click "Export Project".',
          target: '[data-testid="export-project-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'manual'
        },
        
        // Step 8: PDF Export
        {
          id: 'pdf-export',
          title: 'Generate Professional PDFs',
          description: 'Create professional documentation with "Export to PDF". This includes your map, equipment table, and project details.',
          target: '[data-testid="pdf-export-button"]',
          position: 'right',
          action: 'click',
          nextTrigger: 'event',
          eventType: 'pdf-dialog-opened'
        },
        {
          id: 'pdf-options',
          title: 'PDF Export Options',
          description: 'Configure your PDF with project location, format options, and quality settings. The PDF will include your map and a detailed equipment list.',
          target: '[data-testid="pdf-export-dialog"]',
          position: 'center',
          action: 'custom',
          nextTrigger: 'manual'
        },
        
        // Step 9: Completion
        {
          id: 'completion',
          title: 'Congratulations! 🎉',
          description: 'You\'ve completed the LotLizard V2 onboarding! You now know how to create projects, import maps, add equipment, and export professional documentation. Happy planning!',
          position: 'center',
          action: 'custom',
          nextTrigger: 'manual',
          skipable: false
        }
      ]
    };
  }
  
  /**
   * Check if user has completed onboarding
   */
  static hasCompletedOnboarding(): boolean {
    const status = localStorage.getItem(this.STORAGE_KEY);
    return status === 'completed';
  }
  
  /**
   * Mark onboarding as completed
   */
  static markOnboardingCompleted(): void {
    localStorage.setItem(this.STORAGE_KEY, 'completed');
  }
  
  /**
   * Reset onboarding status (for testing or re-onboarding)
   */
  static resetOnboarding(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Check if user has skipped onboarding
   */
  static hasSkippedOnboarding(): boolean {
    const status = localStorage.getItem(this.STORAGE_KEY);
    return status === 'skipped';
  }
  
  /**
   * Mark onboarding as skipped
   */
  static markOnboardingSkipped(): void {
    localStorage.setItem('lotlizard_onboarding_status', 'skipped');
  }

  static resetOnboardingStatus(): void {
    localStorage.removeItem('lotlizard_onboarding_status');
  }
  
  /**
   * Should show onboarding to user
   */
  static shouldShowOnboarding(): boolean {
    return !this.hasCompletedOnboarding() && !this.hasSkippedOnboarding();
  }
  
  /**
   * Get onboarding step by ID
   */
  static getStepById(stepId: string): OnboardingStep | null {
    const flow = this.getMainOnboardingFlow();
    return flow.steps.find(step => step.id === stepId) || null;
  }
  
  /**
   * Get next step in sequence
   */
  static getNextStep(currentStepId: string): OnboardingStep | null {
    const flow = this.getMainOnboardingFlow();
    const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex >= 0 && currentIndex < flow.steps.length - 1) {
      return flow.steps[currentIndex + 1];
    }
    
    return null;
  }
  
  /**
   * Get previous step in sequence
   */
  static getPreviousStep(currentStepId: string): OnboardingStep | null {
    const flow = this.getMainOnboardingFlow();
    const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex > 0) {
      return flow.steps[currentIndex - 1];
    }
    
    return null;
  }
}
