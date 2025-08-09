import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Collapse,
  Tooltip,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentService, EquipmentTemplate } from '../../services/equipmentService';
import CustomEquipmentForm from './CustomEquipmentForm';

interface EquipmentLibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  pixelsPerMeter: number;
}

const EquipmentLibraryDrawer: React.FC<EquipmentLibraryDrawerProps> = ({
  open,
  onClose,
  pixelsPerMeter
}) => {
  const equipmentLibrary = useEquipmentStore(state => state.equipmentLibrary);
  const addItemFromTemplate = useEquipmentStore(state => state.addItemFromTemplate);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    booth: true,
    ride: true,
    game: true,
    food: true,
    utility: true,
    custom: true
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<EquipmentTemplate[]>([]);
  
  // Custom equipment form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EquipmentTemplate | undefined>(undefined);
  
  // Menu state for item actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // Get unique categories from the equipment library
  const categories = Array.from(new Set(equipmentLibrary.map(item => item.category)));
  
  // Menu handling functions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveItemId(itemId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveItemId(null);
  };
  
  // Custom equipment handling functions
  const handleAddCustomEquipment = () => {
    setEditingTemplate(undefined);
    setShowCustomForm(true);
  };
  
  const handleEditEquipment = (template: EquipmentTemplate) => {
    setEditingTemplate(template);
    setShowCustomForm(true);
    handleMenuClose();
  };
  
  const handleDeleteEquipment = (id: string) => {
    EquipmentService.deleteCustomTemplate(id);
    handleMenuClose();
    // Refresh equipment list
    loadAllTemplates();
  };
  
  const handleCustomFormSubmit = (template: Omit<EquipmentTemplate, 'id' | 'isCustom'>) => {
    if (editingTemplate) {
      EquipmentService.updateCustomTemplate(editingTemplate.id, template);
    } else {
      EquipmentService.saveCustomTemplate(template);
    }
    setShowCustomForm(false);
    setEditingTemplate(undefined);
    // Refresh equipment list
    loadAllTemplates();
  };
  
  const handleCustomFormCancel = () => {
    setShowCustomForm(false);
    setEditingTemplate(undefined);
  };
  
  // Function to load all equipment templates (built-in + custom)
  const loadAllTemplates = () => {
    const allTemplates = EquipmentService.getAllTemplates();
    useEquipmentStore.setState({ equipmentLibrary: allTemplates });
  };
  
  // Effect to load all templates on first render
  useEffect(() => {
    loadAllTemplates();
  }, []);
  
  // Effect to filter equipment based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredLibrary(equipmentLibrary);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = equipmentLibrary.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lowercaseQuery);
      const descriptionMatch = item.description?.toLowerCase().includes(lowercaseQuery) || false;
      const categoryMatch = item.category.toLowerCase().includes(lowercaseQuery);
      return nameMatch || descriptionMatch || categoryMatch;
    });
    
    setFilteredLibrary(filtered);
  }, [searchQuery, equipmentLibrary]);
  
  // Handle category expand/collapse
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // Handle favorite toggle
  const toggleFavorite = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent item selection
    
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
    }
    
    // In a real app, we'd save favorites to localStorage or a user profile
    localStorage.setItem('equipmentFavorites', JSON.stringify(
      favorites.includes(itemId) ? favorites.filter(id => id !== itemId) : [...favorites, itemId]
    ));
  };
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('equipmentFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
    
    const savedRecent = localStorage.getItem('equipmentRecentlyUsed');
    if (savedRecent) {
      try {
        setRecentlyUsed(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Failed to parse recently used', e);
      }
    }
  }, []);
  
  // Handle equipment item selection
  const handleItemSelect = (templateId: string) => {
    // Add item to canvas at a default position
    // In a real implementation, you might want to start a drag operation here
    addItemFromTemplate(templateId, 100, 100, pixelsPerMeter);
    
    // Update recently used
    const newRecentlyUsed = [
      templateId,
      ...recentlyUsed.filter(id => id !== templateId)
    ].slice(0, 5); // Keep only the 5 most recent
    
    setRecentlyUsed(newRecentlyUsed);
    localStorage.setItem('equipmentRecentlyUsed', JSON.stringify(newRecentlyUsed));
    
    // Optional: close the drawer after selection
    // onClose();
  };
  
  // Render equipment item
  const renderEquipmentItem = (item: EquipmentTemplate) => {
    const isFavorite = favorites.includes(item.id);
    const isCustom = item.isCustom || false;
    
    return (
      <ListItem 
        key={item.id} 
        disablePadding
        secondaryAction={
          <Box sx={{ display: 'flex' }}>
            {isCustom && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, item.id)}
                aria-label="edit custom equipment"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton 
              edge="end" 
              aria-label="toggle favorite"
              onClick={(e) => toggleFavorite(item.id, e)}
            >
              {isFavorite ? <StarIcon color="primary" /> : <StarBorderIcon />}
            </IconButton>
          </Box>
        }
      >
        <ListItemButton onClick={() => handleItemSelect(item.id)}>
          <Box
            sx={{
              width: '24px',
              height: '24px',
              backgroundColor: item.color,
              mr: 2,
              borderRadius: '2px'
            }}
          />
          <ListItemText 
            primary={item.name} 
            secondary={
              <>
                {item.description || EquipmentService.formatDimensions(item.width, item.height, 'feet')}
                {isCustom && <Chip size="small" label="Custom" sx={{ ml: 1, height: 16 }} />}
              </>
            }
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItemButton>
      </ListItem>
    );
  };
  
  // Render a category group
  const renderCategory = (category: string) => {
    const categoryItems = filteredLibrary.filter(item => item.category === category);
    if (categoryItems.length === 0) return null;
    
    const isExpanded = expandedCategories[category] || false;
    
    return (
      <Box key={category} sx={{ mb: 1 }}>
        <ListItemButton onClick={() => toggleCategory(category)}>
          <ListItemText 
            primary={category.charAt(0).toUpperCase() + category.slice(1)} 
            secondary={`${categoryItems.length} items`}
          />
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {categoryItems.map(item => renderEquipmentItem(item))}
          </List>
        </Collapse>
      </Box>
    );
  };
  
  // Render favorites section
  const renderFavorites = () => {
    const favoriteItems = filteredLibrary.filter(item => favorites.includes(item.id));
    if (favoriteItems.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
          Favorites
        </Typography>
        <List dense>
          {favoriteItems.map(item => renderEquipmentItem(item))}
        </List>
        <Divider />
      </Box>
    );
  };
  
  // Render recently used section
  const renderRecentlyUsed = () => {
    const recentItems = filteredLibrary.filter(item => recentlyUsed.includes(item.id));
    if (recentItems.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
          Recently Used
        </Typography>
        <List dense>
          {recentItems.map(item => renderEquipmentItem(item))}
        </List>
        <Divider />
      </Box>
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 350 },
            maxWidth: '100%'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2">
            Equipment Library
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select equipment to add to your layout
          </Typography>
          
          {/* Search input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Add custom equipment button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Tooltip title="Create custom equipment">
              <IconButton 
                color="primary" 
                aria-label="add custom equipment"
                onClick={handleAddCustomEquipment}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Equipment filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map(category => (
              <Chip 
                key={category}
                label={category}
                clickable
                onClick={() => toggleCategory(category)}
                color={expandedCategories[category] ? 'primary' : 'default'}
                size="small"
              />
            ))}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Equipment list */}
          <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            {renderFavorites()}
            {renderRecentlyUsed()}
            
            {/* Categories */}
            <List>
              {categories.map(category => renderCategory(category))}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Custom equipment action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const template = equipmentLibrary.find(item => item.id === activeItemId);
          if (template) {
            handleEditEquipment(template);
          }
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeItemId) {
            handleDeleteEquipment(activeItemId);
          }
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Custom equipment form dialog */}
      <CustomEquipmentForm
        open={showCustomForm}
        onClose={handleCustomFormCancel}
        onSubmit={handleCustomFormSubmit}
        editingTemplate={editingTemplate}
        pixelsPerMeter={pixelsPerMeter}
      />
    </>
  );
}

export default EquipmentLibraryDrawer;
