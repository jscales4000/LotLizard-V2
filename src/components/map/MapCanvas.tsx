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
    imageLocked,
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
  
  const { 
    addItemFromTemplate, 
    items: equipmentItems, 
    selectItem, 
    selectMultiple,
    selectAll,
    deselectAll,
    moveItem,
    moveSelectedItems, 
    removeSelectedItems,
    updateItemDimensions,
    copySelectedItems,
    pasteItems,
    isSelected,
    getSelectedItems
  } = useEquipmentStore();

  // Local state
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [pendingCalibrationData, setPendingCalibrationData] = useState<{
    endPoint: { x: number; y: number; id: string };
    pixelDistance: number;
  } | null>(null);
  const [isDraggingEquipment, setIsDraggingEquipment] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartPosition, setPanStartPosition] = useState({ x: 0, y: 0 });
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

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

  // Helper functions
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    const canvasX = (screenX - position.x) / scale;
    const canvasY = (screenY - position.y) / scale;
    
    return { x: canvasX, y: canvasY };
  };

  const getEquipmentAtPoint = (x: number, y: number) => {
    for (let i = equipmentItems.length - 1; i >= 0; i--) {
      const item = equipmentItems[i];
      if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
        return item;
      }
    }
    return null;
  };

  // Event handlers
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);
    
    if (isCalibrationMode) {
      const point = { id: `point-${Date.now()}`, x, y };
      
      if (!currentCalibrationLine?.startPoint) {
        startCalibrationLine(point);
      } else {
        const pixelDistance = CalibrationService.calculatePixelDistance(currentCalibrationLine.startPoint, point);
        setPendingCalibrationData({ endPoint: point, pixelDistance });
        setCalibrationDialogOpen(true);
      }
    } else {
      const clickedEquipment = getEquipmentAtPoint(x, y);
      
      if (clickedEquipment) {
        // If Ctrl key is pressed, add/remove from selection
        if (event.ctrlKey) {
          selectMultiple(clickedEquipment.id, true);
        } else {
          // Otherwise replace selection
          selectItem(clickedEquipment.id);
        }
      } else {
        // Always deselect when clicking on empty canvas area
        // This is important for UX, especially after using Ctrl+A
        deselectAll();
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    const { x, y } = getCanvasCoordinates(event);
    const clickedEquipment = getEquipmentAtPoint(x, y);
    
    if (clickedEquipment) {
      setIsDraggingEquipment(true);
      
      // If Ctrl is pressed, add to selection without changing existing selection
      if (event.ctrlKey) {
        selectMultiple(clickedEquipment.id, true);
      } else if (!isSelected(clickedEquipment.id)) {
        // If not already selected and not using Ctrl, select only this one
        selectItem(clickedEquipment.id);
      }
      
      setDragOffset({
        x: x - clickedEquipment.x,
        y: y - clickedEquipment.y
      });
    } else {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      setPanStartPosition({ x: position.x, y: position.y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    if (isDraggingEquipment) {
      const { x, y } = getCanvasCoordinates(event);
      const selectedItems = getSelectedItems();
      
      // Only move the item directly being dragged
      if (selectedItems.length === 1) {
        moveItem(selectedItems[0].id, x - dragOffset.x, y - dragOffset.y);
      } else if (selectedItems.length > 1) {
        // Move all selected items as a group
        const deltaX = x - (selectedItems[0].x + dragOffset.x);
        const deltaY = y - (selectedItems[0].y + dragOffset.y);
        moveSelectedItems(deltaX, deltaY);
      }
    } else if (isPanning) {
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      
      setPosition({
        x: panStartPosition.x + deltaX,
        y: panStartPosition.y + deltaY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingEquipment(false);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  };

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
        
        const x = (canvasX - position.x) / scale;
        const y = (canvasY - position.y) / scale;
        
        addItemFromTemplate(data.templateId, x, y, pixelsPerMeter);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  const handleCalibrationConfirm = (distance: number) => {
    if (!pendingCalibrationData || !currentCalibrationLine?.startPoint) return;
    
    const endPointWithId = {
      ...pendingCalibrationData.endPoint,
      id: `point-${Date.now()}`
    };
    
    // Calculate the new pixelsPerMeter BEFORE updating equipment
    const pixelDistance = CalibrationService.calculatePixelDistance(
      currentCalibrationLine.startPoint, 
      endPointWithId
    );
    const newPixelsPerMeter = pixelDistance / distance;
    
    // Complete the calibration line
    completeCalibrationLine(endPointWithId, distance);
    
    // Update equipment dimensions with the NEW pixelsPerMeter value
    updateItemDimensions(newPixelsPerMeter);
    
    setPendingCalibrationData(null);
    setCalibrationDialogOpen(false);
  };

  const handleCalibrationDialogClose = () => {
    setPendingCalibrationData(null);
    setCalibrationDialogOpen(false);
  };

  // Drawing functions
  const drawActiveCalibrationLine = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!activeCalibrationLine) return;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(activeCalibrationLine.startPoint.x, activeCalibrationLine.startPoint.y);
    ctx.lineTo(activeCalibrationLine.endPoint.x, activeCalibrationLine.endPoint.y);
    ctx.stroke();
    
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(activeCalibrationLine.startPoint.x, activeCalibrationLine.startPoint.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(activeCalibrationLine.endPoint.x, activeCalibrationLine.endPoint.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    const midX = (activeCalibrationLine.startPoint.x + activeCalibrationLine.endPoint.x) / 2;
    const midY = (activeCalibrationLine.startPoint.y + activeCalibrationLine.endPoint.y) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      CalibrationService.formatDistance(activeCalibrationLine.realWorldDistance),
      midX,
      midY - 10
    );
  }, [activeCalibrationLine]);

  const drawCurrentCalibrationLine = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!currentCalibrationLine?.startPoint) return;
    
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(currentCalibrationLine.startPoint.x, currentCalibrationLine.startPoint.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Start Point',
      currentCalibrationLine.startPoint.x,
      currentCalibrationLine.startPoint.y - 15
    );
  }, [currentCalibrationLine]);

  const drawEquipmentItems = React.useCallback((ctx: CanvasRenderingContext2D) => {
    equipmentItems.forEach(item => {
      const selected = isSelected(item.id);
      ctx.fillStyle = selected ? '#ffff00' : item.color;
      ctx.strokeStyle = selected ? '#ff0000' : '#000000';
      ctx.lineWidth = selected ? 2 : 1;
      
      ctx.beginPath();
      ctx.rect(item.x, item.y, item.width, item.height);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        item.name,
        item.x + item.width / 2,
        item.y + item.height / 2
      );
    });
  }, [equipmentItems, isSelected]);

  const drawGrid = React.useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid || pixelsPerMeter <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    const gridSpacingPixels = gridSpacing * pixelsPerMeter * scale;
    
    if (gridSpacingPixels < 10) {
      ctx.restore();
      return;
    }
    
    const offsetX = position.x % gridSpacingPixels;
    const offsetY = position.y % gridSpacingPixels;
    
    for (let x = offsetX; x < canvas.width + gridSpacingPixels; x += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = offsetY; y < canvas.height + gridSpacingPixels; y += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [showGrid, pixelsPerMeter, scale, position, gridSpacing, gridColor]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    
    if (loadedImage) {
      ctx.drawImage(loadedImage, 0, 0);
    }
    
    drawActiveCalibrationLine(ctx);
    drawCurrentCalibrationLine(ctx);
    drawEquipmentItems(ctx);
    
    ctx.restore();
    drawGrid(ctx);
  }, [loadedImage, scale, position, drawGrid, drawActiveCalibrationLine, drawCurrentCalibrationLine, drawEquipmentItems]);

  // Add wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      
      // Prevent zooming if image is locked
      if (imageLocked && imageUrl) {
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
      const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));
      
      const canvasMouseX = (mouseX - position.x) / scale;
      const canvasMouseY = (mouseY - position.y) / scale;
      
      const newX = mouseX - canvasMouseX * newScale;
      const newY = mouseY - canvasMouseY * newScale;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
    };
    
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [scale, position, setScale, setPosition, imageLocked, imageUrl]);

  // Add keyboard handler for equipment movement and shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (imageLocked) return;
      
      // Escape key to deselect
      if (event.key === 'Escape') {
        deselectAll();
        return;
      }
      
      // Delete key to remove selected equipment
      if (event.key === 'Delete' || event.key === 'Backspace') {
        removeSelectedItems();
        return;
      }
      
      // Ctrl+A to select all
      if (event.key.toLowerCase() === 'a' && event.ctrlKey) {
        event.preventDefault();
        selectAll();
        return;
      }
      
      // Ctrl+C to copy
      if (event.key.toLowerCase() === 'c' && event.ctrlKey) {
        event.preventDefault();
        copySelectedItems();
        return;
      }
      
      // Ctrl+V to paste
      if (event.key.toLowerCase() === 'v' && event.ctrlKey) {
        event.preventDefault();
        
        // Calculate center of view as paste position
        const canvas = canvasRef.current;
        if (canvas) {
          const centerX = (canvas.width / 2 - position.x) / scale;
          const centerY = (canvas.height / 2 - position.y) / scale;
          pasteItems(centerX, centerY);
        } else {
          pasteItems(); // Use default position
        }
        return;
      }
      
      // Ctrl+Plus/Equal to zoom in
      if ((event.key === '+' || event.key === '=') && event.ctrlKey) {
        event.preventDefault();
        // Use current scale and calculate new scale directly
        const newScale = Math.min(5, scale * 1.1); // Zoom in 10%, max 500%
        setScale(newScale);
        return;
      }
      
      // Ctrl+Minus to zoom out
      if (event.key === '-' && event.ctrlKey) {
        event.preventDefault();
        // Use current scale and calculate new scale directly
        const newScale = Math.max(0.1, scale / 1.1); // Zoom out 10%, min 10%
        setScale(newScale);
        return;
      }
      
      // Arrow keys for fine movement of selected equipment
      const selectedItems = getSelectedItems();
      if (selectedItems.length > 0) {
        const moveDistance = event.shiftKey ? 10 : 1; // Fine/coarse adjustment
        
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            moveSelectedItems(-moveDistance, 0);
            break;
          case 'ArrowRight':
            event.preventDefault();
            moveSelectedItems(moveDistance, 0);
            break;
          case 'ArrowUp':
            event.preventDefault();
            moveSelectedItems(0, -moveDistance);
            break;
          case 'ArrowDown':
            event.preventDefault();
            moveSelectedItems(0, moveDistance);
            break;
        }
      }
    };
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [equipmentItems, imageLocked, position, scale, setScale, moveSelectedItems, selectItem, deselectAll, selectAll, removeSelectedItems, copySelectedItems, pasteItems, getSelectedItems]);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#121212'
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
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
        </Box>
      )}
      
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
          {imageLocked && (
            <Box sx={{ mt: 0.5, color: 'warning.main' }}>
              🔒 Image Locked
            </Box>
          )}
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
