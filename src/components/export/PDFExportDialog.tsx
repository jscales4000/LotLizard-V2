import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Slider,
  Stack
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { PDFExportService, PDFExportOptions, ProjectMetadata } from '../../services/pdfExportService';

interface PDFExportDialogProps {
  open: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  projectMetadata: ProjectMetadata;
}

export const PDFExportDialog: React.FC<PDFExportDialogProps> = ({
  open,
  onClose,
  canvasRef,
  projectMetadata
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [exportOptions, setExportOptions] = useState<PDFExportOptions & { projectName: string }>({
    title: 'Equipment Layout Export',
    projectName: projectMetadata.projectName || 'My Layout',
    includeMetadata: true,
    quality: 0.95,
    format: 'a4',
    orientation: 'landscape'
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      setError('Canvas not available for export');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      // Validate export conditions
      const validation = PDFExportService.validateExportConditions(canvasRef.current);
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.issues.join(', ')}`);
      }

      // Prepare metadata with current options
      const metadata: ProjectMetadata = {
        ...projectMetadata,
        projectName: exportOptions.projectName,
        exportDate: new Date().toLocaleString()
      };

      // Get optimal format if auto-detect is enabled
      const canvas = canvasRef.current;
      const optimalSettings = PDFExportService.getOptimalFormat(canvas.width, canvas.height);
      
      const finalOptions: PDFExportOptions = {
        ...exportOptions,
        // Use optimal settings if format is auto
        ...(exportOptions.format === 'a4' && optimalSettings)
      };

      // Export to PDF
      await PDFExportService.exportMapToPDF(canvas, metadata, finalOptions);
      
      setSuccess('PDF exported successfully!');
      
      // Auto-close dialog after successful export
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('PDF export error:', error);
      setError(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      clearMessages();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PdfIcon color="primary" />
        Export Layout to PDF
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Project Information */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Project Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Project Name"
                value={exportOptions.projectName}
                onChange={(e) => setExportOptions(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="My Equipment Layout"
              />
              
              <TextField
                fullWidth
                label="Export Title"
                value={exportOptions.title}
                onChange={(e) => setExportOptions(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Equipment Layout Export"
              />
            </Stack>
          </Box>

          {/* PDF Settings */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              PDF Settings
            </Typography>
            
            <Stack spacing={2}>
              {/* Format and Orientation */}
              <Stack direction="row" spacing={2}>
                <FormControl component="fieldset" sx={{ flex: 1 }}>
                  <FormLabel component="legend">Format</FormLabel>
                  <RadioGroup
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  >
                    <FormControlLabel value="a4" control={<Radio />} label="A4" />
                    <FormControlLabel value="letter" control={<Radio />} label="Letter" />
                    <FormControlLabel value="legal" control={<Radio />} label="Legal" />
                  </RadioGroup>
                </FormControl>
                
                <FormControl component="fieldset" sx={{ flex: 1 }}>
                  <FormLabel component="legend">Orientation</FormLabel>
                  <RadioGroup
                    value={exportOptions.orientation}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                  >
                    <FormControlLabel value="landscape" control={<Radio />} label="Landscape" />
                    <FormControlLabel value="portrait" control={<Radio />} label="Portrait" />
                  </RadioGroup>
                </FormControl>
              </Stack>

              {/* Quality Slider */}
              <Box>
                <Typography gutterBottom>
                  Export Quality: {Math.round((exportOptions.quality || 0.95) * 100)}%
                </Typography>
                <Slider
                  value={exportOptions.quality || 0.95}
                  onChange={(_, value) => setExportOptions(prev => ({ ...prev, quality: value as number }))}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  marks={[
                    { value: 0.5, label: '50%' },
                    { value: 0.75, label: '75%' },
                    { value: 1.0, label: '100%' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Higher quality produces larger file sizes but better image clarity
                </Typography>
              </Box>

              {/* Include Metadata */}
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    />
                  }
                  label="Include project metadata (recommended)"
                />
              </FormGroup>
            </Stack>
          </Box>

          {/* Preview Information */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Export Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Format: {(exportOptions.format || 'a4').toUpperCase()} {exportOptions.orientation}
              • Quality: {Math.round((exportOptions.quality || 0.95) * 100)}%
              • Equipment Items: {projectMetadata.itemCount}
              {projectMetadata.calibrationInfo && (
                <>• Calibration: {projectMetadata.calibrationInfo}</>
              )}
            </Typography>
          </Box>

          {/* Status Messages */}
          {error && (
            <Alert severity="error" onClose={clearMessages}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" onClose={clearMessages}>
              {success}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || !exportOptions.projectName.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          sx={{
            minWidth: 120,
            background: loading ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: loading ? undefined : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {loading ? 'Exporting...' : 'Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
