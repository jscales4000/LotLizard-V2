import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useMapStore } from '../../stores/mapStore';

const TopBar: React.FC = () => {
  const { scale, setScale } = useMapStore();

  const handleZoomIn = () => {
    setScale(scale * 1.2);
  };

  const handleZoomOut = () => {
    setScale(scale * 0.8);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ minHeight: '60px' }}>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>
          LotLizard V2
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
