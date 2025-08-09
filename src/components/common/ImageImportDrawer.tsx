import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import MapIcon from '@mui/icons-material/Map';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useMapStore } from '../../stores/mapStore';

interface ImageImportDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`image-import-tabpanel-${index}`}
      aria-labelledby={`image-import-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `image-import-tab-${index}`,
    'aria-controls': `image-import-tabpanel-${index}`,
  };
}

// Custom styled components for synchronized animations
const SyncedTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    transition: 'none !important',
    transform: 'none !important'
  }
}));

// Custom styled Tab with synced animations
const SyncedTab = styled(Tab)(({ theme }) => ({
  transition: 'none !important'
}));

const ImageImportDrawer: React.FC<ImageImportDrawerProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setImageUrl, imageLocked, setImageLocked } = useMapStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImport = async () => {
    if (!selectedFile || !previewUrl) return;
    
    setIsUploading(true);
    try {
      setImageUrl(previewUrl);
      handleClose();
    } catch (err) {
      setError('Failed to import image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };



  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: '60px',
        width: '400px',
        height: 'calc(100vh - 64px)',
        bgcolor: 'background.paper',
        boxShadow: 3,
        zIndex: 100,  // Lower z-index to ensure proper layering
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ mr: 1 }} />
                Image Import
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={imageLocked}
                  onChange={(e) => setImageLocked(e.target.checked)}
                  icon={<LockOpenIcon />}
                  checkedIcon={<LockIcon />}
                />
              }
              label={imageLocked ? "Image Locked" : "Image Unlocked"}
              sx={{ mb: 1 }}
            />
            
            <SyncedTabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  display: open ? 'block' : 'none',
                },
              }}
            >
              <SyncedTab label="Upload" icon={<CloudUploadIcon />} {...a11yProps(0)} />
              <SyncedTab label="Google Maps" icon={<MapIcon />} {...a11yProps(1)} />
            </SyncedTabs>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Upload Satellite Image
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Import a satellite or aerial image of your carnival lot
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
                    bgcolor: dragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    mb: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleBrowseFiles}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop Image Here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse files
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </Paper>

                {previewUrl && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview:
                    </Typography>
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 1,
                      }}
                    />
                    {selectedFile && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </Typography>
                    )}
                  </Paper>
                )}

                {isUploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Importing image...
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImport}
                  disabled={!selectedFile || isUploading}
                  startIcon={isUploading ? <CircularProgress size={20} /> : <ImageIcon />}
                  fullWidth
                >
                  {isUploading ? 'Importing...' : 'Import Image'}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Google Maps Integration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Import satellite imagery directly from Google Maps
                </Typography>
                <Alert severity="info">
                  Google Maps integration coming soon!
                </Alert>
              </Box>
            </TabPanel>
          </Box>
        </Box>
    </Box>
  );
};

export default ImageImportDrawer;
