import React from 'react';
import { Group, Rect, Transformer, Text } from 'react-konva';
import { EquipmentItem as EquipmentItemType, useEquipmentStore } from '../../stores/equipmentStore';

interface EquipmentItemProps {
  item: EquipmentItemType;
  isSelected: boolean;
}

const EquipmentItem: React.FC<EquipmentItemProps> = ({ item, isSelected }) => {
  const shapeRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  const { selectItem, updateItem } = useEquipmentStore();
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      // Attach transformer
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  const handleSelect = () => {
    selectItem(item.id);
  };
  
  const handleDragEnd = (e: any) => {
    updateItem(item.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  const handleTransformEnd = (e: any) => {
    // Get transformer node
    const node = shapeRef.current;
    
    // Get new scale and position
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update width and height
    node.scaleX(1);
    node.scaleY(1);
    
    // Update item with new position, size and rotation
    updateItem(item.id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
      rotation: node.rotation()
    });
  };
  
  return (
    <>
      <Group
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        draggable
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={shapeRef}
      >
        <Rect
          width={item.width}
          height={item.height}
          fill={item.color}
          opacity={0.8}
          strokeWidth={isSelected ? 2 : 0}
          stroke="#ffffff"
          cornerRadius={2}
          shadowColor="black"
          shadowBlur={isSelected ? 10 : 5}
          shadowOpacity={0.3}
          shadowOffset={{ x: 2, y: 2 }}
        />
        
        {/* Item name label */}
        <Text
          text={item.name}
          fill="#ffffff"
          width={item.width}
          height={20}
          align="center"
          verticalAlign="middle"
          fontSize={12}
          y={item.height + 5}
        />
      </Group>
      
      {/* Transformer element for resizing and rotating */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
        />
      )}
    </>
  );
};

export default EquipmentItem;
