import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { useMapStore } from '../../stores/mapStore';
import { Box } from '@mui/material';
import { useEquipmentStore } from '../../stores/equipmentStore';
import EquipmentItem from '../equipment/EquipmentItem';
import CalibrationOverlay from '../calibration/CalibrationOverlay';

const MapCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get state from stores
  const { 
    scale, 
    position, 
    imageUrl, 
    isCalibrationMode,
    setPosition 
  } = useMapStore();
  
  const { 
    items: equipmentItems,
    selectedId,
    selectItem
  } = useEquipmentStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      // Update stage size if needed
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle background image loading
  const [backgroundImage, setBackgroundImage] = React.useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    if (!imageUrl) return;
    
    const image = new window.Image();
    image.src = imageUrl;
    image.onload = () => {
      setBackgroundImage(image);
    };
  }, [imageUrl]);
  
  // Handle stage drag
  const handleDragEnd = (e: any) => {
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  // Handle click on empty area of canvas
  const handleStageClick = (e: any) => {
    if (e.target === e.currentTarget) {
      selectItem(null); // Deselect any selected equipment
    }
  };

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#121212' // Dark background for the canvas
      }}
    >
      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth || window.innerWidth}
        height={containerRef.current?.clientHeight || window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={!isCalibrationMode}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Background image if available */}
          {backgroundImage && (
            <Image
              image={backgroundImage}
              width={backgroundImage.width}
              height={backgroundImage.height}
            />
          )}
          
          {/* Equipment items */}
          {equipmentItems.map((item) => (
            <EquipmentItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
            />
          ))}
        </Layer>
        
        {/* Calibration overlay when in calibration mode */}
        {isCalibrationMode && <CalibrationOverlay />}
      </Stage>
      
      {/* Display a message when no image is loaded */}
      {!imageUrl && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'text.secondary',
            textAlign: 'center',
            p: 2
          }}
        >
          <Box sx={{ fontSize: '4rem', mb: 2 }}>🗺️</Box>
          <Box sx={{ typography: 'h6', mb: 1 }}>No Image Loaded</Box>
          <Box sx={{ typography: 'body2' }}>
            Use the "Import Image" button above to load a satellite image
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MapCanvas;
