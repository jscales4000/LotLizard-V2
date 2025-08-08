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
    pixelsPerMeter
  } = useMapStore();
  
  const { addItemFromTemplate, items: equipmentItems, selectItem, selectedId, moveItem } = useEquipmentStore();

  // Local state for calibration dialog
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [pendingCalibrationData, setPendingCalibrationData] = useState<{
    endPoint: { x: number; y: number; id: string };
    pixelDistance: number;
  } | null>(null);
  
  // Local state for equipment movement
  const [isDraggingEquipment, setIsDraggingEquipment] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Get the actual canvas size vs display size ratio
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Calculate the click position relative to the canvas
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    // Convert to image coordinates accounting for zoom and pan
    const x = (canvasX - position.x) / scale;
    const y = (canvasY - position.y) / scale;
    
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
    setPendingCalibrationData(null);
    setCalibrationDialogOpen(false);
  };
  
  // Handle mouse down for equipment dragging
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    const x = (canvasX - position.x) / scale;
    const y = (canvasY - position.y) / scale;
    
    const clickedEquipment = getEquipmentAtPoint(x, y);
    if (clickedEquipment) {
      selectItem(clickedEquipment.id);
      setIsDraggingEquipment(true);
      setDragOffset({
        x: x - clickedEquipment.x,
        y: y - clickedEquipment.y
      });
    }
  };
  
  // Handle mouse move for equipment dragging
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingEquipment || !selectedId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    const x = (canvasX - position.x) / scale;
    const y = (canvasY - position.y) / scale;
    
    // Move the selected equipment
    moveItem(selectedId, x - dragOffset.x, y - dragOffset.y);
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDraggingEquipment(false);
    setDragOffset({ x: 0, y: 0 });
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

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations for zoom and pan
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    
    // Draw background image if available
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        // Draw active calibration line
        drawActiveCalibrationLine(ctx);
        
        // Draw current calibration line being drawn
        drawCurrentCalibrationLine(ctx);
        
        // Draw equipment items
        drawEquipmentItems(ctx);
      };
      img.src = imageUrl;
    } else {
      // Draw active calibration line even without background image
      drawActiveCalibrationLine(ctx);
      drawCurrentCalibrationLine(ctx);
      
      // Draw equipment items
      drawEquipmentItems(ctx);
    }
    
    ctx.restore();
  }, [imageUrl, scale, position, drawActiveCalibrationLine, drawCurrentCalibrationLine, drawEquipmentItems]);
  


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
          cursor: isCalibrationMode ? 'crosshair' : (isDraggingEquipment ? 'grabbing' : 'default')
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
