import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Fade,
  Backdrop,
  Stack,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  CheckCircle as CompleteIcon,
  SkipNext as SkipIcon
} from '@mui/icons-material';
import { OnboardingService } from '../../services/onboardingService';

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  open,
  onClose,
  onComplete,
  onSkip
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const flow = OnboardingService.getMainOnboardingFlow();
  const currentStep = flow.steps[currentStepIndex];
  const isLastStep = currentStepIndex === flow.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  
  // Calculate progress
  const progress = ((currentStepIndex + 1) / flow.steps.length) * 100;

  const clearHighlight = useCallback(() => {
    // Remove existing highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    setHighlightElement(null);
  }, []);

  const highlightTarget = useCallback((element: HTMLElement) => {
    element.classList.add('onboarding-highlight');

    // Scroll element into view if needed
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }, []);

  const updateHighlight = useCallback(() => {
    clearHighlight();

    if (currentStep?.target) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        highlightTarget(element);
      }
    }
  }, [currentStep, clearHighlight, highlightTarget]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      updateHighlight();
    } else {
      setIsVisible(false);
      clearHighlight();
    }
  }, [open, currentStepIndex, updateHighlight, clearHighlight]);

  useEffect(() => {
    updateHighlight();
  }, [updateHighlight]);


  const getTooltipPosition = () => {
    if (!highlightElement || !currentStep?.position) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = highlightElement.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const margin = 20;

    switch (currentStep.position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - margin,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          transform: 'none'
        };
      case 'bottom':
        return {
          top: rect.bottom + margin,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          transform: 'none'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - margin,
          transform: 'none'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + margin,
          transform: 'none'
        };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    OnboardingService.markOnboardingCompleted();
    clearHighlight();
    onComplete();
  };

  const handleSkipOnboarding = () => {
    OnboardingService.markOnboardingSkipped();
    clearHighlight();
    onSkip();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  if (!open || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop with highlight cutout */}
      <Backdrop
        open={true}
        sx={{
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)'
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Onboarding Tooltip */}
      <Fade in={isVisible} timeout={300}>
        <Paper
          ref={overlayRef}
          elevation={12}
          sx={{
            position: 'fixed',
            zIndex: 10000,
            maxWidth: 400,
            minWidth: 320,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            ...getTooltipPosition()
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {currentStep?.title}
              </Typography>
              <Chip
                label={`${currentStepIndex + 1}/${flow.steps.length}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mb: 2,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
                borderRadius: 3
              }
            }}
          />

          {/* Content */}
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {currentStep?.description}
          </Typography>

          {/* Special content for welcome and completion steps */}
          {currentStep?.id === 'welcome' && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                What you'll learn:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                • Creating and managing projects<br/>
                • Importing maps with address search<br/>
                • Calibrating for accurate measurements<br/>
                • Adding and customizing equipment<br/>
                • Saving templates and exporting to PDF
              </Typography>
            </Box>
          )}

          {currentStep?.id === 'completion' && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <CompleteIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                You're now ready to create professional equipment layouts with LotLizard V2!
              </Typography>
            </Box>
          )}

          {/* Navigation */}
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {!isFirstStep && (
                <Button
                  onClick={handlePrevious}
                  startIcon={<BackIcon />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  variant="outlined"
                  size="small"
                >
                  Back
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentStep?.skipable !== false && !isLastStep && (
                <Button
                  onClick={handleSkipOnboarding}
                  startIcon={<SkipIcon />}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': { color: 'white' }
                  }}
                  size="small"
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                endIcon={isLastStep ? <CompleteIcon /> : <NextIcon />}
                variant="contained"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isLastStep ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </Stack>

          {/* Step indicators */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 0.5 }}>
            {flow.steps.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleStepClick(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index <= currentStepIndex ? 'white' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Global styles for highlighting */}
      <style>
        {`
          .onboarding-highlight {
            position: relative;
            z-index: 10001 !important;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3) !important;
            border-radius: 8px !important;
            animation: onboarding-pulse 2s infinite;
          }
          
          @keyframes onboarding-pulse {
            0% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.2); }
            100% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3); }
          }
        `}
      </style>
    </>
  );
};
