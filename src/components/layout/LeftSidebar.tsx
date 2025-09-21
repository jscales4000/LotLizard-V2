import React, { useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Box,
  Tooltip,
  Divider,
  IconButton
} from '@mui/material';
import PanToolIcon from '@mui/icons-material/PanTool';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import DeleteIcon from '@mui/icons-material/Delete';

import SquareFootIcon from '@mui/icons-material/SquareFoot';
import TimelineIcon from '@mui/icons-material/Timeline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import SettingsIcon from '@mui/icons-material/Settings';
import { useMapStore } from '../../stores/mapStore';
import { useEquipmentStore } from '../../stores/equipmentStore';

// Set width for the left sidebar
const DRAWER_WIDTH = 60;

// Updated interface to accept drawer control props
interface LeftSidebarProps {
  onProjectsClick: () => void;
  onImageImportClick: () => void;
  onSettingsClick: () => void;
  projectsDrawerOpen: boolean;
  imageImportDrawerOpen: boolean;
  settingsDrawerOpen: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onProjectsClick,
  onImageImportClick,
  onSettingsClick,
  projectsDrawerOpen,
  imageImportDrawerOpen,
  settingsDrawerOpen
}) => {
  const [selectedTool, setSelectedTool] = React.useState<string>('select');
  const [isPanningModeActive, setIsPanningModeActive] = React.useState<boolean>(false);
  
  const {
    isCalibrationMode,
    toggleCalibrationMode,
    showGrid,
    toggleGrid,
    zoomIn,
    zoomOut,
    zoomToFit,
    scale,
    setIsPanningMode,
    isPanningMode,
    isPerimeterMode,
    togglePerimeterMode
  } = useMapStore();
  
  const { 
    getSelectedItems, 
    removeSelectedItems 
  } = useEquipmentStore();
  
  // Sync with MapCanvas when Tab key is pressed (isPanningMode changes)
  useEffect(() => {
    // Update local tool state when the global panning mode changes
    if (isPanningMode && selectedTool !== 'pan') {
      setSelectedTool('pan');
      setIsPanningModeActive(true);
    } else if (!isPanningMode && selectedTool === 'pan') {
      setSelectedTool('select');
      setIsPanningModeActive(false);
    }
  }, [isPanningMode, selectedTool]);

  const handleToolSelect = (tool: string) => {
    // Interlocked behavior - only one tool can be active at a time
    if (selectedTool === tool) {
      // If clicking the same tool, deselect it
      setSelectedTool('');
      if (isCalibrationMode) {
        toggleCalibrationMode();
      }
      if (isPerimeterMode) {
        togglePerimeterMode();
      }
      if (tool === 'pan') {
        setIsPanningMode(false);
        setIsPanningModeActive(false);
      }
    } else {
      // Select the new tool and deselect others
      setSelectedTool(tool);
      
      // Handle calibration tool
      if (tool === 'calibrate') {
        if (!isCalibrationMode) {
          toggleCalibrationMode();
        }
        // Ensure other modes are off when calibrating
        setIsPanningMode(false);
        setIsPanningModeActive(false);
        if (isPerimeterMode) {
          togglePerimeterMode();
        }
      }
      // Handle perimeter tool
      else if (tool === 'perimeter') {
        if (!isPerimeterMode) {
          togglePerimeterMode();
        }
        // Ensure other modes are off when using perimeter
        setIsPanningMode(false);
        setIsPanningModeActive(false);
        if (isCalibrationMode) {
          toggleCalibrationMode();
        }
      }
      // Handle pan/move tool
      else if (tool === 'pan') {
        // Enable panning mode
        setIsPanningMode(true);
        setIsPanningModeActive(true);
        // Ensure other modes are off when panning
        if (isCalibrationMode) {
          toggleCalibrationMode();
        }
        if (isPerimeterMode) {
          togglePerimeterMode();
        }
      } 
      else {
        // If switching to another tool, exit all modes
        if (isCalibrationMode) {
          toggleCalibrationMode();
        }
        if (isPerimeterMode) {
          togglePerimeterMode();
        }
        if (isPanningModeActive) {
          setIsPanningMode(false);
          setIsPanningModeActive(false);
        }
      }
    }
  };

  const handleProjectsClick = () => {
    // Deselect any active tool when opening projects drawer
    if (selectedTool) {
      setSelectedTool('');
      if (isCalibrationMode) {
        toggleCalibrationMode();
      }
    }
    // Call the parent handler
    onProjectsClick();
  };

  const handleImageImportClick = () => {
    // Deselect any active tool when opening image import drawer
    if (selectedTool) {
      setSelectedTool('');
      if (isCalibrationMode) {
        toggleCalibrationMode();
      }
    }
    // Call the parent handler
    onImageImportClick();
  };

  const handleSettingsClick = () => {
    // Deselect any active tool when opening settings drawer
    if (selectedTool) {
      setSelectedTool('');
      if (isCalibrationMode) {
        toggleCalibrationMode();
      }
    }
    // Call the parent handler
    onSettingsClick();
  };

  const handleDeleteSelected = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      // No items selected, show a message or do nothing
      return;
    }
    
    // Confirm deletion
    const itemText = selectedItems.length === 1 ? 'item' : 'items';
    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} selected ${itemText}?`;
    
    if (window.confirm(confirmMessage)) {
      removeSelectedItems();
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
        {/* Upper section - Project & Image Tools */}
        <List disablePadding>
          <Tooltip title="Projects" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleProjectsClick}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <FolderOpenIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Import Image" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleImageImportClick}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <ImageSearchIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Settings" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleSettingsClick}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <SettingsIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Main Tools */}
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
          
          <Tooltip title="Move Canvas" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedTool === 'pan'}
                onClick={() => handleToolSelect('pan')}
                sx={{ 
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1,
                  bgcolor: isPanningModeActive ? 'rgba(33, 150, 243, 0.2)' : 'transparent'
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <OpenWithIcon color={isPanningModeActive ? 'primary' : 'inherit'} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </Tooltip>
          
          <Tooltip title="Calibrate Scale" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedTool === 'calibrate'}
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

          <Tooltip title="Draw Perimeter" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedTool === 'perimeter'}
                onClick={() => handleToolSelect('perimeter')}
                sx={{
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 1,
                  bgcolor: isPerimeterMode ? 'rgba(156, 39, 176, 0.2)' : 'transparent'
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <TimelineIcon color={isPerimeterMode ? 'secondary' : 'inherit'} />
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
                onClick={handleDeleteSelected}
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
        
        {/* Divider */}
        <Divider sx={{ my: 1, mx: 2 }} />
        
        {/* Zoom Controls */}
        <Box sx={{ px: 1 }}>
          <Tooltip title="Zoom In" placement="right" arrow>
            <IconButton onClick={zoomIn} size="small" sx={{ mb: 0.5, width: '100%' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out" placement="right" arrow>
            <IconButton onClick={zoomOut} size="small" sx={{ mb: 0.5, width: '100%' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom to Fit" placement="right" arrow>
            <IconButton onClick={zoomToFit} size="small" sx={{ mb: 0.5, width: '100%' }}>
              <CenterFocusStrongIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={showGrid ? "Hide Grid" : "Show Grid"} placement="right" arrow>
            <IconButton 
              onClick={toggleGrid} 
              size="small" 
              sx={{ 
                mb: 0.5, 
                width: '100%',
                color: showGrid ? 'primary.main' : 'inherit'
              }}
            >
              {showGrid ? <GridOnIcon /> : <GridOffIcon />}
            </IconButton>
          </Tooltip>
          
          {/* Zoom Level Display */}
          <Box sx={{ 
            textAlign: 'center', 
            fontSize: '0.7rem', 
            color: 'text.secondary',
            mt: 1
          }}>
            {Math.round(scale * 100)}%
          </Box>
        </Box>
      </Box>
      
      {/* Drawers removed from here - now rendered in AppLayout */}
    </Drawer>
  );
};

export default LeftSidebar;
