import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import { useMapStore } from '../../stores/mapStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingService } from '../../services/onboardingService';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ open, onClose }) => {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('english');
  
  const {
    showGrid,
    toggleGrid,
    showCalibrationLine,
    toggleCalibrationLine,
    showEquipmentLabels,
    toggleEquipmentLabels,
    showClearanceZones,
    toggleClearanceZones,
    gridSpacing,
    setGridSpacing,
    gridColor,
    setGridColor,
    gridOpacity,
    setGridOpacity
  } = useMapStore();

  const { startOnboarding } = useOnboardingStore();

  const handleClose = () => {
    onClose();
  };

  const handleStartOnboarding = () => {
    // Reset onboarding status to allow it to show again
    OnboardingService.resetOnboardingStatus();
    // Start the onboarding flow
    startOnboarding();
    // Close settings drawer
    handleClose();
  };



  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: '60px',
        width: '350px',
        height: 'calc(100vh - 64px)',
        bgcolor: 'background.paper',
        boxShadow: 3,
        zIndex: 1000,
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Display Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Display Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={theme}
                    label="Theme"
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showGrid}
                      onChange={toggleGrid}
                    />
                  }
                  label="Show Grid"
                />

                {/* Grid Configuration */}
                {showGrid && (
                  <Box sx={{ ml: 2, mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Grid Settings
                    </Typography>

                    {/* Grid Size */}
                    <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom>Grid Spacing: {gridSpacing}ft</Typography>
                      <Slider
                        value={gridSpacing}
                        onChange={(e, newValue) => setGridSpacing(newValue as number)}
                        min={5}
                        max={50}
                        step={5}
                        marks={[
                          { value: 5, label: '5ft' },
                          { value: 10, label: '10ft' },
                          { value: 25, label: '25ft' },
                          { value: 50, label: '50ft' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}ft`}
                      />
                    </Box>

                    {/* Grid Color */}
                    <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom>Grid Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="color"
                          value={gridColor}
                          onChange={(e) => setGridColor(e.target.value)}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {gridColor.toUpperCase()}
                        </Typography>
                      </Box>

                      {/* Preset colors */}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        {['#333333', '#666666', '#999999', '#cccccc', '#ffffff', '#ff0000', '#00ff00', '#0000ff'].map((color) => (
                          <Paper
                            key={color}
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: color,
                              cursor: 'pointer',
                              border: gridColor === color ? '2px solid #1976d2' : '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 1
                            }}
                            onClick={() => setGridColor(color)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Grid Opacity */}
                    <Box>
                      <Typography gutterBottom>Grid Opacity: {Math.round(gridOpacity * 100)}%</Typography>
                      <Slider
                        value={gridOpacity}
                        onChange={(e, newValue) => setGridOpacity(newValue as number)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        marks={[
                          { value: 0.1, label: '10%' },
                          { value: 0.3, label: '30%' },
                          { value: 0.5, label: '50%' },
                          { value: 1.0, label: '100%' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                      />
                    </Box>
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={showCalibrationLine}
                      onChange={toggleCalibrationLine}
                    />
                  }
                  label="Show Calibration Line"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={showEquipmentLabels}
                      onChange={toggleEquipmentLabels}
                    />
                  }
                  label="Show Equipment Labels"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={showClearanceZones}
                      onChange={toggleClearanceZones}
                    />
                  }
                  label="Show Clearance Zones"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={showCoordinates}
                      onChange={(e) => setShowCoordinates(e.target.checked)}
                    />
                  }
                  label="Show Coordinates"
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Snap to Grid */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Grid Behavior</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Switch
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                  />
                }
                label="Snap to Grid"
              />
            </AccordionDetails>
          </Accordion>

          {/* Auto-Save Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Auto-Save</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                    />
                  }
                  label="Enable Auto-Save"
                />

                {autoSave && (
                  <TextField
                    label="Auto-Save Interval (minutes)"
                    type="number"
                    size="small"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                    inputProps={{ min: 1, max: 60 }}
                  />
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Language & Localization */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Language & Localization</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="spanish">Spanish</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                  <MenuItem value="german">German</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          {/* Help & Support */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Help & Support</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={handleStartOnboarding}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Onboard
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Restart the interactive tutorial to learn how to use LotLizard V2
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Application Info */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Application Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Version" 
                    secondary="LotLizard V2.0.0" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Build Date" 
                    secondary="August 2025" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="License" 
                    secondary="Commercial License" 
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                console.log('Settings saved');
                handleClose();
              }}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsDrawer;
