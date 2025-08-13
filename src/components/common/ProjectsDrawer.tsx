import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ProjectService, Project } from '../../services/projectService';
import { EquipmentLibraryService } from '../../services/equipmentLibraryService';
import { PDFExportDialog } from '../export/PDFExportDialog';
import { useMapStore } from '../../stores/mapStore';
import { useEquipmentStore } from '../../stores/equipmentStore';

interface ProjectsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({ open, onClose }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'new' | 'save' | 'open'>('new');
  const [projectName, setProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [pdfExportDialogOpen, setPdfExportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get stores for PDF export
  const { scale, activeCalibrationLine } = useMapStore();
  const { items: equipmentItems } = useEquipmentStore();
  
  // Define showSnackbar function first since it's used by loadProjects
  const showSnackbar = useCallback((message: string, severity: AlertColor = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);
  
  // Define loadProjects with useCallback to prevent dependency changes on every render
  const loadProjects = useCallback(() => {
    try {
      const allProjects = ProjectService.getAllProjects();
      setProjects(allProjects);
      
      const recent = ProjectService.getRecentProjects();
      setRecentProjects(recent);
      
      const current = ProjectService.getCurrentProject();
      if (current) {
        setProjectName(current.name);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      showSnackbar('Failed to load projects', 'error');
    }
  }, [showSnackbar]);
  
  // Load projects on initial render
  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open, loadProjects]);
  
  // showSnackbar moved above loadProjects to fix order of declaration
  
  const handleNewProject = () => {
    setDialogType('new');
    setProjectName('New Project');
    setDialogOpen(true);
  };
  
  const handleOpenProject = () => {
    setDialogType('open');
    setDialogOpen(true);
  };
  
  const handleSaveProject = () => {
    try {
      const currentProject = ProjectService.getCurrentProject();
      
      if (!currentProject) {
        // If no project exists, open the save dialog
        setDialogType('save');
        setProjectName('New Project');
        setDialogOpen(true);
        return;
      }
      
      // Save current project
      const savedProject = ProjectService.saveCurrentState();
      showSnackbar(`Project "${savedProject.name}" saved successfully`);
      loadProjects(); // Reload projects
    } catch (error) {
      console.error('Error saving project:', error);
      showSnackbar('Failed to save project', 'error');
    }
  };
  
  const handleSaveAsProject = () => {
    setDialogType('save');
    
    const currentProject = ProjectService.getCurrentProject();
    if (currentProject) {
      setProjectName(`${currentProject.name} - Copy`);
    } else {
      setProjectName('New Project');
    }
    
    setDialogOpen(true);
  };
  
  const handleExportProject = () => {
    try {
      const currentProject = ProjectService.getCurrentProject();
      
      if (!currentProject) {
        showSnackbar('No project to export', 'warning');
        return;
      }
      
      const dataUri = ProjectService.exportProject(currentProject.id);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `${currentProject.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar('Project exported successfully');
    } catch (error) {
      console.error('Error exporting project:', error);
      showSnackbar('Failed to export project', 'error');
    }
  };
  
  const handleImportProject = () => {
    // Trigger hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const projectData = JSON.parse(content);
        
        // Import the project
        const importedProject = ProjectService.importProject(projectData);
        showSnackbar(`Project "${importedProject.name}" imported successfully`);
        loadProjects();
        onClose();
      } catch (error) {
        console.error('Error importing project:', error);
        showSnackbar('Failed to import project', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleExportTemplate = () => {
    try {
      // Get current equipment library from the store
      const { useEquipmentStore } = require('../../stores/equipmentStore');
      const equipmentLibrary = useEquipmentStore.getState().equipmentLibrary;
      
      // Export the entire equipment library
      EquipmentLibraryService.exportLibrary(equipmentLibrary);
      showSnackbar('Equipment library exported successfully');
    } catch (error) {
      console.error('Error exporting equipment library:', error);
      showSnackbar('Failed to export equipment library', 'error');
    }
  };

  const handleImportTemplate = async () => {
    try {
      const importedTemplate = await EquipmentLibraryService.importTemplate();
      if (importedTemplate) {
        // Add the imported template to the library via the store
        const { useEquipmentStore } = require('../../stores/equipmentStore');
        const currentLibrary = useEquipmentStore.getState().equipmentLibrary;
        const updatedLibrary = [...currentLibrary, importedTemplate];
        useEquipmentStore.getState().updateEquipmentLibrary(updatedLibrary);
        showSnackbar(`Template "${importedTemplate.name}" imported successfully`);
      }
    } catch (error) {
      console.error('Error importing template:', error);
      showSnackbar('Failed to import template', 'error');
    }
  };

  const handleExportToPDF = () => {
    // Find the canvas element in the DOM
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      // Store canvas reference and open dialog
      if (canvasRef.current !== canvas) {
        Object.defineProperty(canvasRef, 'current', {
          value: canvas,
          writable: true
        });
      }
      setPdfExportDialogOpen(true);
    } else {
      showSnackbar('No canvas found to export', 'error');
    }
  };

  // Handle dialog confirm
  const handleDialogConfirm = () => {
    try {
      if (dialogType === 'new') {
        // Create new project
        const newProject = ProjectService.createNewProject(projectName);
        ProjectService.setCurrentProject(newProject.id);
        ProjectService.saveProject(newProject);
        
        // Reset map and equipment stores to blank slate
        // This would be better handled within the ProjectService
        window.location.reload(); // Temporary solution to clear state
        
        showSnackbar(`New project "${projectName}" created`);
      } 
      else if (dialogType === 'save') {
        // Save as new project
        ProjectService.saveCurrentState(projectName);
        showSnackbar(`Project "${projectName}" saved successfully`);
      }
      else if (dialogType === 'open') {
        // Open selected project
        if (!selectedProjectId) {
          showSnackbar('No project selected', 'warning');
          return;
        }
        
        const loaded = ProjectService.loadProject(selectedProjectId);
        if (loaded) {
          const project = ProjectService.getProject(selectedProjectId);
          if (project) {
            showSnackbar(`Project "${project.name}" opened successfully`);
            onClose(); // Close drawer after successful open
          }
        } else {
          showSnackbar('Failed to open project', 'error');
        }
      }
      
      loadProjects(); // Reload projects list
      setDialogOpen(false);
    } catch (error) {
      console.error('Error in dialog action:', error);
      showSnackbar(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectName(project.name);
    }
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
                      secondary="Export to JSON format"
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
                      secondary="Import from JSON file"
                    />
                  </ListItemButton>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleExportTemplate}>
                    <ListItemIcon>
                      <FileDownloadIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Export Templates" 
                      secondary="Export equipment library"
                    />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleImportTemplate}>
                    <ListItemIcon>
                      <FileUploadIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Import Template" 
                      secondary="Import equipment template"
                    />
                  </ListItemButton>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem disablePadding>
                  <ListItemButton onClick={handleExportToPDF}>
                    <ListItemIcon>
                      <PictureAsPdfIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Export to PDF" 
                      secondary="Export layout as PDF document"
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
              
              {recentProjects.length > 0 ? (
                <List disablePadding>
                  {recentProjects.map((project) => (
                    <ListItem key={project.id} disablePadding>
                      <ListItemButton onClick={() => {
                        setSelectedProjectId(project.id);
                        ProjectService.loadProject(project.id);
                        showSnackbar(`Project "${project.name}" opened`);
                        onClose();
                      }}>
                        <ListItemText 
                          primary={project.name} 
                          secondary={new Date(project.updatedAt).toLocaleDateString()}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}>
                  No recent projects
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Dialogs */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {dialogType === 'new' ? 'Create New Project' : 
             dialogType === 'save' ? 'Save Project As' : 'Open Project'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'open' ? (
              // Open project dialog
              <List sx={{ minWidth: 300 }}>
                {projects.length > 0 ? projects.map((project) => (
                  <ListItem key={project.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleProjectSelect(project.id)}
                      selected={selectedProjectId === project.id}
                    >
                      <ListItemText
                        primary={project.name}
                        secondary={`Last updated: ${new Date(project.updatedAt).toLocaleString()}`}
                      />
                    </ListItemButton>
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText primary="No projects found" />
                  </ListItem>
                )}
              </List>
            ) : (
              // New or Save As dialog
              <TextField
                autoFocus
                margin="dense"
                label="Project Name"
                fullWidth
                variant="outlined"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDialogConfirm} variant="contained" color="primary">
              {dialogType === 'new' ? 'Create' : dialogType === 'save' ? 'Save' : 'Open'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar */}
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={4000} 
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          style={{ display: 'none' }}
        />
        
        {/* PDF Export Dialog */}
        {canvasRef.current && (
          <PDFExportDialog
            open={pdfExportDialogOpen}
            onClose={() => setPdfExportDialogOpen(false)}
            canvasRef={canvasRef}
            projectMetadata={{
              projectName: ProjectService.getCurrentProject()?.name || 'Untitled Project',
              exportDate: new Date().toLocaleString(),
              itemCount: equipmentItems.length,
              calibrationInfo: activeCalibrationLine ? `${activeCalibrationLine.realWorldDistance} ft` : undefined,
              scale: scale
            }}
          />
        )}
    </Box>
  );
};

export default ProjectsDrawer;
