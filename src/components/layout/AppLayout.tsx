import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MapCanvas from '../map/MapCanvas';

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
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Left Sidebar with tools */}
        <LeftSidebar />
        
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
