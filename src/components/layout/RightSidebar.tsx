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
  const selectedId = useEquipmentStore(state => state.selectedId);
  const items = useEquipmentStore(state => state.items);
  const selectedItem = items.find(item => item.id === selectedId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'equipment' | 'properties') => {
    setActiveTab(newValue);
  };

  // Group equipment by type
  const equipmentByType = equipmentLibrary.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof equipmentLibrary>);

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
          {Object.entries(equipmentByType).map(([type, items]) => (
            <Box key={type} sx={{ mb: 2 }}>
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
                {type}
              </Typography>
              <List dense disablePadding>
                {items.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        borderLeft: `4px solid ${item.color}`,
                        pl: 1
                      }}
                      onClick={() => console.log(`Add ${item.name}`)}
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
              
              {Object.entries(selectedItem.properties).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No additional properties
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {Object.entries(selectedItem.properties).map(([key, value]) => (
                    <Box key={key}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography variant="body2">
                        {value.toString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default RightSidebar;
