import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Backup as BackupIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { EquipmentTemplate } from '../../services/equipmentService';
import { EquipmentLibraryService } from '../../services/equipmentLibraryService';

interface EquipmentLibraryManagerProps {
  templates: EquipmentTemplate[];
  onTemplatesUpdate: (templates: EquipmentTemplate[]) => void;
}

export const EquipmentLibraryManager: React.FC<EquipmentLibraryManagerProps> = ({
  templates,
  onTemplatesUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCustomOnly: false,
    includeBuiltIn: true
  });
  
  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    mode: 'merge' as 'merge' | 'append' | 'replace'
  });
  
  // Create new template dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<EquipmentTemplate>>({
    name: '',
    category: 'rides',
    shape: 'rectangle',
    width: 30,
    height: 20,
    radius: 15,
    color: '#4ECDC4',
    description: '',
    isCustom: true,
    capacity: 0,
    weight: 0,
    verticalHeight: 0,
    turnAroundTime: 0,
    powerLoad: 0,
    powerGen: 0,
    ticketCount: 0
  });

  const customTemplateCount = templates.filter(t => t.isCustom).length;
  const totalTemplateCount = templates.length;

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSaveToLocalStorage = async () => {
    setLoading(true);
    clearMessages();
    
    try {
      // Use localStorage directly since the service method doesn't exist
      localStorage.setItem('equipmentLibrary', JSON.stringify(templates));
      setSuccess('Equipment library saved to local storage!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save to local storage');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    clearMessages();
    
    try {
      let templatesToExport = templates;
      
      if (exportOptions.includeCustomOnly && !exportOptions.includeBuiltIn) {
        templatesToExport = templates.filter(t => t.isCustom);
      } else if (!exportOptions.includeCustomOnly && exportOptions.includeBuiltIn) {
        templatesToExport = templates.filter(t => !t.isCustom);
      }
      
      await EquipmentLibraryService.exportLibrary(templatesToExport);
      setSuccess(`Exported ${templatesToExport.length} templates successfully!`);
      setExportDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export library');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    clearMessages();
    
    try {
      const importOptions_service = {
        mergeStrategy: importOptions.mode,
        categoryFilter: undefined
      };
      
      const updatedTemplates = await EquipmentLibraryService.importLibrary(
        selectedFile, 
        templates, 
        importOptions_service
      );
      
      onTemplatesUpdate(updatedTemplates);
      const importedCount = updatedTemplates.length - templates.length;
      setSuccess(`Imported ${Math.max(importedCount, 0)} templates successfully!`);
      setImportDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import library');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDialogOpen = () => {
    // Reset new template to defaults
    setNewTemplate({
      name: '',
      category: 'rides',
      shape: 'rectangle',
      width: 30,
      height: 20,
      radius: 15,
      color: '#4ECDC4',
      description: '',
      isCustom: true,
      capacity: 0,
      weight: 0,
      verticalHeight: 0,
      turnAroundTime: 0,
      powerLoad: 0,
      powerGen: 0,
      ticketCount: 0
    });
    setCreateDialogOpen(true);
    clearMessages();
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name?.trim()) {
      setError('Template name is required');
      return;
    }

    if (newTemplate.shape === 'rectangle' && (!newTemplate.width || !newTemplate.height)) {
      setError('Width and height are required for rectangular templates');
      return;
    }

    if (newTemplate.shape === 'circle' && !newTemplate.radius) {
      setError('Radius is required for circular templates');
      return;
    }

    try {
      // Generate a unique ID for the new template
      const maxId = Math.max(...templates.map(t => parseInt(t.id) || 0), 0);
      const newId = (maxId + 1).toString();
      
      const completeTemplate: EquipmentTemplate = {
        id: newId,
        name: newTemplate.name,
        category: newTemplate.category || 'rides',
        shape: newTemplate.shape || 'rectangle',
        width: newTemplate.width || 30,
        height: newTemplate.height || 20,
        radius: newTemplate.radius || 15,
        color: newTemplate.color || '#4ECDC4',
        description: newTemplate.description || '',
        isCustom: true,
        capacity: newTemplate.capacity || 0,
        weight: newTemplate.weight || 0,
        verticalHeight: newTemplate.verticalHeight || 0,
        turnAroundTime: newTemplate.turnAroundTime || 0,
        powerLoad: newTemplate.powerLoad || 0,
        powerGen: newTemplate.powerGen || 0,
        ticketCount: newTemplate.ticketCount || 0
      };

      const updatedTemplates = [...templates, completeTemplate];
      onTemplatesUpdate(updatedTemplates);
      setSuccess(`Template "${completeTemplate.name}" created successfully!`);
      setCreateDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create template');
    }
  };

  return (
    <Box sx={{ 
      p: 2, 
      borderTop: 1, 
      borderColor: 'divider', 
      bgcolor: 'background.paper',
      borderRadius: '0 0 8px 8px'
    }}>
      {/* Header */}
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <BackupIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        Library Management
      </Typography>

      {/* Action Buttons */}
      <Stack spacing={1.5}>
        {/* Primary Action - New Template */}
        <Button
          variant="contained"
          onClick={handleCreateDialogOpen}
          startIcon={<AddIcon />}
          sx={{ 
            py: 1.2,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          New
        </Button>

        {/* Secondary Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setExportDialogOpen(true)}
            startIcon={<DownloadIcon />}
            sx={{ 
              flex: 1,
              py: 0.8,
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                color: 'primary.main',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Export
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setImportDialogOpen(true)}
            startIcon={<UploadIcon />}
            sx={{ 
              flex: 1,
              py: 0.8,
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                color: 'primary.main',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Import
          </Button>
        </Stack>
      </Stack>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      {/* Save to Local Storage Button */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="text"
          onClick={handleSaveToLocalStorage}
          disabled={loading}
          startIcon={<SaveIcon />}
          sx={{ 
            width: '100%',
            py: 0.8,
            fontSize: '0.8rem',
            fontWeight: 500,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': { 
              bgcolor: 'action.hover',
              color: 'primary.main'
            }
          }}
        >
          {loading ? 'Saving...' : 'Save to Local Storage'}
        </Button>
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Equipment Library</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Export Options</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeCustomOnly}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeCustomOnly: e.target.checked }))}
                    />
                  }
                  label="Include custom templates only"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeBuiltIn}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeBuiltIn: e.target.checked }))}
                    />
                  }
                  label="Include built-in templates"
                />
              </FormGroup>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Custom templates: {customTemplateCount} | Total templates: {totalTemplateCount}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Equipment Library</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ marginBottom: '16px' }}
            />
            
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Import Mode</FormLabel>
              <RadioGroup
                value={importOptions.mode}
                onChange={(e) => setImportOptions(prev => ({ ...prev, mode: e.target.value as any }))}
              >
                <FormControlLabel 
                  value="merge" 
                  control={<Radio />} 
                  label="Merge (update existing, add new)" 
                />
                <FormControlLabel 
                  value="append" 
                  control={<Radio />} 
                  label="Append (add all as new)" 
                />
                <FormControlLabel 
                  value="replace" 
                  control={<Radio />} 
                  label="Replace (replace entire library)" 
                />
              </RadioGroup>
            </FormControl>

            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={loading || !selectedFile}
            startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create New Template Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Equipment Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Stack spacing={2}>
              {/* Basic Information */}
              <TextField
                fullWidth
                label="Template Name"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />

              {/* Category and Shape */}
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTemplate.category || 'rides'}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value as any }))}
                    label="Category"
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
                
                <FormControl fullWidth>
                  <InputLabel>Shape</InputLabel>
                  <Select
                    value={newTemplate.shape || 'rectangle'}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, shape: e.target.value as 'rectangle' | 'circle' }))}
                    label="Shape"
                  >
                    <MenuItem value="rectangle">Rectangle</MenuItem>
                    <MenuItem value="circle">Circle</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Dimensions */}
              {newTemplate.shape === 'rectangle' ? (
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Width (ft)"
                    type="number"
                    value={newTemplate.width || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ min: 0, step: 0.1 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Height (ft)"
                    type="number"
                    value={newTemplate.height || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ min: 0, step: 0.1 }}
                    required
                  />
                </Stack>
              ) : (
                <TextField
                  fullWidth
                  label="Radius (ft)"
                  type="number"
                  value={newTemplate.radius || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, radius: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.1 }}
                  required
                />
              )}

              {/* Color */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: newTemplate.color || '#4ECDC4',
                      border: '2px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      '&:focus': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px'
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Open color picker"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = newTemplate.color || '#4ECDC4';
                        input.addEventListener('change', (e) => {
                          const target = e.target as HTMLInputElement;
                          setNewTemplate(prev => ({ ...prev, color: target.value }));
                        });
                        input.click();
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = newTemplate.color || '#4ECDC4';
                      input.addEventListener('change', (e) => {
                        const target = e.target as HTMLInputElement;
                        setNewTemplate(prev => ({ ...prev, color: target.value }));
                      });
                      input.click();
                    }}
                  >
                    <Typography variant="caption" sx={{
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      PICK
                    </Typography>
                  </Box>
                  <TextField
                    label="Hex Color"
                    value={newTemplate.color || '#4ECDC4'}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Auto-format hex values
                      if (value.match(/^[0-9A-Fa-f]{6}$/)) {
                        setNewTemplate(prev => ({ ...prev, color: '#' + value }));
                      } else if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                        setNewTemplate(prev => ({ ...prev, color: value }));
                      }
                    }}
                    placeholder="#4ECDC4"
                    sx={{ flexGrow: 1 }}
                    inputProps={{
                      pattern: '^#[0-9A-Fa-f]{6}$',
                      maxLength: 7
                    }}
                    helperText="Enter hex color (e.g., #FF0000)"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Popular Colors:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {[
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8C471',
                    '#F1948A', '#85C1E9', '#A9CCE3', '#A3E4D7', '#F5B7B1',
                    '#AED6F1', '#D7BDE2', '#A9DFBF', '#FADBD8', '#D5DBDB'
                  ].map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 28,
                        height: 28,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: newTemplate.color === color ? '3px solid #333' : '2px solid #ddd',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          borderColor: newTemplate.color === color ? '#333' : '#999'
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select color ${color}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setNewTemplate(prev => ({ ...prev, color }));
                        }
                      }}
                      onClick={() => setNewTemplate(prev => ({ ...prev, color }))}
                    />
                  ))}
                </Box>
              </Box>

              {/* Equipment Properties */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Equipment Properties</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={newTemplate.capacity || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 1 }}
                />
                <TextField
                  fullWidth
                  label="Weight (lbs)"
                  type="number"
                  value={newTemplate.weight || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Vertical Height (ft)"
                  type="number"
                  value={newTemplate.verticalHeight || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, verticalHeight: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  fullWidth
                  label="Turn Around Time (min)"
                  type="number"
                  value={newTemplate.turnAroundTime || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, turnAroundTime: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Power Load"
                  type="number"
                  value={newTemplate.powerLoad || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, powerLoad: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  fullWidth
                  label="Power Gen"
                  type="number"
                  value={newTemplate.powerGen || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, powerGen: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  fullWidth
                  label="Ticket Count"
                  type="number"
                  value={newTemplate.ticketCount || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, ticketCount: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTemplate} 
            variant="contained" 
            disabled={loading || !newTemplate.name?.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
