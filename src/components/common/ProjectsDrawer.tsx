import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';

interface ProjectsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({ open, onClose }) => {
  const handleNewProject = () => {
    console.log('New Project');
    // TODO: Implement new project functionality
  };

  const handleOpenProject = () => {
    console.log('Open Project');
    // TODO: Implement open project functionality
  };

  const handleSaveProject = () => {
    console.log('Save Project');
    // TODO: Implement save project functionality
  };

  const handleSaveAsProject = () => {
    console.log('Save As Project');
    // TODO: Implement save as project functionality
  };

  const handleExportProject = () => {
    console.log('Export Project');
    // TODO: Implement export project functionality
  };

  const handleImportProject = () => {
    console.log('Import Project');
    // TODO: Implement import project functionality
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: '60px',
        width: '320px',
        height: 'calc(100vh - 64px)',
        bgcolor: 'background.paper',
        boxShadow: 3,
        zIndex: 900, // Behind sidebar (which is likely 1000+)
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderOpenIcon sx={{ mr: 1 }} />
                Projects
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Project Actions */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Project Actions
              </Typography>
              
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleNewProject}>
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="New Project" 
                      secondary="Start a new lot layout project"
                    />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleOpenProject}>
                    <ListItemIcon>
                      <FolderOpenIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Open Project" 
                      secondary="Load an existing project file"
                    />
                  </ListItemButton>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleSaveProject}>
                    <ListItemIcon>
                      <SaveIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Save Project" 
                      secondary="Save current project"
                    />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleSaveAsProject}>
                    <ListItemIcon>
                      <SaveAsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Save As" 
                      secondary="Save project with new name"
                    />
                  </ListItemButton>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleExportProject}>
                    <ListItemIcon>
                      <FileDownloadIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Export Project" 
                      secondary="Export to various formats"
                    />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleImportProject}>
                    <ListItemIcon>
                      <FileUploadIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Import Project" 
                      secondary="Import from file or other formats"
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            
            <Divider />
            
            {/* Recent Projects */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1, fontSize: 16 }} />
                Recent Projects
              </Typography>
              <Box sx={{ 
                p: 2, 
                textAlign: 'center', 
                color: 'text.secondary',
                fontStyle: 'italic'
              }}>
                No recent projects
              </Box>
            </Box>
          </Box>
        </Box>
    </Box>
  );
};

export default ProjectsDrawer;
