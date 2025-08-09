# Project Log - LotLizard V2

## Version 0.2.2 - 2025-08-09

Update multiple components (v0.2.2) - Automated commit


## Version 0.2.1 - 2025-08-09

Implement Feature X (v0.2.1) - Description of changes


## Version 0.1.5 (August 9, 2025)

### Project Management System Implementation

#### Changes:
- **Project Service**: Created ProjectService class to manage project CRUD operations
- **Project Storage**: Implemented local storage-based project persistence
- **Project Drawer UI**: Enhanced ProjectsDrawer with full project management capabilities
- **Project Import/Export**: Added JSON-based project import and export functionality
- **Map Navigation Widget**: Added directional controls for panning Google Maps in the ImageImportDrawer

#### Technical Details:
- Created projectService.ts with methods for creating, saving, loading, and managing projects
- Implemented project serialization and deserialization logic
- Integrated ProjectsDrawer component with ProjectService for all actions
- Added dialogs for New Project, Open Project, and Save As operations
- Implemented recent projects list with automatic sorting by last updated time
- Created intuitive navigation controls with dynamic panning distance based on zoom level

#### Benefits:
- Users can now save their work and resume later
- Project sharing via import/export functionality
- Improved user experience with recent projects list
- Foundation for future cloud-based project storage

## Version 0.1.4 (August 9, 2025)

### Google Maps API Search Fix

#### Changes:
- **Fixed Geocoding Error**: Resolved "maps.Geocoder is not a constructor" error in the Google Maps search functionality
- **Enhanced Error Handling**: Improved error messages and logging for Google Maps interactions
- **TypeScript Fixes**: Corrected type definitions for Google Maps Geocoder callback parameters

#### Technical Details:
- Modified GoogleMapsService.geocodeAddress to use the global google object instead of the local maps variable
- Added proper error checking and handling for Google Maps API loading issues
- Implemented detailed console logging to diagnose geocoding problems
- Updated type signatures to accommodate null results from Google geocoding

#### Benefits:
- Restored address search functionality in the ImageImportDrawer component
- Improved user experience with more descriptive error messages
- Enhanced debugging capability with detailed error logging
- More robust geocoding implementation that handles API loading edge cases

## Version 0.1.3 (August 9, 2025)

### Google Maps API Integration

#### Changes:
- **Google Maps Service**: Created GoogleMapsService.ts for API interaction management
- **Satellite Image Import**: Enhanced ImageImportDrawer with Google Maps search and selection functionality
- **Automatic Calibration**: Added pixelsPerMeter calculation based on latitude and zoom level
- **Address Search**: Implemented geocoding to find locations by address or name
- **Map Customization**: Added controls for zoom level and map type (satellite/hybrid)

#### Technical Details:
- Integrated @googlemaps/js-api-loader for Google Maps API access
- Added environment variable configuration for API key management
- Enhanced mapStore with setPixelsPerMeter method for scale calibration
- Implemented static map image fetching with proper scale calculation
- Created automatic conversion from latitude/zoom to real-world scale

#### Benefits:
- Streamlined lot planning with accurate satellite imagery
- Automatic calibration reduces manual measurement requirements
- Enhanced user experience with searchable location finder
- Scale-accurate image importing for precise equipment placement

## Version 0.1.2 (August 8, 2025)

### Advanced Keyboard Shortcuts & Selection Management

#### Changes:
- **Implemented Multi-Select**: Added Ctrl+Click functionality to select multiple equipment items
- **Copy/Paste Support**: Implemented Ctrl+C and Ctrl+V to copy and paste selected equipment
- **Select All**: Added Ctrl+A to select all equipment items on canvas
- **Delete Functionality**: Implemented Delete key to remove selected equipment
- **Zoom Shortcuts**: Added Ctrl++ and Ctrl+- for zooming in and out
- **Deselect Function**: Clicking on empty canvas space now deselects all items

#### Technical Details:
- Updated the keyboard event handler in MapCanvas.tsx to support all keyboard shortcuts
- Integrated clipboard functionality in the equipmentStore for copy/paste operations
- Fixed component structure issues and TypeScript errors in MapCanvas.tsx
- Implemented proper event bubbling for click detection on empty canvas areas

#### Benefits:
- Significantly improved productivity with keyboard-driven workflows
- Enhanced selection management with intuitive controls
- Better user experience matching standard application conventions
- Streamlined equipment manipulation with multi-select capabilities

## Version 0.1.1 (August 8, 2025)

### Enhanced Fit-to-Screen Functionality

#### Changes:
- Updated "fit to screen" function to always use exactly 183% zoom level
- Ensured content is properly centered in the canvas when using fit-to-screen
- Fixed calculation of center position based on canvas and content dimensions

#### Benefits:
- Consistent view every time fit-to-screen is used
- Optimal zoom level for viewing the entire map
- Better user experience with centered content

## Version 0.1.0 (August 8, 2025)

### Drawer Architecture and Animation Fixes

#### Changes:
- **Fixed Drawer Architecture**: Moved drawer components (Projects, ImageImport, Settings) out of LeftSidebar and into AppLayout as siblings to the sidebar, ensuring proper z-index layering
- **Synchronized Tab Animations**: Created custom styled components in ImageImportDrawer that synchronize tab indicator animations with drawer transitions
- **Improved State Management**: Centralized drawer state in AppLayout with interlocked behavior (only one drawer can be open at a time)
- **Optimized Z-Index Values**: Adjusted z-index values to ensure drawers appear behind the sidebar (not over it)

#### Technical Details:
- Refactored component architecture to ensure proper DOM hierarchy
- Implemented custom styled components using Material-UI's styled API
- Disabled default Material-UI tab indicator transitions with `transition: none !important`
- Added conditional display of tab indicator based on drawer open state
- Fixed prop passing between AppLayout and LeftSidebar components

#### Benefits:
- Drawers correctly slide out from behind the sidebar
- Tab indicator moves in sync with drawer transitions without lag
- Smoother and more professional transition animations
- Improved code maintainability with centralized drawer state
