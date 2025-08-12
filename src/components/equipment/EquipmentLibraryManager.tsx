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

  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { EquipmentTemplate } from '../../services/equipmentService';
import { EquipmentLibraryService, EquipmentLibraryImportOptions } from '../../services/equipmentLibraryService';

interface EquipmentLibraryManagerProps {
  templates: EquipmentTemplate[];
  onTemplatesUpdate: (templates: EquipmentTemplate[]) => void;
}

export const EquipmentLibraryManager: React.FC<EquipmentLibraryManagerProps> = ({
  templates,
  onTemplatesUpdate
}) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Export options state
  const [exportOptions, setExportOptions] = useState({
    includeCustomOnly: false,
    categoryFilter: [] as string[],
    filename: ''
  });

  // Import options state
  const [importOptions, setImportOptions] = useState<EquipmentLibraryImportOptions>({
    mergeStrategy: 'merge',
    categoryFilter: []
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const customTemplateCount = templates.filter(t => t.isCustom).length;
  const totalTemplateCount = templates.length;

  const handleExport = () => {
    try {
      setLoading(true);
      EquipmentLibraryService.exportLibrary(templates, exportOptions);
      setSuccess('Equipment library exported successfully!');
      setExportDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export library');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      const updatedTemplates = await EquipmentLibraryService.importLibrary(
        selectedFile,
        templates,
        importOptions
      );
      onTemplatesUpdate(updatedTemplates);
      setSuccess(`Successfully imported ${updatedTemplates.length - templates.length} new templates!`);
      setImportDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import library');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLocalStorage = () => {
    try {
      setLoading(true);
      EquipmentLibraryService.saveLibraryToLocalStorage(templates);
      setSuccess('Equipment library saved to browser storage!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save library');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromLocalStorage = () => {
    try {
      setLoading(true);
      const storedTemplates = EquipmentLibraryService.loadLibraryFromLocalStorage();
      if (storedTemplates) {
        onTemplatesUpdate(storedTemplates);
        setSuccess('Equipment library loaded from browser storage!');
      } else {
        setError('No saved library found in browser storage');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" spacing={0.5} sx={{ width: '100%' }}>
          <Button
            size="small"
            onClick={() => setExportDialogOpen(true)}
            sx={{ 
              flex: 1,
              px: 1.5, 
              py: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { 
                bgcolor: 'action.hover',
                color: 'primary.main',
                borderColor: 'primary.main'
              }
            }}
          >
            <DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Export
          </Button>
          
          <Button
            size="small"
            onClick={() => setImportDialogOpen(true)}
            sx={{ 
              flex: 1,
              px: 1.5, 
              py: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { 
                bgcolor: 'action.hover',
                color: 'primary.main',
                borderColor: 'primary.main'
              }
            }}
          >
            <UploadIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Import
          </Button>
          
          <Button
            size="small"
            onClick={handleSaveToLocalStorage}
            disabled={loading}
            sx={{ 
              flex: 1,
              px: 1.5, 
              py: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { 
                bgcolor: 'action.hover',
                color: 'primary.main',
                borderColor: 'primary.main'
              },
              '&:disabled': {
                color: 'text.disabled',
                borderColor: 'action.disabled'
              }
            }}
          >
            <SaveIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Save
          </Button>
          
          <Button
            size="small"
            onClick={handleLoadFromLocalStorage}
            disabled={loading}
            sx={{ 
              flex: 1,
              px: 1.5, 
              py: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { 
                bgcolor: 'action.hover',
                color: 'primary.main',
                borderColor: 'primary.main'
              },
              '&:disabled': {
                color: 'text.disabled',
                borderColor: 'action.disabled'
              }
            }}
          >
            <BackupIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Load
          </Button>
        </Stack>
      </Box>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={clearMessages}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Equipment Library</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeCustomOnly}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeCustomOnly: e.target.checked 
                    }))}
                  />
                }
                label="Export custom templates only"
              />
            </FormGroup>

            <TextField
              fullWidth
              label="Filename (optional)"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                filename: e.target.value 
              }))}
              placeholder="equipment-library-export.json"
              sx={{ mt: 2 }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {exportOptions.includeCustomOnly 
                ? `Will export ${customTemplateCount} custom templates`
                : `Will export all ${totalTemplateCount} templates`
              }
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
              style={{ marginBottom: 16 }}
            />

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Import Strategy</FormLabel>
              <RadioGroup
                value={importOptions.mergeStrategy}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  mergeStrategy: e.target.value as any 
                }))}
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
    </Box>
  );
};
