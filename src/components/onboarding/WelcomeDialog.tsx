import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  SkipNext as SkipIcon,
  Map as MapIcon,
  Build as BuildIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

interface WelcomeDialogProps {
  open: boolean;
  onStartOnboarding: () => void;
  onSkip: () => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({
  open,
  onStartOnboarding,
  onSkip
}) => {
  const features = [
    {
      icon: <MapIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Import Maps',
      description: 'Search by address and import satellite imagery for your project site'
    },
    {
      icon: <BuildIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Equipment Layout',
      description: 'Drag & drop equipment, customize properties, and create professional layouts'
    },
    {
      icon: <SaveIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Project Management',
      description: 'Save, export, and share your projects with team members'
    },
    {
      icon: <PdfIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'PDF Export',
      description: 'Generate professional documentation with maps and equipment tables'
    }
  ];

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Welcome to LotLizard V2! 🎉
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Professional Equipment Layout Planning Made Easy
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
            LotLizard V2 helps you create professional equipment layouts for events, 
            fairgrounds, festivals, and more. Let us show you how to get started!
          </Typography>
          
          <Chip
            label="✨ New User Experience"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              px: 2,
              py: 1
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          What You'll Learn
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={2}
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Box sx={{ flexShrink: 0 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box sx={{
          p: 3,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(102, 126, 234, 0.2)',
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🚀 Interactive Tutorial
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our guided tour will walk you through creating your first project step-by-step. 
            Takes about 5-10 minutes and you'll be a pro by the end!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={onSkip}
          startIcon={<SkipIcon />}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Skip for now
        </Button>

        <Button
          onClick={onStartOnboarding}
          variant="contained"
          size="large"
          startIcon={<StartIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Start Interactive Tour
        </Button>
      </DialogActions>
    </Dialog>
  );
};
