# LotLizard V2 UI/UX Reference Guide

This document outlines the key UI/UX elements and design principles based on the provided example screenshots.

## Layout Structure

Based on the provided UI examples, the LotLizard V2 application will follow a structured layout with:

1. **Main Canvas Area** - The central workspace where the carnival lot planning takes place
2. **Left Sidebar** - For primary navigation, tools, and basic actions
3. **Right Sidebar/Panel** - For equipment library, properties, and detailed settings
4. **Top Navigation Bar** - For project-level actions, view controls, and user settings
5. **Floating Controls** - Zoom, calibration, and measurement tools that overlay the canvas

## Design Style

The application follows a modern, clean design aesthetic with:

- **Color Scheme**: Professional dark theme with accent colors for interactive elements
- **Typography**: Sans-serif fonts for readability across different screen sizes
- **Iconography**: Simple, recognizable icons with consistent styling
- **Spacing**: Ample whitespace to maintain clarity in the interface
- **Visual Hierarchy**: Clear differentiation between primary and secondary actions

## Key UI Components to Implement

Based on the examples, we'll focus on implementing these components:

1. **Canvas Implementation**:
   - Konva.js for rendering the canvas
   - Support for satellite imagery backgrounds
   - Grid overlays for precise positioning
   - High-performance rendering for large fairgrounds

2. **Calibration Tools**:
   - Distance measurement markers
   - Scale adjustment controls
   - Real-world to pixel ratio indicators

3. **Equipment Library**:
   - Categorized list of equipment types
   - Visual thumbnails for quick recognition
   - Drag-and-drop interface to the canvas
   - Custom equipment creation tools

4. **Property Controls**:
   - Selected object properties panel
   - Size, position, and rotation inputs
   - Custom attributes for specific equipment types

5. **Navigation Controls**:
   - Zoom in/out buttons
   - Pan controls
   - Reset view and fit to screen options

## Implementation Priorities

1. Core canvas functionality with proper scaling
2. Image import and calibration tools
3. Basic equipment library and placement
4. Property editing and manipulation tools
5. Project management (save, load, export)

## Additional Notes

- The UI should maintain consistency with the example screenshots while ensuring optimal performance
- Mobile/responsive considerations will be a future enhancement
- Accessibility features will be incorporated throughout development
