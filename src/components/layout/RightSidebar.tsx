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
  Paper
} from '@mui/material';
import { useEquipmentStore } from '../../stores/equipmentStore';

// Width of the right sidebar
const DRAWER_WIDTH = 280;

const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'properties'>('equipment');
  const equipmentLibrary = useEquipmentStore(state => state.equipmentLibrary);
  const selectedIds = useEquipmentStore(state => state.selectedIds);
  const items = useEquipmentStore(state => state.items);
  // Get the first selected item for properties display
  const selectedItem = selectedIds.length > 0 ? items.find(item => item.id === selectedIds[0]) : undefined;

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'equipment' | 'properties') => {
    setActiveTab(newValue);
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
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
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
          <Tab value="equipment" label="Equipment" />
          <Tab value="properties" label="Properties" />
        </Tabs>
      </Box>
      
      {activeTab === 'equipment' && (
        <Box sx={{ overflow: 'auto', p: 1 }}>
          {Object.entries(groupedEquipment).map(([category, items]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  textTransform: 'uppercase', 
                  fontWeight: 'bold',
                  px: 1, 
                  py: 0.5,
                  bgcolor: 'background.default'
                }}
              >
                {category}
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
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing'
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
                        secondary={`${item.width}x${item.height}`} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
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
                    {selectedItem.realWorldWidth.toFixed(1)}×{selectedItem.realWorldHeight.toFixed(1)} m
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
                    Position
                  </Typography>
                  <Typography variant="body2">
                    {Math.round(selectedItem.x)}, {Math.round(selectedItem.y)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default RightSidebar;
