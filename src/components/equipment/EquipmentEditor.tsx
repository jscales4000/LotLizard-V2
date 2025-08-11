import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentItem } from '../../stores/equipmentStore';

interface EquipmentEditorProps {
  item: EquipmentItem;
  onClose?: () => void;
}

const EquipmentEditor: React.FC<EquipmentEditorProps> = ({ item, onClose }) => {
  const updateItemWithDimensions = useEquipmentStore(state => state.updateItemWithDimensions);
  const removeItem = useEquipmentStore(state => state.removeItem);
  const items = useEquipmentStore(state => state.items);
  
  // Calculate pixelsPerFoot from calibration square or use default
  const calculatePixelsPerFoot = (): number => {
    const calibrationSquare = items.find(item => item.templateId === 'calibration-square');
    if (calibrationSquare && calibrationSquare.realWorldWidth) {
      return calibrationSquare.width / calibrationSquare.realWorldWidth;
    }
    // Default: assume 30 pixels per foot if no calibration available
    return 30;
  };
  
  const pixelsPerFoot = calculatePixelsPerFoot();
  
  // Local state for editing
  const [editedItem, setEditedItem] = useState<Partial<EquipmentItem>>({
    name: item.name,
    shape: item.shape || 'rectangle',
    realWorldWidth: item.realWorldWidth,
    realWorldHeight: item.realWorldHeight,
    realWorldRadius: item.realWorldRadius,
    color: item.color,
    // Clearance parameters
    clearanceLeft: item.clearanceLeft || 0,
    clearanceRight: item.clearanceRight || 0,
    clearanceTop: item.clearanceTop || 0,
    clearanceBottom: item.clearanceBottom || 0,
    clearanceRadius: item.clearanceRadius || 0
  });

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if current edited values differ from original item
    const changed = 
      editedItem.name !== item.name ||
      editedItem.shape !== (item.shape || 'rectangle') ||
      editedItem.realWorldWidth !== item.realWorldWidth ||
      editedItem.realWorldHeight !== item.realWorldHeight ||
      editedItem.realWorldRadius !== item.realWorldRadius ||
      editedItem.color !== item.color ||
      editedItem.clearanceLeft !== (item.clearanceLeft || 0) ||
      editedItem.clearanceRight !== (item.clearanceRight || 0) ||
      editedItem.clearanceTop !== (item.clearanceTop || 0) ||
      editedItem.clearanceBottom !== (item.clearanceBottom || 0) ||
      editedItem.clearanceRadius !== (item.clearanceRadius || 0);
    
    setHasChanges(changed);
  }, [editedItem, item]);

  const handleFieldChange = (field: keyof EquipmentItem, value: any) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShapeChange = (newShape: 'rectangle' | 'circle') => {
    setEditedItem(prev => ({
      ...prev,
      shape: newShape,
      // Clear dimensions that don't apply to the new shape
      ...(newShape === 'circle' 
        ? { realWorldWidth: undefined, realWorldHeight: undefined }
        : { realWorldRadius: undefined }
      )
    }));
  };

  const handleSave = () => {
    // Validate dimensions
    if (editedItem.shape === 'rectangle') {
      if (!editedItem.realWorldWidth || !editedItem.realWorldHeight || 
          editedItem.realWorldWidth <= 0 || editedItem.realWorldHeight <= 0) {
        alert('Please enter valid width and height values greater than 0');
        return;
      }
    } else if (editedItem.shape === 'circle') {
      if (!editedItem.realWorldRadius || editedItem.realWorldRadius <= 0) {
        alert('Please enter a valid radius value greater than 0');
        return;
      }
    }

    if (!editedItem.name?.trim()) {
      alert('Please enter a valid name');
      return;
    }

    // Update the item in the store with dimension recalculation
    updateItemWithDimensions(item.id, editedItem, pixelsPerFoot);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedItem({
      name: item.name,
      shape: item.shape || 'rectangle',
      realWorldWidth: item.realWorldWidth,
      realWorldHeight: item.realWorldHeight,
      realWorldRadius: item.realWorldRadius,
      color: item.color,
      // Reset clearance parameters
      clearanceLeft: item.clearanceLeft || 0,
      clearanceRight: item.clearanceRight || 0,
      clearanceTop: item.clearanceTop || 0,
      clearanceBottom: item.clearanceBottom || 0,
      clearanceRadius: item.clearanceRadius || 0
    });
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      removeItem(item.id);
      onClose?.();
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Edit Equipment</Typography>
        <Box>
          <Tooltip title="Reset changes">
            <span>
              <IconButton 
                onClick={handleReset} 
                disabled={!hasChanges}
                size="small"
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Save changes">
            <span>
              <IconButton 
                onClick={handleSave} 
                disabled={!hasChanges}
                color="primary"
                size="small"
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete item">
            <IconButton 
              onClick={handleDelete} 
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {/* Basic Properties */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            value={editedItem.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            size="small"
          />
        </Grid>



        {/* Shape Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Shape</InputLabel>
            <Select
              value={editedItem.shape || 'rectangle'}
              label="Shape"
              onChange={(e) => handleShapeChange(e.target.value as 'rectangle' | 'circle')}
            >
              <MenuItem value="rectangle">Rectangle</MenuItem>
              <MenuItem value="circle">Circle</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Dimensions based on shape */}
        {editedItem.shape === 'rectangle' ? (
          <>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Width (ft)"
                type="number"
                value={editedItem.realWorldWidth || ''}
                onChange={(e) => handleFieldChange('realWorldWidth', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0.1, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Height (ft)"
                type="number"
                value={editedItem.realWorldHeight || ''}
                onChange={(e) => handleFieldChange('realWorldHeight', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0.1, step: 0.1 }}
                size="small"
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Radius (ft)"
              type="number"
              value={editedItem.realWorldRadius || ''}
              onChange={(e) => handleFieldChange('realWorldRadius', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0.1, step: 0.1 }}
              size="small"
            />
          </Grid>
        )}

        {/* Color */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Color:</Typography>
            <input
              type="color"
              value={editedItem.color || '#000000'}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              style={{
                width: '40px',
                height: '30px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {editedItem.color}
            </Typography>
          </Box>
        </Grid>

        {/* Clearance Zone Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Clearance Zone (ft)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Additional safety clearance around the equipment
          </Typography>
        </Grid>

        {/* Clearance fields based on shape */}
        {editedItem.shape === 'rectangle' ? (
          <>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Left (ft)"
                type="number"
                value={editedItem.clearanceLeft || ''}
                onChange={(e) => handleFieldChange('clearanceLeft', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Right (ft)"
                type="number"
                value={editedItem.clearanceRight || ''}
                onChange={(e) => handleFieldChange('clearanceRight', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Top (ft)"
                type="number"
                value={editedItem.clearanceTop || ''}
                onChange={(e) => handleFieldChange('clearanceTop', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bottom (ft)"
                type="number"
                value={editedItem.clearanceBottom || ''}
                onChange={(e) => handleFieldChange('clearanceBottom', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Clearance Radius (ft)"
              type="number"
              value={editedItem.clearanceRadius || ''}
              onChange={(e) => handleFieldChange('clearanceRadius', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.1 }}
              size="small"
            />
          </Grid>
        )}
      </Grid>

      {hasChanges && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="caption" color="warning.contrastText">
            You have unsaved changes. Click save to apply them.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EquipmentEditor;
