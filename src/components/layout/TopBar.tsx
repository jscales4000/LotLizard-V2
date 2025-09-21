import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import StraightenIcon from '@mui/icons-material/Straighten';
import { useMapStore } from '../../stores/mapStore';
import lizardLogo from '../../assets/lizard-logo.png';

const TopBar: React.FC = () => {
  const { scale, setScale, isRulerMode, toggleRulerMode } = useMapStore();

  const handleZoomIn = () => {
    setScale(scale * 1.2);
  };

  const handleZoomOut = () => {
    setScale(scale * 0.8);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ minHeight: '60px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img 
            src={lizardLogo}
            alt="LotLizard Logo"
            style={{
              height: '32px',
              width: 'auto',
              marginRight: '8px',
              transform: 'rotate(-5deg)'
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 0 }}>
            LotLizard V2
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={toggleRulerMode}
            size="small"
            color={isRulerMode ? 'primary' : 'default'}
            sx={{
              mr: 2,
              bgcolor: isRulerMode ? 'primary.main' : 'transparent',
              color: isRulerMode ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                bgcolor: isRulerMode ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <StraightenIcon />
          </IconButton>

          <Typography variant="body2" sx={{ mr: 1 }}>
            Zoom: {Math.round(scale * 100)}%
          </Typography>

          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>

          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Box>
      </Toolbar>

    </AppBar>
  );
};

export default TopBar;
