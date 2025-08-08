import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useMapStore } from '../../stores/mapStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { CalibrationService } from '../../services/calibrationService';
import CalibrationDialog from '../calibration/CalibrationDialog';

const MapCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Get state from stores
  const { 
    scale, 
    position, 
    imageUrl,
    isCalibrationMode,
    activeCalibrationLine,
    currentCalibrationLine,
    startCalibrationLine,
    completeCalibrationLine,
    pixelsPerMeter,
    setScale,
    setPosition,
    showGrid,
    gridSpacing,
    gridColor
  } = useMapStore();
  
  const { addItemFromTemplate, items: equipmentItems, selectItem, selectedId, moveItem, updateItemDimensions } = useEquipmentStore();

  // Local state for calibration dialog
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [pendingCalibrationData, setPendingCalibrationData] = useState<{
    endPoint: { x: number; y: number; id: string };
    pixelDistance: number;
  } | null>(null);
  
  // Local state for equipment movement
  const [isDraggingEquipment, setIsDraggingEquipment] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Local state for canvas panning
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartPosition, setPanStartPosition] = useState({ x: 0, y: 0 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle canvas click for calibration
  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      
      if (data.type === 'equipment') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        
        // Convert to image coordinates
        const x = (canvasX - position.x) / scale;
        const y = (canvasY - position.y) / scale;
        
        // Add equipment at drop position
        addItemFromTemplate(data.templateId, x, y, pixelsPerMeter);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  // Check if click is on equipment item
  const getEquipmentAtPoint = (x: number, y: number) => {
    // Check in reverse order (top items first)
    for (let i = equipmentItems.length - 1; i >= 0; i--) {
      const item = equipmentItems[i];
      if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
        return item;
      }
    }
    return null;
  };

  // Helper function to get canvas coordinates from mouse event
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Transform screen coordinates to canvas coordinates (accounting for zoom and pan)
    const canvasX = (screenX - position.x) / scale;
    const canvasY = (screenY - position.y) / scale;
    
    return { x: canvasX, y: canvasY };
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    
    const { x, y } = getCanvasCoordinates(event);
    
    if (isCalibrationMode) {
      // Calibration mode logic
      const point = {
        id: `point-${Date.now()}`,
        x,
        y
      };
      
      if (!currentCalibrationLine?.startPoint) {
        startCalibrationLine(point);
      } else {
        const pixelDistance = CalibrationService.calculatePixelDistance(currentCalibrationLine.startPoint, point);
        setPendingCalibrationData({ endPoint: point, pixelDistance });
        setCalibrationDialogOpen(true);
      }
    } else {
      // Equipment selection logic
      const clickedEquipment = getEquipmentAtPoint(x, y);
      if (clickedEquipment) {
        selectItem(clickedEquipment.id);
      } else {
        selectItem(null); // Deselect if clicking empty space
      }
    }
  };
  
  // Handle calibration distance confirmation
  const handleCalibrationConfirm = (distance: number) => {
    if (!pendingCalibrationData) return;
    
    const endPointWithId = {
      ...pendingCalibrationData.endPoint,
      id: `point-${Date.now()}`
    };
    completeCalibrationLine(endPointWithId, distance);
    
    // Update equipment dimensions with new calibration
    updateItemDimensions(pixelsPerMeter);
    
    setPendingCalibrationData(null);
    setCalibrationDialogOpen(false);
  };
  
  // Handle mouse down for equipment dragging or canvas panning
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    const { x, y } = getCanvasCoordinates(event);
    
    const clickedEquipment = getEquipmentAtPoint(x, y);
    
    if (clickedEquipment) {
      // Equipment dragging
      selectItem(clickedEquipment.id);
      setIsDraggingEquipment(true);
      setDragOffset({
        x: x - clickedEquipment.x,
        y: y - clickedEquipment.y
      });
    } else {
      // Canvas panning (when not clicking on equipment)
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      setPanStartPosition({ x: position.x, y: position.y });
    }
  };
  
  // Handle mouse move for equipment dragging or canvas panning
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingEquipment && selectedId) {
      // Equipment dragging
      const { x, y } = getCanvasCoordinates(event);
      
      // Move the selected equipment
      moveItem(selectedId, x - dragOffset.x, y - dragOffset.y);
    } else if (isPanning) {
      // Canvas panning
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      
      setPosition({
        x: panStartPosition.x + deltaX,
        y: panStartPosition.y + deltaY
      });
    }
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDraggingEquipment(false);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  };
  

  
  // Handle calibration dialog close
  const handleCalibrationDialogClose = () => {
    setPendingCalibrationData(null);
    setCalibrationDialogOpen(false);
  };

  // Function to draw the active calibration line
  const drawActiveCalibrationLine = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!activeCalibrationLine) return;
    
    const line = activeCalibrationLine;
    // Draw line
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(line.startPoint.x, line.startPoint.y);
    ctx.lineTo(line.endPoint.x, line.endPoint.y);
    ctx.stroke();
    
    // Draw endpoints
    ctx.fillStyle = '#00ff00';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(line.startPoint.x, line.startPoint.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(line.endPoint.x, line.endPoint.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw distance label
    const midX = (line.startPoint.x + line.endPoint.x) / 2;
    const midY = (line.startPoint.y + line.endPoint.y) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      CalibrationService.formatDistance(line.realWorldDistance),
      midX,
      midY - 10
    );
  }, [activeCalibrationLine]);
  
  // Function to draw grid overlay
  const drawGrid = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid || pixelsPerMeter <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calculate grid spacing in pixels
    const gridSpacingPixels = gridSpacing * pixelsPerMeter * scale;
    
    // Only draw grid if spacing is reasonable (not too dense)
    if (gridSpacingPixels < 10) return;
    
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.3;
    
    // Calculate grid bounds
    const startX = Math.floor(-position.x / gridSpacingPixels) * gridSpacingPixels + position.x;
    const startY = Math.floor(-position.y / gridSpacingPixels) * gridSpacingPixels + position.y;
    
    // Draw vertical lines
    for (let x = startX; x < canvas.width + gridSpacingPixels; x += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y < canvas.height + gridSpacingPixels; y += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [showGrid, pixelsPerMeter, scale, position, gridSpacing, gridColor]);
  
  // Function to draw equipment items
  const drawEquipmentItems = React.useCallback((ctx: CanvasRenderingContext2D) => {
    equipmentItems.forEach((item) => {
      // Draw equipment rectangle
      ctx.fillStyle = item.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(item.x, item.y, item.width, item.height);
      
      // Draw border (highlight if selected)
      ctx.globalAlpha = 1;
      ctx.strokeStyle = selectedId === item.id ? '#ffffff' : item.color;
      ctx.lineWidth = selectedId === item.id ? 3 : 2;
      ctx.setLineDash(selectedId === item.id ? [5, 5] : []);
      ctx.strokeRect(item.x, item.y, item.width, item.height);
      
      // Draw equipment name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        item.name,
        item.x + item.width / 2,
        item.y + item.height / 2
      );
    });
  }, [equipmentItems, selectedId]);
  

  
  // Function to draw current calibration line being drawn
  const drawCurrentCalibrationLine = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!currentCalibrationLine?.startPoint) return;
    
    // Draw start point
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(currentCalibrationLine.startPoint.x, currentCalibrationLine.startPoint.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw label for start point
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Start Point',
      currentCalibrationLine.startPoint.x,
      currentCalibrationLine.startPoint.y - 15
    );
  }, [currentCalibrationLine]);

  // Store loaded image to prevent reloading
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  
  // Load image when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      setLoadedImage(null);
    };
    img.src = imageUrl;
  }, [imageUrl]);
  
  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for transformations
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    
    // Draw background image if loaded
    if (loadedImage) {
      ctx.drawImage(loadedImage, 0, 0);
    }
    
    // Draw calibration elements
    drawActiveCalibrationLine(ctx);
    drawCurrentCalibrationLine(ctx);
    
    // Draw equipment items
    drawEquipmentItems(ctx);
    
    ctx.restore();
    
    // Draw grid overlay (not transformed)
    drawGrid(ctx);
  }, [loadedImage, scale, position, drawGrid, drawActiveCalibrationLine, drawCurrentCalibrationLine, drawEquipmentItems]);
  
  // Add wheel event listener with proper options to prevent passive listener errors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      
      // Get mouse position relative to canvas (screen coordinates)
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Calculate zoom factor (smaller increments for smoother zoom)
      const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
      const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));
      
      // Calculate new position to zoom towards mouse cursor
      // Convert mouse position to canvas coordinates before zoom
      const canvasMouseX = (mouseX - position.x) / scale;
      const canvasMouseY = (mouseY - position.y) / scale;
      
      // Calculate new position after zoom
      const newX = mouseX - canvasMouseX * newScale;
      const newY = mouseY - canvasMouseY * newScale;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
    };
    
    // Add event listener with passive: false to allow preventDefault
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [scale, position, setScale, setPosition]);
  


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
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: isCalibrationMode ? 'crosshair' : 
                  isDraggingEquipment ? 'grabbing' : 
                  isPanning ? 'grabbing' : 'default'
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}

        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
      
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
          <Typography variant="h6" sx={{ mb: 1 }}>No Image Loaded</Typography>
          <Typography variant="body2">
            Use the "Import Image" button above to load a satellite image
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
            Note: Canvas functionality is temporarily simplified. Konva.js integration will be restored once build issues are resolved.
          </Typography>
        </Box>
      )}
      
      {/* Show loaded image info */}
      {imageUrl && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            p: 1,
            borderRadius: 1,
            fontSize: '0.75rem'
          }}
        >
          Image loaded • Scale: {Math.round(scale * 100)}%
          {activeCalibrationLine && (
            <Box sx={{ mt: 0.5 }}>
              Calibrated: {CalibrationService.formatDistance(activeCalibrationLine.realWorldDistance)}
            </Box>
          )}
          <Box sx={{ mt: 0.5, fontSize: '0.75rem', opacity: 0.7 }}>
            Zoom: {Math.round(scale * 100)}% • Grid: {showGrid ? 'ON' : 'OFF'}
          </Box>
        </Box>
      )}
      
      {/* Calibration mode indicator */}
      {isCalibrationMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(255, 193, 7, 0.9)',
            color: 'black',
            p: 1,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          📏 Calibration Mode: {currentCalibrationLine?.startPoint ? 'Click to set end point' : 'Click to set start point'}
        </Box>
      )}
      
      {/* Calibration Dialog */}
      <CalibrationDialog
        open={calibrationDialogOpen}
        onClose={handleCalibrationDialogClose}
        onConfirm={handleCalibrationConfirm}
        pixelDistance={pendingCalibrationData?.pixelDistance || 0}
      />
    </Box>
  );
};

export default MapCanvas;
