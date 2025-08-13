import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Stack,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon
} from '@mui/icons-material';
import { EquipmentTemplate, EquipmentCategory } from '../../services/equipmentService';
import { EquipmentLibraryService } from '../../services/equipmentLibraryService';

interface LibraryTemplateEditorProps {
  open: boolean;
  template: EquipmentTemplate | null;
  onClose: () => void;
  onSave: (template: EquipmentTemplate) => void;
  onDelete?: (templateId: string) => void;
}

const DRAWER_WIDTH = 320;

const colorOptions = [
  { value: '#FF6B6B', label: 'Red' },
  { value: '#4ECDC4', label: 'Teal' },
  { value: '#45B7D1', label: 'Blue' },
  { value: '#96CEB4', label: 'Green' },
  { value: '#FFEAA7', label: 'Yellow' },
  { value: '#DDA0DD', label: 'Plum' },
  { value: '#98D8C8', label: 'Mint' },
  { value: '#F7DC6F', label: 'Gold' },
  { value: '#BB8FCE', label: 'Purple' },
  { value: '#85C1E9', label: 'Light Blue' }
];

export const LibraryTemplateEditor: React.FC<LibraryTemplateEditorProps> = ({
  open,
  template,
  onClose,
  onSave,
  onDelete
}) => {
  const [editedTemplate, setEditedTemplate] = useState<EquipmentTemplate | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize edited template when template prop changes
  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      setHasChanges(false);
      setError(null);
      setSuccess(null);
    }
  }, [template]);

  const handleFieldChange = (field: keyof EquipmentTemplate, value: any) => {
    if (!editedTemplate) return;

    const updated = { ...editedTemplate, [field]: value };
    
    // Handle shape changes - clear incompatible properties
    if (field === 'shape') {
      if (value === 'circle') {
        // Clear rectangle properties
        delete updated.width;
        delete updated.height;
        delete updated.clearanceLeft;
        delete updated.clearanceRight;
        delete updated.clearanceTop;
        delete updated.clearanceBottom;
        // Set default radius if not present
        if (!updated.radius) {
          updated.radius = 15;
          updated.clearanceRadius = 5;
        }
      } else if (value === 'rectangle') {
        // Clear circle properties
        delete updated.radius;
        delete updated.clearanceRadius;
        // Set default dimensions if not present
        if (!updated.width) {
          updated.width = 30;
          updated.height = 20;
          updated.clearanceLeft = 5;
          updated.clearanceRight = 5;
          updated.clearanceTop = 5;
          updated.clearanceBottom = 5;
        }
      }
    }

    setEditedTemplate(updated);
    setHasChanges(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = () => {
    if (!editedTemplate) return;

    try {
      // Validate required fields
      if (!editedTemplate.name.trim()) {
        setError('Name is required');
        return;
      }

      if (editedTemplate.shape === 'rectangle') {
        if (!editedTemplate.width || !editedTemplate.height) {
          setError('Width and height are required for rectangular items');
          return;
        }
      } else if (editedTemplate.shape === 'circle') {
        if (!editedTemplate.radius) {
          setError('Radius is required for circular items');
          return;
        }
      }

      onSave(editedTemplate);
      setHasChanges(false);
      setSuccess('Template saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save template');
    }
  };

  const handleDelete = () => {
    if (!editedTemplate || !onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${editedTemplate.name}"?`)) {
      onDelete(editedTemplate.id);
      onClose();
    }
  };

  const handleExport = () => {
    if (!editedTemplate) return;
    
    try {
      EquipmentLibraryService.exportTemplate(editedTemplate);
      setSuccess('Template exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export template');
    }
  };

  const handleImport = async () => {
    try {
      const importedTemplate = await EquipmentLibraryService.importTemplate();
      if (importedTemplate) {
        // Generate unique ID to avoid conflicts
        const timestamp = Date.now();
        importedTemplate.id = `${importedTemplate.id}-imported-${timestamp}`;
        
        setEditedTemplate(importedTemplate);
        setHasChanges(true);
        setSuccess('Template imported successfully! You can now edit and save it.');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import template');
    }
  };

  if (!editedTemplate) return null;

  // Don't render anything if not open - this prevents z-index conflicts
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: '372px', // Position directly to the left of the sidebar
        width: DRAWER_WIDTH,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        zIndex: 999, // Just below sidebar but high enough to be visible
        boxShadow: 3,
        overflow: 'hidden',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Template
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Success/Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Form Fields */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
            {/* Basic Info */}
            <TextField
              label="Name"
              value={editedTemplate.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Description"
              value={editedTemplate.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={editedTemplate.category}
                label="Category"
                onChange={(e) => handleFieldChange('category', e.target.value as EquipmentCategory)}
              >
                <MenuItem value="mega-rides">Mega Rides</MenuItem>
                <MenuItem value="rides">Rides</MenuItem>
                <MenuItem value="kiddy-rides">Kiddy Rides</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="games">Games</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="office">Office</MenuItem>
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="bunks">Bunks</MenuItem>
              </Select>
            </FormControl>

            {/* Shape Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Shape</InputLabel>
              <Select
                value={editedTemplate.shape}
                label="Shape"
                onChange={(e) => handleFieldChange('shape', e.target.value)}
              >
                <MenuItem value="rectangle">Rectangle</MenuItem>
                <MenuItem value="circle">Circle</MenuItem>
              </Select>
            </FormControl>

            {/* Dimensions */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Dimensions (feet)
            </Typography>

            {editedTemplate.shape === 'rectangle' ? (
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Width"
                  type="number"
                  value={editedTemplate.width || ''}
                  onChange={(e) => handleFieldChange('width', parseFloat(e.target.value) || 0)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Height"
                  type="number"
                  value={editedTemplate.height || ''}
                  onChange={(e) => handleFieldChange('height', parseFloat(e.target.value) || 0)}
                  size="small"
                  fullWidth
                />
              </Stack>
            ) : (
              <TextField
                label="Radius"
                type="number"
                value={editedTemplate.radius || ''}
                onChange={(e) => handleFieldChange('radius', parseFloat(e.target.value) || 0)}
                size="small"
                fullWidth
              />
            )}

            {/* Clearance */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Clearance (feet)
            </Typography>

            {editedTemplate.shape === 'rectangle' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <TextField
                  label="Left"
                  type="number"
                  value={editedTemplate.clearanceLeft || ''}
                  onChange={(e) => handleFieldChange('clearanceLeft', parseFloat(e.target.value) || 0)}
                  size="small"
                />
                <TextField
                  label="Right"
                  type="number"
                  value={editedTemplate.clearanceRight || ''}
                  onChange={(e) => handleFieldChange('clearanceRight', parseFloat(e.target.value) || 0)}
                  size="small"
                />
                <TextField
                  label="Top"
                  type="number"
                  value={editedTemplate.clearanceTop || ''}
                  onChange={(e) => handleFieldChange('clearanceTop', parseFloat(e.target.value) || 0)}
                  size="small"
                />
                <TextField
                  label="Bottom"
                  type="number"
                  value={editedTemplate.clearanceBottom || ''}
                  onChange={(e) => handleFieldChange('clearanceBottom', parseFloat(e.target.value) || 0)}
                  size="small"
                />
              </Box>
            ) : (
              <TextField
                label="Clearance Radius"
                type="number"
                value={editedTemplate.clearanceRadius || ''}
                onChange={(e) => handleFieldChange('clearanceRadius', parseFloat(e.target.value) || 0)}
                size="small"
                fullWidth
              />
            )}

            {/* Color */}
            <FormControl fullWidth size="small">
              <InputLabel>Color</InputLabel>
              <Select
                value={editedTemplate.color}
                label="Color"
                onChange={(e) => handleFieldChange('color', e.target.value)}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: value,
                        borderRadius: 1,
                        mr: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    {colorOptions.find(c => c.value === value)?.label || value}
                  </Box>
                )}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: color.value,
                          borderRadius: 1,
                          mr: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                      {color.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Additional Properties */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Properties
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                label="Capacity"
                type="number"
                value={editedTemplate.capacity || ''}
                onChange={(e) => handleFieldChange('capacity', parseInt(e.target.value) || 0)}
                size="small"
                fullWidth
              />
              <TextField
                label="Weight (lbs)"
                type="number"
                value={editedTemplate.weight || ''}
                onChange={(e) => handleFieldChange('weight', parseInt(e.target.value) || 0)}
                size="small"
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <TextField
                label="Height (ft)"
                type="number"
                value={editedTemplate.verticalHeight || ''}
                onChange={(e) => handleFieldChange('verticalHeight', parseInt(e.target.value) || 0)}
                size="small"
                fullWidth
              />
              <TextField
                label="Turn Time (min)"
                type="number"
                value={editedTemplate.turnAroundTime || ''}
                onChange={(e) => handleFieldChange('turnAroundTime', parseInt(e.target.value) || 0)}
                size="small"
                fullWidth
              />
            </Stack>

            {/* Custom Template Flag */}
            <FormControlLabel
              control={
                <Switch
                  checked={editedTemplate.isCustom || false}
                  onChange={(e) => handleFieldChange('isCustom', e.target.checked)}
                />
              }
              label="Custom Template"
            />
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack spacing={1}>
            {/* Primary Actions */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!hasChanges}
                startIcon={<SaveIcon />}
                fullWidth
              >
                Save Changes
              </Button>
              {onDelete && editedTemplate.isCustom && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              )}
            </Stack>
            
            {/* Import/Export Actions */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleExport}
                startIcon={<ExportIcon />}
                fullWidth
                size="small"
              >
                Export Template
              </Button>
              <Button
                variant="outlined"
                onClick={handleImport}
                startIcon={<ImportIcon />}
                fullWidth
                size="small"
              >
                Import Template
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
