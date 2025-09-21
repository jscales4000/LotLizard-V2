import React, { useState } from 'react';
import { Layer, Line, Circle, Text } from 'react-konva';
import { useMapStore } from '../../stores/mapStore';

const CalibrationOverlay: React.FC = () => {
  const { calibrationPoints, addCalibrationPoint } = useMapStore();
  const [tempPoint, setTempPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Handle canvas click for adding calibration points
  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (point) {
      // Adjust for stage position and scale
      const adjustedPoint = {
        x: (point.x - stage.x()) / stage.scaleX(),
        y: (point.y - stage.y()) / stage.scaleY()
      };
      
      // Add calibration point with a placeholder real world distance (to be updated via UI)
      addCalibrationPoint({
        id: `point-${Date.now()}`,
        x: adjustedPoint.x,
        y: adjustedPoint.y,
        realWorldDistance: 0 // Will be updated via input field
      });
    }
  };
  
  // Handle mouse move for showing potential calibration point
  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (point) {
      // Adjust for stage position and scale
      setTempPoint({
        x: (point.x - stage.x()) / stage.scaleX(),
        y: (point.y - stage.y()) / stage.scaleY()
      });
    }
  };
  
  // Reset temp point when mouse leaves the stage
  const handleMouseLeave = () => {
    setTempPoint(null);
  };
  
  // Draw lines between calibration points
  const renderLines = () => {
    if (calibrationPoints.length < 2) return null;
    
    return calibrationPoints.map((point, i) => {
      if (i === 0) return null;
      
      const prevPoint = calibrationPoints[i - 1];
      
      return (
        <Line
          key={`line-${i}`}
          points={[prevPoint.x, prevPoint.y, point.x, point.y]}
          stroke="#00ff00"
          strokeWidth={2}
          dash={[5, 5]}
        />
      );
    });
  };
  
  // Draw distance labels
  const renderDistanceLabels = () => {
    if (calibrationPoints.length < 2) return null;
    
    return calibrationPoints.map((point, i) => {
      if (i === 0) return null;
      
      const prevPoint = calibrationPoints[i - 1];
      const midX = (prevPoint.x + point.x) / 2;
      const midY = (prevPoint.y + point.y) / 2;
      const distance = point.realWorldDistance;
      
      return (
        <React.Fragment key={`label-${i}`}>
          <Text
            x={midX - 20}
            y={midY - 10}
            text={`${distance} m`}
            fill="#ffffff"
            fontSize={14}
            fontStyle="bold"
          />
          <Circle
            x={midX}
            y={midY}
            radius={3}
            fill="#00ff00"
          />
        </React.Fragment>
      );
    });
  };
  
  return (
    <Layer
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
    >
      {/* Draw lines between calibration points */}
      {renderLines()}
      
      {/* Draw existing calibration points */}
      {calibrationPoints.map((point, i) => (
        <Circle
          key={`point-${i}`}
          x={point.x}
          y={point.y}
          radius={1.5}
          fill="#00ff00"
          stroke="#ffffff"
          strokeWidth={0.25}
        />
      ))}
      
      {/* Draw temporary hover point */}
      {tempPoint && (
        <Circle
          x={tempPoint.x}
          y={tempPoint.y}
          radius={1.5}
          fill="#00ff00"
          opacity={0.5}
        />
      )}
      
      {/* Draw distance labels */}
      {renderDistanceLabels()}
    </Layer>
  );
};

export default CalibrationOverlay;
