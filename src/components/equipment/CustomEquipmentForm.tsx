import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Slider,
  IconButton
} from '@mui/material';
import { SketchPicker } from 'react-color';
import { Close as CloseIcon } from '@mui/icons-material';
import { EquipmentTemplate, EquipmentCategory } from '../../services/equipmentService';

interface CustomEquipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (template: Omit<EquipmentTemplate, 'id' | 'isCustom'>) => void;
  editingTemplate?: EquipmentTemplate;
  pixelsPerMeter: number;
}

const CustomEquipmentForm: React.FC<CustomEquipmentFormProps> = ({
  open,
  onClose,
  onSubmit,
  editingTemplate,
  pixelsPerMeter
}) => {
  const [name, setName] = useState(editingTemplate?.name || '');
  const [category, setCategory] = useState<EquipmentCategory>(
    editingTemplate?.category || 'booth'
  );
  const [width, setWidth] = useState(editingTemplate?.width || 3); // Default 3 meters
  const [height, setHeight] = useState(editingTemplate?.height || 3); // Default 3 meters
  const [color, setColor] = useState(editingTemplate?.color || '#FF6B35');
  const [description, setDescription] = useState(editingTemplate?.description || '');
  const [minSpacing, setMinSpacing] = useState(editingTemplate?.minSpacing || 1); // Default 1 meter
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Convert between meters and feet for display
  const metersToFeet = (meters: number) => Math.round(meters * 3.28084);
  const feetToMeters = (feet: number) => feet / 3.28084;
  
  const [widthFeet, setWidthFeet] = useState(metersToFeet(width));
  const [heightFeet, setHeightFeet] = useState(metersToFeet(height));
  
  // Handle unit conversions
  const handleWidthMetersChange = (newWidth: number) => {
    setWidth(newWidth);
    setWidthFeet(metersToFeet(newWidth));
  };
  
  const handleHeightMetersChange = (newHeight: number) => {
    setHeight(newHeight);
    setHeightFeet(metersToFeet(newHeight));
  };
  
  const handleWidthFeetChange = (newWidthFeet: number) => {
    setWidthFeet(newWidthFeet);
    setWidth(feetToMeters(newWidthFeet));
  };
  
  const handleHeightFeetChange = (newHeightFeet: number) => {
    setHeightFeet(newHeightFeet);
    setHeight(feetToMeters(newHeightFeet));
  };
  
  const handleSave = () => {
    onSubmit({
      name,
      category,
      width,
      height,
      color,
      description: description || undefined,
      minSpacing,
      shape: 'rectangle' // Default to rectangle for custom equipment
    });
    onClose();
  };
  
  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };
  
  const isValid = name.trim() !== '' && width > 0 && height > 0;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {editingTemplate ? 'Edit Equipment' : 'Create Custom Equipment'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Equipment Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <MenuItem value="booth">Booth</MenuItem>
                <MenuItem value="ride">Ride</MenuItem>
                <MenuItem value="game">Game</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="utility">Utility</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <Typography gutterBottom>Width</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                type="number"
                label="Meters"
                value={width.toFixed(1)}
                onChange={(e) => handleWidthMetersChange(parseFloat(e.target.value))}
                inputProps={{ step: 0.1, min: 0.1 }}
                size="small"
                sx={{ width: '45%' }}
              />
              <Typography sx={{ mx: 1 }}>/</Typography>
              <TextField
                type="number"
                label="Feet"
                value={widthFeet}
                onChange={(e) => handleWidthFeetChange(parseInt(e.target.value))}
                inputProps={{ step: 1, min: 1 }}
                size="small"
                sx={{ width: '45%' }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Typography gutterBottom>Height</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                type="number"
                label="Meters"
                value={height.toFixed(1)}
                onChange={(e) => handleHeightMetersChange(parseFloat(e.target.value))}
                inputProps={{ step: 0.1, min: 0.1 }}
                size="small"
                sx={{ width: '45%' }}
              />
              <Typography sx={{ mx: 1 }}>/</Typography>
              <TextField
                type="number"
                label="Feet"
                value={heightFeet}
                onChange={(e) => handleHeightFeetChange(parseInt(e.target.value))}
                inputProps={{ step: 1, min: 1 }}
                size="small"
                sx={{ width: '45%' }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>Minimum Spacing (meters)</Typography>
            <Slider
              value={minSpacing}
              onChange={(_, newValue) => setMinSpacing(newValue as number)}
              step={0.5}
              marks
              min={0}
              max={5}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Minimum distance required from other equipment ({minSpacing} meters / {metersToFeet(minSpacing)} feet)
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Color</Typography>
              <Box 
                sx={{ 
                  backgroundColor: color, 
                  width: 50, 
                  height: 50, 
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  borderRadius: 1
                }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2 }}>
                  <Box 
                    sx={{ 
                      position: 'fixed', 
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                    }}
                    onClick={() => setShowColorPicker(false)}
                  />
                  <SketchPicker color={color} onChange={handleColorChange} />
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Preview</Typography>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 150,
                backgroundColor: '#f5f5f5',
              }}>
                <Box 
                  sx={{ 
                    width: `${Math.min(120, (width / height) * 100)}px`, 
                    height: `${Math.min(100, (height / width) * 120)}px`,
                    backgroundColor: color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: 11,
                    boxShadow: 2,
                    position: 'relative'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="white" 
                    align="center"
                    sx={{ 
                      fontSize: '9px', 
                      position: 'absolute',
                      bottom: -20
                    }}
                  >
                    {name || 'Custom Equipment'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!isValid}
        >
          {editingTemplate ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomEquipmentForm;
