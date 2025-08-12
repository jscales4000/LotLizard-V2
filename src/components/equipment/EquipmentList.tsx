import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  IconButton,
  Collapse,
  Tooltip
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useEquipmentStore } from '../../stores/equipmentStore';
import EquipmentEditor from './EquipmentEditor';

const EquipmentList: React.FC = () => {
  const items = useEquipmentStore(state => state.items);
  const selectedIds = useEquipmentStore(state => state.selectedIds);
  const selectItem = useEquipmentStore(state => state.selectItem);
  const toggleItemVisibility = useEquipmentStore(state => state.toggleItemVisibility);
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['All Items']));

  // Auto-switch to editing when an item is selected from canvas while editor is open
  React.useEffect(() => {
    if (editingItemId && selectedIds.length === 1 && selectedIds[0] !== editingItemId) {
      // If editor is open and a different single item is selected, switch to editing that item
      setEditingItemId(selectedIds[0]);
    }
  }, [selectedIds, editingItemId]);

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

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || item.type || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleCategoryToggle = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemSelect = (itemId: string) => {
    selectItem(itemId);
    // If editor is open, switch to editing the selected item
    if (editingItemId) {
      setEditingItemId(itemId);
    }
  };

  const handleEditItem = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingItemId(itemId);
  };

  const handleCloseEditor = () => {
    setEditingItemId(null);
  };

  const formatDimensions = (item: any) => {
    if (item.shape === 'circle' && item.realWorldRadius) {
      return `⌀ ${item.realWorldRadius.toFixed(1)} ft`;
    } else if (item.realWorldWidth && item.realWorldHeight) {
      return `${item.realWorldWidth.toFixed(1)} × ${item.realWorldHeight.toFixed(1)} ft`;
    }
    return 'No dimensions';
  };

  if (items.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No equipment items on canvas
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag items from the Equipment tab to add them
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      {/* Show editor for currently editing item */}
      {editingItemId && (
        <Box sx={{ p: 1 }}>
          {(() => {
            const editingItem = items.find(item => item.id === editingItemId);
            return editingItem ? (
              <EquipmentEditor 
                key={editingItem.id}
                item={editingItem} 
                onClose={handleCloseEditor}
              />
            ) : null;
          })()}
        </Box>
      )}

      {/* Equipment list */}
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: 'bold' }}>
          Items on Canvas ({items.length})
        </Typography>

        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Box key={category} sx={{ mb: 1 }}>
            {/* Category Header */}
            <ListItemButton
              onClick={() => handleCategoryToggle(category)}
              sx={{ 
                py: 0.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                mb: 0.5
              }}
            >
              <ListItemText 
                primary={`${formatCategoryName(category)} (${categoryItems.length})`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
              />
              {expandedCategories.has(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>

            {/* Category Items */}
            <Collapse in={expandedCategories.has(category)}>
              <List dense disablePadding sx={{ pl: 1 }}>
                {categoryItems.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{
                      mb: 0.5,
                      bgcolor: selectedIds.includes(item.id) ? 'primary.light' : 'background.paper',
                      borderColor: selectedIds.includes(item.id) ? 'primary.main' : 'divider',
                      borderWidth: selectedIds.includes(item.id) ? 2 : 1,
                    }}
                  >
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleItemSelect(item.id)}
                        sx={{ 
                          py: 0.5,
                          borderLeft: `4px solid ${item.color}`,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: selectedIds.includes(item.id) ? 'bold' : 'normal',
                              color: selectedIds.includes(item.id) ? 'primary.contrastText' : 'text.primary'
                            }}
                            noWrap
                          >
                            {item.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={selectedIds.includes(item.id) ? 'primary.contrastText' : 'text.secondary'}
                            sx={{ display: 'block' }}
                          >
                            {formatDimensions(item)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={selectedIds.includes(item.id) ? 'primary.contrastText' : 'text.secondary'}
                          >
                            Position: ({Math.round(item.x)}, {Math.round(item.y)})
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title={item.visible !== false ? "Hide item" : "Show item"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItemVisibility(item.id);
                              }}
                              color={item.visible !== false ? 'default' : 'warning'}
                            >
                              {item.visible !== false ? (
                                <VisibilityIcon fontSize="small" />
                              ) : (
                                <VisibilityOffIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit item">
                            <IconButton
                              size="small"
                              onClick={(e) => handleEditItem(item.id, e)}
                              color={editingItemId === item.id ? 'primary' : 'default'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default EquipmentList;
