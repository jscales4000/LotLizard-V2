import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MapCanvas from '../map/MapCanvas';
import ProjectsDrawer from '../common/ProjectsDrawer';
import ImageImportDrawer from '../common/ImageImportDrawer';
import SettingsDrawer from '../common/SettingsDrawer';

// Create a dark theme based on the UI examples
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
});

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Drawer state management moved from LeftSidebar to here
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
  const [imageImportDrawerOpen, setImageImportDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Handlers for drawer state
  const handleProjectsDrawerToggle = () => {
    setProjectsDrawerOpen(!projectsDrawerOpen);
    if (!projectsDrawerOpen) {
      // Close other drawers when opening this one
      setImageImportDrawerOpen(false);
      setSettingsDrawerOpen(false);
    }
  };

  const handleImageImportDrawerToggle = () => {
    setImageImportDrawerOpen(!imageImportDrawerOpen);
    if (!imageImportDrawerOpen) {
      // Close other drawers when opening this one
      setProjectsDrawerOpen(false);
      setSettingsDrawerOpen(false);
    }
  };

  const handleSettingsDrawerToggle = () => {
    setSettingsDrawerOpen(!settingsDrawerOpen);
    if (!settingsDrawerOpen) {
      // Close other drawers when opening this one
      setProjectsDrawerOpen(false);
      setImageImportDrawerOpen(false);
    }
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Left Sidebar with tools */}
        <LeftSidebar 
          onProjectsClick={handleProjectsDrawerToggle}
          onImageImportClick={handleImageImportDrawerToggle}
          onSettingsClick={handleSettingsDrawerToggle}
          projectsDrawerOpen={projectsDrawerOpen}
          imageImportDrawerOpen={imageImportDrawerOpen}
          settingsDrawerOpen={settingsDrawerOpen}
        />
        
        {/* Drawers positioned as siblings to sidebar for proper z-index layering */}
        <ProjectsDrawer 
          open={projectsDrawerOpen}
          onClose={() => setProjectsDrawerOpen(false)}
        />
        
        <ImageImportDrawer 
          open={imageImportDrawerOpen}
          onClose={() => setImageImportDrawerOpen(false)}
        />
        
        <SettingsDrawer 
          open={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
        />
        
        {/* Main content area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden' 
        }}>
          {/* Top navigation bar */}
          <TopBar />
          
          {/* Main canvas area */}
          <Box sx={{ 
            flexGrow: 1, 
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0a0a0a' // Dark background for the canvas area
          }}>
            <MapCanvas />
            {children}
          </Box>
        </Box>
        
        {/* Right Sidebar with equipment library and properties */}
        <RightSidebar />
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;
