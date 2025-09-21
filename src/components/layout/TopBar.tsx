import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import StraightenIcon from '@mui/icons-material/Straighten';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useMapStore } from '../../stores/mapStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useUndoRedoStore } from '../../stores/undoRedoStore';
import lizardLogo from '../../assets/lizard-logo.png';

const TopBar: React.FC = () => {
  const { scale, setScale, isRulerMode, toggleRulerMode } = useMapStore();
  const { undoLastAction, redoLastAction } = useEquipmentStore();
  const { canUndo, canRedo, getUndoDescription, getRedoDescription } = useUndoRedoStore();

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
          {/* Undo/Redo Controls */}
          <Tooltip title={canUndo() ? `Undo: ${getUndoDescription()}` : 'Nothing to undo'}>
            <span>
              <IconButton
                onClick={undoLastAction}
                size="small"
                disabled={!canUndo()}
                sx={{ mr: 1 }}
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={canRedo() ? `Redo: ${getRedoDescription()}` : 'Nothing to redo'}>
            <span>
              <IconButton
                onClick={redoLastAction}
                size="small"
                disabled={!canRedo()}
                sx={{ mr: 2 }}
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>

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
