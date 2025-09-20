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
    setPosition, 
    imageUrl, 
    isCalibrationMode,
    isPanningMode,
    activeCalibrationLine,
    currentCalibrationLine,
    startCalibrationLine,
    completeCalibrationLine,
    pixelsPerMeter,
    setScale,
    showGrid,
    showCalibrationLine,
    gridSpacing,
    gridColor,
    showEquipmentLabels,
    showClearanceZones
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
    getSelectedItems,
    rotateItem
  } = useEquipmentStore();

  // Local state
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [pendingCalibrationData, setPendingCalibrationData] = useState<{
    endPoint: { x: number; y: number; id: string };
    pixelDistance: number;
  } | null>(null);
  const [isDraggingEquipment, setIsDraggingEquipment] = useState(false);
  const [isRotatingEquipment, setIsRotatingEquipment] = useState(false);
  const [rotationItem, setRotationItem] = useState<string | null>(null);
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
      
      // Transform coordinates to account for rotation
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      
      // Translate point to be relative to item's center
      const relX = x - centerX;
      const relY = y - centerY;
      
      // Rotate the point in the opposite direction of the item's rotation
      const angleRadians = -(item.rotation || 0) * Math.PI / 180;
      const rotatedX = relX * Math.cos(angleRadians) - relY * Math.sin(angleRadians);
      const rotatedY = relX * Math.sin(angleRadians) + relY * Math.cos(angleRadians);
      
      // Check if the rotated point is inside the item based on its shape
      if (item.shape === 'circle') {
        // For circles, check if point is within the radius
        const radius = Math.min(item.width, item.height) / 2;
        const distance = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
        if (distance <= radius) {
          return item;
        }
      } else {
        // For rectangles, check if point is within the bounds
        if (rotatedX >= -item.width / 2 && rotatedX <= item.width / 2 &&
            rotatedY >= -item.height / 2 && rotatedY <= item.height / 2) {
          return item;
        }
      }
    }
    return null;
  };
  
  // Check if a point is on a rotation handle
  const getRotationHandleAtPoint = (x: number, y: number) => {
    for (let i = equipmentItems.length - 1; i >= 0; i--) {
      const item = equipmentItems[i];
      
      // Only selected items have rotation handles
      if (!isSelected(item.id)) continue;
      
      // Calculate rotation handle position
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      
      // Calculate handle position with item rotation applied
      const handleDistance = item.height / 2 + 20; // 20px beyond the top of item
      
      // Convert rotation to radians - adjust by -90 degrees to make 0 point up
      const angleRadians = ((item.rotation || 0) - 90) * Math.PI / 180;
      
      // The rotation handle is positioned at the top of the item, rotated by the item's angle
      const handleX = centerX + Math.cos(angleRadians) * handleDistance;
      const handleY = centerY + Math.sin(angleRadians) * handleDistance;
      
      // Debug logging for rotation handle position (commented out to reduce console noise)
      // console.log('Handle position for item:', item.id, {
      //   centerX, 
      //   centerY, 
      //   handleX, 
      //   handleY, 
      //   rotation: item.rotation, 
      //   angleRadians
      // });
      
      // Check if point is within handle radius (8px)
      const distanceSquared = Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2);
      if (distanceSquared <= 64) { // 8px radius squared = 64
        console.log('Rotation handle detected for item:', item.id, 'at angle:', item.rotation);
        return item.id;
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
          
          // Force canvas redraw after selection change
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Trigger a re-render by clearing and redrawing
              setTimeout(() => {
                if (canvas && ctx) {
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
                }
              }, 0);
            }
          }
        } else {
          // Otherwise replace selection
          selectItem(clickedEquipment.id);
          
          // Force canvas redraw after selection
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Trigger a re-render by clearing and redrawing
              setTimeout(() => {
                if (canvas && ctx) {
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
                }
              }, 0);
            }
          }
        }
      } else {
        // Always deselect when clicking on empty canvas area
        // This is important for UX, especially after using Ctrl+A
        deselectAll();
        
        // Force canvas redraw after deselection
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Trigger a re-render by clearing and redrawing
            setTimeout(() => {
              if (canvas && ctx) {
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
              }
            }, 0);
          }
        }
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    const { x, y } = getCanvasCoordinates(event);
    
    // Enable panning if either:
    // 1. User clicked the pan tool button (isPanningMode is true)
    // 2. User is using middle mouse button
    // 3. User is using Alt+Left click
    if (isPanningMode || event.button === 1 || (event.button === 0 && event.altKey)) {
      // Set cursor to grabbing
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }
      
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      setPanStartPosition({ x: position.x, y: position.y });
      return;
    }
    
    // Check if clicked on a rotation handle first
    const rotationHandleId = getRotationHandleAtPoint(x, y);
    if (rotationHandleId) {
      setIsRotatingEquipment(true);
      setRotationItem(rotationHandleId);
      return;
    }
    
    // Check if clicked on an equipment item
    const clickedItem = getEquipmentAtPoint(x, y);
    
    if (clickedItem) {
      // If shift key is pressed, toggle selection
      if (event.shiftKey) {
        selectMultiple(clickedItem.id, true);
      } else {
        // If the clicked item is not already selected, select it
        // If it is already selected, prepare for dragging
        if (!isSelected(clickedItem.id)) {
          selectItem(clickedItem.id);
        }
      }
      
      setIsDraggingEquipment(true);
      setDragOffset({
        x: x - clickedItem.x,
        y: y - clickedItem.y
      });
    } else {
      // If clicked empty space, deselect all
      deselectAll();
      
      // Force canvas redraw after deselection
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Trigger a re-render by clearing and redrawing
          setTimeout(() => {
            if (canvas && ctx) {
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
            }
          }, 0);
        }
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) {
      // Handle calibration point creation here...
      // We're already handling this with click events, so we can leave this empty
    } else {
      if (isPanning) {
        setIsPanning(false);
        // Reset cursor when panning ends
        const canvas = canvasRef.current;
        if (canvas) {
          if (isPanningMode) {
            canvas.style.cursor = 'grab'; // Show grab cursor when in pan mode
          } else {
            canvas.style.cursor = 'default'; // Reset to default when not in pan mode
          }
        }
      }
      if (isDraggingEquipment) {
        setIsDraggingEquipment(false);
      }
      if (isRotatingEquipment) {
        setIsRotatingEquipment(false);
        setRotationItem(null);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrationMode) return;
    
    const { x, y } = getCanvasCoordinates(event);
    
    // Update cursor for pan mode when not actively panning
    if (isPanningMode && !isPanning) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'grab'; // Show grab cursor when in pan mode
      }
    }
    
    // Handle hover popup logic when equipment labels are hidden
    if (!showEquipmentLabels && !isPanning && !isDraggingEquipment && !isRotatingEquipment) {
      // Clear any existing hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      
      const hoveredEquipment = getEquipmentAtPoint(x, y);
      
      if (hoveredEquipment) {
        // Set position where the popup should appear (in screen coordinates)
        setHoverPosition({
          x: event.clientX,
          y: event.clientY - 30 // Show popup above cursor
        });
        
        // Set a timeout to show the popup after 1 second
        const timeout = setTimeout(() => {
          setHoverItem(hoveredEquipment.name);
        }, 1000);
        
        setHoverTimeout(timeout);
      } else {
        setHoverItem(null);
      }
    } else {
      // Clear hover state when labels are shown or during interactions
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setHoverItem(null);
    }
    
    // Change cursor based on what's under it
    const rotationHandleUnderCursor = getRotationHandleAtPoint(x, y);
    if (rotationHandleUnderCursor && !isPanning && !isDraggingEquipment && !isRotatingEquipment) {
      // Set cursor to rotation cursor
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'grab';
      }
    } else if (!isPanning && !isDraggingEquipment && !isRotatingEquipment) {
      // Set appropriate cursor based on mode
      const canvas = canvasRef.current;
      if (canvas) {
        if (isPanningMode) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    }
    
    if (isPanning) {
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      setPosition({
        x: panStartPosition.x + deltaX,
        y: panStartPosition.y + deltaY
      });
      return;
    }
    
    if (isRotatingEquipment && rotationItem) {
      // Find the equipment item being rotated
      const item = equipmentItems.find(item => item.id === rotationItem);
      if (item) {
        // Calculate center of the item
        const centerX = item.x + item.width / 2;
        const centerY = item.y + item.height / 2;
        
        // Calculate angle between center and cursor position
        // Use correct atan2 order: atan2(y2-y1, x2-x1)
        const angleRadians = Math.atan2(y - centerY, x - centerX);
        // Convert to degrees and adjust to make 0 degrees point up
        let angleDegrees = (angleRadians * 180 / Math.PI + 90) % 360;
        
        // Convert to 0-360 range
        if (angleDegrees < 0) {
          angleDegrees += 360;
        }
        
        console.log('Rotation calculation:', {
          itemId: item.id,
          centerX,
          centerY,
          mouseX: x,
          mouseY: y,
          angleRadians,
          angleDegrees
        });
        
        // Apply snapping to common angles (0°, 45°, 90°, etc.)
        const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        const snapThreshold = 10; // Degrees
        
        for (const snapAngle of snapAngles) {
          if (Math.abs(angleDegrees - snapAngle) < snapThreshold) {
            angleDegrees = snapAngle;
            break;
          }
        }
        
        // Update rotation in the store
        rotateItem(item.id, angleDegrees);
        
        // Update cursor
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor = 'grabbing';
        }
      }
      return;
    }
    
    if (isDraggingEquipment) {
      const selectedItems = getSelectedItems();
      if (selectedItems.length === 1) {
        // Single item movement
        moveItem(selectedItems[0].id, x - dragOffset.x, y - dragOffset.y);
      } else if (selectedItems.length > 1) {
        // Calculate movement delta based on first selected item
        const firstItem = selectedItems[0];
        const deltaX = x - dragOffset.x - firstItem.x;
        const deltaY = y - dragOffset.y - firstItem.y;
        moveSelectedItems(deltaX, deltaY);
      }
    }
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
    if (!activeCalibrationLine || !showCalibrationLine) return;
    
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
  }, [activeCalibrationLine, showCalibrationLine]);

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

  // For hover popup functionality
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{x: number, y: number} | null>(null);
  
  const drawEquipmentItems = React.useCallback((ctx: CanvasRenderingContext2D) => {
    // Only draw visible items (visible is true by default if not set)
    equipmentItems.filter(item => item.visible !== false).forEach(item => {
      const selected = isSelected(item.id);
      ctx.fillStyle = selected ? '#ffff00' : item.color;
      ctx.strokeStyle = selected ? '#ff0000' : '#000000';
      ctx.lineWidth = selected ? 2 : 1;
      
      // Save the canvas state before applying transformations
      ctx.save();
      
      // Move to the center of where the rectangle will be
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      ctx.translate(centerX, centerY);
      
      // Apply rotation if any
      if (item.rotation) {
        ctx.rotate(item.rotation * Math.PI / 180); // Convert degrees to radians
      }
      
      // Draw clearance zone first (if any clearance is defined and clearance zones are enabled)
      const hasRectClearance = (item.clearanceLeft || 0) > 0 || (item.clearanceRight || 0) > 0 || 
                               (item.clearanceTop || 0) > 0 || (item.clearanceBottom || 0) > 0;
      const hasCircleClearance = (item.clearanceRadius || 0) > 0;
      
      if (showClearanceZones && ((item.shape === 'rectangle' && hasRectClearance) || (item.shape === 'circle' && hasCircleClearance))) {
        // Get the scaling factor from the equipment item itself
        // The clearance values are already in feet and need to be scaled to match the item's pixel dimensions
        const pixelScale = item.width / (item.realWorldWidth || 30); // Use item's own scale factor
        
        ctx.globalAlpha = 0.5; // 50% transparency for clearance zone
        ctx.fillStyle = item.color;
        ctx.strokeStyle = selected ? '#ff0000' : '#666666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // Dashed line for clearance zone
        
        ctx.beginPath();
        if (item.shape === 'circle' && hasCircleClearance) {
          // For circles, draw clearance as a larger circle
          const baseRadius = Math.min(item.width, item.height) / 2;
          const clearanceRadius = baseRadius + (item.clearanceRadius || 0) * pixelScale;
          ctx.arc(0, 0, clearanceRadius, 0, Math.PI * 2);
        } else if (item.shape === 'rectangle' && hasRectClearance) {
          // For rectangles, draw clearance as a larger rectangle
          const clearanceLeft = (item.clearanceLeft || 0) * pixelScale;
          const clearanceRight = (item.clearanceRight || 0) * pixelScale;
          const clearanceTop = (item.clearanceTop || 0) * pixelScale;
          const clearanceBottom = (item.clearanceBottom || 0) * pixelScale;
          
          const clearanceWidth = item.width + clearanceLeft + clearanceRight;
          const clearanceHeight = item.height + clearanceTop + clearanceBottom;
          const clearanceX = -item.width / 2 - clearanceLeft;
          const clearanceY = -item.height / 2 - clearanceTop;
          
          ctx.rect(clearanceX, clearanceY, clearanceWidth, clearanceHeight);
        }
        
        ctx.fill();
        ctx.stroke();
        
        // Reset canvas properties for main shape
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([]); // Reset to solid line
      }
      
      // Draw the main equipment shape
      ctx.fillStyle = selected ? '#ffff00' : item.color;
      ctx.strokeStyle = selected ? '#ff0000' : '#000000';
      ctx.lineWidth = selected ? 2 : 1;
      
      ctx.beginPath();
      if (item.shape === 'circle') {
        // For circles, use the smaller dimension as the radius to fit within the bounding box
        const radius = Math.min(item.width, item.height) / 2;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
      } else {
        // Default to rectangle for 'rectangle' shape or undefined shape
        ctx.rect(-item.width / 2, -item.height / 2, item.width, item.height);
      }
      ctx.fill();
      ctx.stroke();
      
      // Draw the item name if labels are enabled
      if (showEquipmentLabels) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name, 0, 0);
      }
      
      // Draw rotation handle if selected
      if (selected) {
        // Draw a line from center to top-middle to serve as a handle connector
        ctx.beginPath();
        ctx.strokeStyle = '#4CAF50'; // Green
        ctx.lineWidth = 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -item.height / 2 - 20); // Extend 20px beyond the item
        ctx.stroke();
        
        // Draw the rotation handle
        ctx.beginPath();
        ctx.fillStyle = '#4CAF50'; // Green
        ctx.arc(0, -item.height / 2 - 20, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Add rotation angle text if available
        if (item.rotation !== undefined && item.rotation !== 0) {
          ctx.fillStyle = '#FFFFFF'; // White text
          ctx.strokeStyle = '#000000'; // Black outline
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 3;
          const angleText = `${Math.round(item.rotation)}°`;
          ctx.strokeText(angleText, 0, -item.height / 2 - 40);
          ctx.fillText(angleText, 0, -item.height / 2 - 40);
        }
      }
      
      // Restore the canvas state
      ctx.restore();
    });
  }, [equipmentItems, isSelected, showEquipmentLabels, showClearanceZones]);

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
  });

  // Add wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Check mode and handle accordingly
      if (!isPanningMode) {
        // 'Select & Move' mode
        const selectedItems = getSelectedItems();
        if (selectedItems.length > 0) {
          // Get the first selected item for rotation
          const itemToRotate = selectedItems[0];
          
          // Calculate rotation increment (5 degrees per scroll step)
          const rotationIncrement = event.deltaY > 0 ? 5 : -5;
          
          // Get current rotation or default to 0
          let currentRotation = itemToRotate.rotation || 0;
          
          // Add the increment
          let newRotation = currentRotation + rotationIncrement;
          
          // Normalize to 0-360 range
          newRotation = ((newRotation % 360) + 360) % 360;
          
          // Apply snapping to common angles if within threshold
          const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315];
          const snapThreshold = 3; // Degrees
          
          for (const snapAngle of snapAngles) {
            if (Math.abs(newRotation - snapAngle) < snapThreshold) {
              newRotation = snapAngle;
              break;
            }
          }
          
          // Update rotation in the store
          rotateItem(itemToRotate.id, newRotation);
          console.log(`Rotated item ${itemToRotate.id} to ${newRotation} degrees`);
          return;
        }
      }
      
      // 'Canvas Move' mode or no items selected in 'Select & Move' mode
      if (isPanningMode || getSelectedItems().length === 0) {
        // Don't zoom if there's no image
        if (!imageUrl) {
          return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05; // Zoom out/in
        const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));
        
        const canvasMouseX = (mouseX - position.x) / scale;
        const canvasMouseY = (mouseY - position.y) / scale;
        
        const newX = mouseX - canvasMouseX * newScale;
        const newY = mouseY - canvasMouseY * newScale;
        
        setScale(newScale);
        setPosition({ x: newX, y: newY });
      }
    };
    
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [scale, position, setScale, setPosition, imageUrl, getSelectedItems, rotateItem, isPanningMode]);

  // Add keyboard handler for equipment movement and shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid capturing key events when user is typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Tab key to toggle between Select and Pan modes
      if (event.key === 'Tab') {
        event.preventDefault(); // Prevent focus change
        useMapStore.getState().setIsPanningMode(!isPanningMode);
        return;
      }
      
      // Escape key to deselect and exit panning mode
      if (event.key === 'Escape') {
        // Allow escape key to exit panning mode
        if (isPanningMode) {
          useMapStore.getState().setIsPanningMode(false);
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.style.cursor = 'default';
          }
        }
        deselectAll();
        return;
      }
      
      // Delete key to remove selected equipment
      if (event.key === 'Delete' || event.key === 'Backspace') {
        removeSelectedItems();
        return;
      }
      
      // Ctrl+Z for undo
      if (event.key.toLowerCase() === 'z' && event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        // TODO: Implement undo functionality using store
        console.log('Undo action');
        // This will require adding undo/redo functionality to the store
        // For MVP, we can show a notification that this will be available soon
        return;
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((event.key.toLowerCase() === 'y' && event.ctrlKey) || 
          (event.key.toLowerCase() === 'z' && event.ctrlKey && event.shiftKey)) {
        event.preventDefault();
        // TODO: Implement redo functionality using store
        console.log('Redo action');
        // This will require adding undo/redo functionality to the store
        // For MVP, we can show a notification that this will be available soon
        return;
      }
      
      // Ctrl+S to save project
      if (event.key.toLowerCase() === 's' && event.ctrlKey) {
        event.preventDefault();
        try {
          import('../../services/projectService').then(({ ProjectService }) => {
            const project = ProjectService.saveCurrentState();
            console.log('Project saved:', project.name);

            // Show success notification
            const notification = document.createElement('div');
            notification.textContent = `Project "${project.name}" saved successfully!`;
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 12px 20px;
              border-radius: 4px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 3000);
          }).catch(error => {
            console.error('Failed to save project:', error);

            // Show error notification
            const notification = document.createElement('div');
            notification.textContent = 'Failed to save project. Please try again.';
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #f44336;
              color: white;
              padding: 12px 20px;
              border-radius: 4px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 3000);
          });
        } catch (error) {
          console.error('Failed to import ProjectService:', error);
        }
        return;
      }
      
      // Ctrl+A to select all
      if (event.key.toLowerCase() === 'a' && event.ctrlKey) {
        event.preventDefault();
        selectAll();
        // Force canvas redraw after selection state changes
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Trigger a re-render by clearing and redrawing
            setTimeout(() => {
              if (canvas && ctx) {
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
              }
            }, 0);
          }
        }
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
  }, [equipmentItems, position, scale, setScale, moveSelectedItems, selectItem, deselectAll, selectAll, removeSelectedItems, copySelectedItems, pasteItems, getSelectedItems, isPanningMode, drawActiveCalibrationLine, drawCurrentCalibrationLine, drawEquipmentItems, drawGrid, loadedImage]);

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
      
      {/* Equipment name hover popup */}
      {hoverItem && hoverPosition && (
        <Box
          sx={{
            position: 'absolute',
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 2000,
            transform: 'translate(-50%, -100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          {hoverItem}
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
          {false && (
            <Box sx={{ mt: 0.5, color: 'warning.main' }}>
              🔒 Image Locked
            </Box>
          )}
          {activeCalibrationLine && showCalibrationLine && (
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
