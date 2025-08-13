import { create } from 'zustand';
import { OnboardingService, OnboardingStep } from '../services/onboardingService';

interface OnboardingState {
  // State
  isOnboardingActive: boolean;
  currentStepId: string | null;
  completedSteps: string[];
  isWaitingForEvent: boolean;
  expectedEventType: string | null;
  
  // Actions
  startOnboarding: () => void;
  stopOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  goToStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (stepId: string) => void;
  triggerEvent: (eventType: string, data?: any) => void;
  
  // Getters
  getCurrentStep: () => OnboardingStep | null;
  shouldShowOnboarding: () => boolean;
  getProgress: () => number;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  isOnboardingActive: false,
  currentStepId: null,
  completedSteps: [],
  isWaitingForEvent: false,
  expectedEventType: null,

  // Actions
  startOnboarding: () => {
    const flow = OnboardingService.getMainOnboardingFlow();
    const firstStep = flow.steps[0];
    
    set({
      isOnboardingActive: true,
      currentStepId: firstStep.id,
      completedSteps: [],
      isWaitingForEvent: firstStep.nextTrigger === 'event',
      expectedEventType: firstStep.eventType || null
    });
  },

  stopOnboarding: () => {
    set({
      isOnboardingActive: false,
      currentStepId: null,
      completedSteps: [],
      isWaitingForEvent: false,
      expectedEventType: null
    });
  },

  completeOnboarding: () => {
    OnboardingService.markOnboardingCompleted();
    get().stopOnboarding();
  },

  skipOnboarding: () => {
    OnboardingService.markOnboardingSkipped();
    get().stopOnboarding();
  },

  goToStep: (stepId: string) => {
    const step = OnboardingService.getStepById(stepId);
    if (step) {
      set({
        currentStepId: stepId,
        isWaitingForEvent: step.nextTrigger === 'event',
        expectedEventType: step.eventType || null
      });
    }
  },

  nextStep: () => {
    const { currentStepId } = get();
    if (!currentStepId) return;

    // Mark current step as completed
    get().markStepCompleted(currentStepId);

    const nextStep = OnboardingService.getNextStep(currentStepId);
    if (nextStep) {
      set({
        currentStepId: nextStep.id,
        isWaitingForEvent: nextStep.nextTrigger === 'event',
        expectedEventType: nextStep.eventType || null
      });
    } else {
      // No more steps, complete onboarding
      get().completeOnboarding();
    }
  },

  previousStep: () => {
    const { currentStepId } = get();
    if (!currentStepId) return;

    const previousStep = OnboardingService.getPreviousStep(currentStepId);
    if (previousStep) {
      set({
        currentStepId: previousStep.id,
        isWaitingForEvent: previousStep.nextTrigger === 'event',
        expectedEventType: previousStep.eventType || null
      });
    }
  },

  markStepCompleted: (stepId: string) => {
    set(state => ({
      completedSteps: [...state.completedSteps.filter(id => id !== stepId), stepId]
    }));
  },

  triggerEvent: (eventType: string, data?: any) => {
    const { isWaitingForEvent, expectedEventType } = get();
    
    if (isWaitingForEvent && expectedEventType === eventType) {
      // Event matches what we're waiting for, proceed to next step
      get().nextStep();
    }
  },

  // Getters
  getCurrentStep: () => {
    const { currentStepId } = get();
    return currentStepId ? OnboardingService.getStepById(currentStepId) : null;
  },

  shouldShowOnboarding: () => {
    return OnboardingService.shouldShowOnboarding();
  },

  getProgress: () => {
    const { currentStepId } = get();
    if (!currentStepId) return 0;

    const flow = OnboardingService.getMainOnboardingFlow();
    const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
    return ((currentIndex + 1) / flow.steps.length) * 100;
  }
}));
