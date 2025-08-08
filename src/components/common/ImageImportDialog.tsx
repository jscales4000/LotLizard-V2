import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { ImageService, ImageData } from '../../services/imageService';
import { useMapStore } from '../../stores/mapStore';

interface ImageImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ImageImportDialog: React.FC<ImageImportDialogProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setImageUrl } = useMapStore();

  const handleFileSelect = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      // Validate the file first
      const validation = ImageService.validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setLoading(false);
        return;
      }

      // Import the image
      const imageData = await ImageService.importImage(file);
      setSelectedImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleImport = () => {
    if (selectedImage) {
      setImageUrl(selectedImage.url);
      onClose();
      // Reset state
      setSelectedImage(null);
      setError(null);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setSelectedImage(null);
    setError(null);
    setLoading(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ImageIcon sx={{ mr: 1 }} />
          Import Satellite Image
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!selectedImage ? (
          <Box>
            {/* File drop zone */}
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
                backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop your satellite image here
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports JPEG, PNG, GIF, WebP (max 50MB)
              </Typography>
            </Paper>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            {/* Loading indicator */}
            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Processing image...
                </Typography>
              </Box>
            )}

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            {/* Image preview */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Image Preview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flexShrink: 0 }}>
                  <img
                    src={selectedImage.url}
                    alt="Preview"
                    style={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {selectedImage.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Dimensions:</strong> {selectedImage.width} × {selectedImage.height} pixels
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>File Size:</strong> {ImageService.formatFileSize(selectedImage.size)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This image will be used as the background for your carnival lot planning.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {selectedImage && (
          <Button 
            onClick={handleImport} 
            variant="contained" 
            startIcon={<ImageIcon />}
          >
            Import Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImageImportDialog;
