import React, { useState, useRef, useEffect } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import { useMapStore } from '../../stores/mapStore';
import { GoogleMapsService, GoogleMapsLocation, GoogleMapsOptions } from '../../services/googleMapsService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLocation, setMapLocation] = useState<GoogleMapsLocation>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
    zoom: 18
  });
  const [mapOptions, setMapOptions] = useState<Partial<GoogleMapsOptions>>({
    mapType: 'satellite',
    width: 600,
    height: 400,
    scale: 2
  });
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setImageUrl, imageLocked, setImageLocked, setPixelsPerMeter } = useMapStore();
  
  // Initialize Google Maps API with the API key
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      GoogleMapsService.init(apiKey);
    }
  }, []);

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
    if (tabValue === 0) {
      // File upload tab
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
    } else {
      // Google Maps tab
      if (!mapUrl) return;
      
      setIsUploading(true);
      try {
        // Fetch the map image and calculate pixels per meter
        const { blob, pixelsPerMeter } = await GoogleMapsService.fetchStaticMapImage(
          mapUrl,
          mapLocation.lat,
          mapLocation.zoom
        );
        
        // Convert blob to data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setImageUrl(dataUrl);
          setPixelsPerMeter(pixelsPerMeter);
          handleClose();
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        setError('Failed to import map image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Verify API key is loaded
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      console.log('API Key available:', !!apiKey); // Don't log the actual key
      
      const location = await GoogleMapsService.geocodeAddress(searchQuery);
      if (location) {
        setMapLocation(location);
        updateMapPreview(location);
        console.log('Location found:', location);
      } else {
        console.warn('No location returned but no error thrown');
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(`Error finding location: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  const updateMapPreview = (location = mapLocation) => {
    const url = GoogleMapsService.getStaticMapUrl(location, mapOptions);
    setMapUrl(url);
  };
  
  const handleMapTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMapType = event.target.checked ? 'hybrid' : 'satellite';
    const newOptions = { ...mapOptions, mapType: newMapType as 'satellite' | 'roadmap' | 'terrain' | 'hybrid' };
    setMapOptions(newOptions);
    updateMapPreview();
  };
  
  const handleZoomChange = (delta: number) => {
    const newZoom = Math.max(1, Math.min(20, mapLocation.zoom + delta));
    const newLocation = { ...mapLocation, zoom: newZoom };
    setMapLocation(newLocation);
    updateMapPreview(newLocation);
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
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Import Satellite Imagery
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Search for a location and import satellite imagery from Google Maps
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <Box
                        component="input"
                        sx={{
                          flex: 1,
                          p: '10px 14px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        placeholder="Enter an address or location"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <IconButton 
                        onClick={handleSearch} 
                        disabled={isSearching}
                        sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                      >
                        {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddLocationIcon />}
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    Search
                  </Button>
                </Box>

                <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={mapOptions.mapType === 'hybrid'}
                          onChange={handleMapTypeChange}
                        />
                      }
                      label="Show roads and labels"
                    />
                    <Box>
                      <IconButton onClick={() => handleZoomChange(-1)} size="small">
                        <Box component="span" sx={{ fontSize: '24px' }}>−</Box>
                      </IconButton>
                      <Typography component="span" sx={{ mx: 1 }}>
                        Zoom: {mapLocation.zoom}
                      </Typography>
                      <IconButton onClick={() => handleZoomChange(1)} size="small">
                        <Box component="span" sx={{ fontSize: '24px' }}>+</Box>
                      </IconButton>
                    </Box>
                  </Box>

                  {mapUrl ? (
                    <Box 
                      component="img" 
                      src={mapUrl} 
                      alt="Map Preview"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '350px',
                        objectFit: 'contain',
                        borderRadius: 1,
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: '250px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }}
                    >
                      <Typography color="text.secondary">
                        Search for a location to display the map
                      </Typography>
                    </Box>
                  )}
                  
                  {mapLocation.address && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {mapLocation.address}
                    </Typography>
                  )}
                </Paper>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImport}
                  disabled={!mapUrl || isUploading}
                  startIcon={isUploading ? <CircularProgress size={20} /> : <MapIcon />}
                  fullWidth
                >
                  {isUploading ? 'Importing...' : 'Import Satellite Image'}
                </Button>
              </Box>
            </TabPanel>
          </Box>
        </Box>
    </Box>
  );
};

export default ImageImportDrawer;
