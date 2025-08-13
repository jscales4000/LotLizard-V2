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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMapStore } from '../../stores/mapStore';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ open, onClose }) => {
  const [units, setUnits] = useState('feet');
  const [gridSize, setGridSize] = useState(10);
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
    toggleClearanceZones
  } = useMapStore();

  const handleClose = () => {
    onClose();
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

                <Box>
                  <Typography gutterBottom>Grid Size</Typography>
                  <Slider
                    value={gridSize}
                    onChange={(e, newValue) => setGridSize(newValue as number)}
                    min={5}
                    max={50}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}ft`}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Units & Measurements */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Units & Measurements</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Units</InputLabel>
                  <Select
                    value={units}
                    label="Units"
                    onChange={(e) => setUnits(e.target.value)}
                  >
                    <MenuItem value="feet">Feet</MenuItem>
                    <MenuItem value="meters">Meters</MenuItem>
                    <MenuItem value="yards">Yards</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                    />
                  }
                  label="Snap to Grid"
                />
              </Box>
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
