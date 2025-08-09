# Project Log - LotLizard V2

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
