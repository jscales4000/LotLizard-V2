import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  Tabs, 
  Tab, 
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Paper,

} from '@mui/material';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentTemplate } from '../../services/equipmentService';
import EquipmentList from '../equipment/EquipmentList';
import { EquipmentLibraryManager } from '../equipment/EquipmentLibraryManager';

// Width of the right sidebar
const DRAWER_WIDTH = 372;

const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'list' | 'properties'>('equipment');
  const equipmentLibrary = useEquipmentStore(state => state.equipmentLibrary);
  const selectedIds = useEquipmentStore(state => state.selectedIds);
  const items = useEquipmentStore(state => state.items);
  // Get the first selected item for properties display
  const selectedItem = selectedIds.length > 0 ? items.find(item => item.id === selectedIds[0]) : undefined;

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'equipment' | 'list' | 'properties') => {
    setActiveTab(newValue);
  };

  // Format category names for display
  const formatCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'mega-rides': 'Mega Rides',
      'rides': 'Rides',
      'kiddy-rides': 'Kiddy Rides',
      'food': 'Food',
      'games': 'Games',
      'equipment': 'Equipment',
      'office': 'Office',
      'home': 'Home',
      'bunks': 'Bunks',
      'utility': 'Utility',
      'custom': 'Custom'
    };
    return categoryMap[category] || category;
  };

  // Group equipment by category
  const groupedEquipment = equipmentLibrary.reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        zIndex: 1300, // High z-index to stay above template editor panel
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 1300, // Ensure paper also has high z-index
        },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab value="equipment" label="Library" />
          <Tab value="list" label="Items" />
          <Tab value="properties" label="Properties" />
        </Tabs>
      </Box>
      
      {activeTab === 'list' && (
        <EquipmentList />
      )}
      
      {activeTab === 'equipment' && (
        <Box sx={{ overflow: 'auto', p: 1 }}>
          {Object.entries(groupedEquipment).map(([category, items]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold',
                  px: 1, 
                  py: 0.5,
                  bgcolor: 'background.default'
                }}
              >
                {formatCategoryName(category)} ({items.length})
              </Typography>
              <List dense disablePadding>
                {(items as any[]).map((item: any) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'equipment',
                          templateId: item.id,
                          name: item.name,
                          category: item.category,
                          width: item.width,
                          height: item.height,
                          color: item.color
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        borderLeft: `4px solid ${item.color}`,
                        pl: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: item.color 
                          }} 
                        />
                      </Box>
                      <ListItemText 
                        primary={item.name} 
                        secondary={
                          item.shape === 'circle' && item.radius 
                            ? `⌀${item.radius * 2} ft (radius: ${item.radius} ft)`
                            : item.width && item.height 
                            ? `${item.width} × ${item.height} ft`
                            : 'Dimensions not specified'
                        } 
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
          
          {/* Equipment Library Management */}
          <EquipmentLibraryManager 
            templates={equipmentLibrary}
            onTemplatesUpdate={(updatedTemplates: EquipmentTemplate[]) => {
              // Update the equipment library in the store
              useEquipmentStore.getState().updateEquipmentLibrary(updatedTemplates);
            }}
          />
        </Box>
      )}

      
      {activeTab === 'properties' && (
        <Box sx={{ overflow: 'auto', p: 2 }}>
          {!selectedItem ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Select an item to view and edit its properties
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ID: {selectedItem.id}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Position & Size
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    X Position
                  </Typography>
                  <Typography variant="body2">{selectedItem.x.toFixed(1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Y Position
                  </Typography>
                  <Typography variant="body2">{selectedItem.y.toFixed(1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Width
                  </Typography>
                  <Typography variant="body2">{selectedItem.width.toFixed(1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Height
                  </Typography>
                  <Typography variant="body2">{selectedItem.height.toFixed(1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Rotation
                  </Typography>
                  <Typography variant="body2">{selectedItem.rotation.toFixed(1)}°</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Properties
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Real Size
                  </Typography>
                  <Typography variant="body2">
                    {selectedItem.realWorldWidth?.toFixed(1) || 'N/A'}×{selectedItem.realWorldHeight?.toFixed(1) || 'N/A'} ft
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Pixel Size
                  </Typography>
                  <Typography variant="body2">
                    {Math.round(selectedItem.width)}×{Math.round(selectedItem.height)} px
                  </Typography>
                </Box>
                {selectedItem.minSpacing && (
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Min Spacing
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.minSpacing} m
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Shape
                  </Typography>
                  <Typography variant="body2">
                    {selectedItem.shape || 'rectangle'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Equipment Properties Section */}
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Equipment Details
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {selectedItem.capacity && (
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Capacity
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.capacity} people
                    </Typography>
                  </Box>
                )}
                {selectedItem.weight && (
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Weight
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.weight.toLocaleString()} lbs
                    </Typography>
                  </Box>
                )}
                {selectedItem.verticalHeight && (
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Vertical Height
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.verticalHeight} ft
                    </Typography>
                  </Box>
                )}
                {selectedItem.turnAroundTime && (
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Turn Around Time
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.turnAroundTime} min
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Clearance Zone Section */}
              {((selectedItem.shape === 'rectangle' && 
                 ((selectedItem.clearanceLeft || 0) > 0 || (selectedItem.clearanceRight || 0) > 0 || 
                  (selectedItem.clearanceTop || 0) > 0 || (selectedItem.clearanceBottom || 0) > 0)) ||
                (selectedItem.shape === 'circle' && (selectedItem.clearanceRadius || 0) > 0)) && (
                <>
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                    Clearance Zone
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    {selectedItem.shape === 'rectangle' ? (
                      <>
                        {(selectedItem.clearanceLeft || 0) > 0 && (
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Left Clearance
                            </Typography>
                            <Typography variant="body2">
                              {selectedItem.clearanceLeft} ft
                            </Typography>
                          </Box>
                        )}
                        {(selectedItem.clearanceRight || 0) > 0 && (
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Right Clearance
                            </Typography>
                            <Typography variant="body2">
                              {selectedItem.clearanceRight} ft
                            </Typography>
                          </Box>
                        )}
                        {(selectedItem.clearanceTop || 0) > 0 && (
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Top Clearance
                            </Typography>
                            <Typography variant="body2">
                              {selectedItem.clearanceTop} ft
                            </Typography>
                          </Box>
                        )}
                        {(selectedItem.clearanceBottom || 0) > 0 && (
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Bottom Clearance
                            </Typography>
                            <Typography variant="body2">
                              {selectedItem.clearanceBottom} ft
                            </Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      (selectedItem.clearanceRadius || 0) > 0 && (
                        <Box>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Clearance Radius
                          </Typography>
                          <Typography variant="body2">
                            {selectedItem.clearanceRadius} ft
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </>
              )}
            </Paper>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default RightSidebar;
