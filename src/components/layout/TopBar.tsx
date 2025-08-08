import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { useMapStore } from '../../stores/mapStore';
import ImageImportDialog from '../common/ImageImportDialog';

const TopBar: React.FC = () => {
  const { scale, setScale } = useMapStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleZoomIn = () => {
    setScale(scale * 1.2);
  };

  const handleZoomOut = () => {
    setScale(scale * 0.8);
  };

  const handleImportImage = () => {
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ minHeight: '60px' }}>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>
          LotLizard V2
        </Typography>

        <Button
          startIcon={<FolderOpenIcon />}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          Open
        </Button>

        <Button
          startIcon={<SaveIcon />}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          Save
        </Button>

        <Button
          startIcon={<ImageSearchIcon />}
          variant="contained"
          color="primary"
          size="small"
          onClick={handleImportImage}
          sx={{ mr: 1 }}
        >
          Import Image
        </Button>

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
      
      {/* Image Import Dialog */}
      <ImageImportDialog 
        open={importDialogOpen} 
        onClose={handleCloseImportDialog} 
      />
    </AppBar>
  );
};

export default TopBar;
