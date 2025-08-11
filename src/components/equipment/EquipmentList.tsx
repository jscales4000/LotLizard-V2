import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Paper,
  Tooltip
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEquipmentStore } from '../../stores/equipmentStore';
import EquipmentEditor from './EquipmentEditor';

const EquipmentList: React.FC = () => {
  const items = useEquipmentStore(state => state.items);
  const selectedIds = useEquipmentStore(state => state.selectedIds);
  const selectItem = useEquipmentStore(state => state.selectItem);
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['All Items']));

  // Group items by category (using type as category since category doesn't exist on EquipmentItem)
  const groupedItems = items.reduce((acc, item) => {
    const category = item.type || 'Uncategorized';
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
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {category}
                    </Typography>
                    <Chip 
                      label={categoryItems.length} 
                      size="small" 
                      variant="outlined"
                      sx={{ height: 16, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
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
                          <Tooltip title="Focus on item">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemSelect(item.id);
                                // TODO: Could add camera focus functionality here
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
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
