import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, Divider, Tooltip } from '@mui/material';
import PanToolIcon from '@mui/icons-material/PanTool';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import StraightenIcon from '@mui/icons-material/Straighten';
import DeleteIcon from '@mui/icons-material/Delete';
import CropIcon from '@mui/icons-material/Crop';
import { useMapStore } from '../../stores/mapStore';

// Set width for the left sidebar
const DRAWER_WIDTH = 60;

const LeftSidebar: React.FC = () => {
  const [selectedTool, setSelectedTool] = React.useState<string>('select');
  const { isCalibrationMode, toggleCalibrationMode } = useMapStore();

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    
    // Handle calibration tool
    if (tool === 'calibrate') {
      if (!isCalibrationMode) {
        toggleCalibrationMode();
      }
    } else {
      // If switching to another tool, exit calibration mode
      if (isCalibrationMode) {
        toggleCalibrationMode();
      }
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box sx={{ 
        overflow: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: 'background.paper'
      }}>
        {/* Upper section - Main Tools */}
        <List disablePadding>
          <Tooltip title="Select & Move" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedTool === 'select'}
                onClick={() => handleToolSelect('select')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <PanToolIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Calibration Tool" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedTool === 'calibrate' || isCalibrationMode}
                onClick={() => handleToolSelect('calibrate')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1,
                  bgcolor: isCalibrationMode ? 'rgba(255, 193, 7, 0.2)' : 'transparent'
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <SquareFootIcon color={isCalibrationMode ? 'warning' : 'inherit'} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Measure Distance" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedTool === 'measure'}
                onClick={() => handleToolSelect('measure')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <StraightenIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Crop Image" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedTool === 'crop'}
                onClick={() => handleToolSelect('crop')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <CropIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Bottom section - Delete tool */}
        <List disablePadding>
          <Divider />
          <Tooltip title="Delete Selected" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => console.log('Delete selected')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <DeleteIcon color="error" />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        </List>
      </Box>
    </Drawer>
  );
};

export default LeftSidebar;
