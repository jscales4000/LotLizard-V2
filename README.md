# LotLizard V2: Carnival Lot Planner

## Overview

LotLizard V2 is a sophisticated carnival/fair lot planning application designed to help event organizers efficiently plan, organize, and visualize carnival layouts. The application allows users to import satellite imagery, calibrate measurements, and precisely position equipment on a virtual canvas, ensuring optimal space utilization and logistics planning for real-world fairground setups.

## Key Features

- **Satellite Image Import**: Import real-world satellite imagery from Google Maps API
- **Precise Calibration**: Calibrate the canvas to real-world measurements
- **Equipment Library**: Create, customize, and manage carnival equipment templates
- **Drag-and-Drop Interface**: Intuitively position and arrange equipment on the canvas
- **Real-Time Distance Measurement**: Measure distances between objects on the canvas
- **Dynamic Zoom Controls**: Navigate large fairground layouts with ease
- **Project Management**: Save, load, and export carnival lot plans
- **Advanced Annotations**: Add notes, labels, and custom markers to the layout

## Technology Stack

- **Frontend**: React with TypeScript
- **Canvas Rendering**: Konva.js (via react-konva)
- **UI Components**: Material-UI
- **State Management**: Zustand
- **External APIs**: Google Maps Static API

## Development Roadmap

### Phase 1: MVP Core Features
- Satellite image import and calibration
- Basic equipment library
- Fundamental canvas interactions
- Basic project saving/loading

### Phase 2: Enhanced Functionality
- Advanced measurements and annotations
- Equipment grouping
- Custom equipment creation
- Export capabilities

### Phase 3: Optimization & Additional Features
- Performance optimizations for large layouts
- Collaboration features
- Advanced reporting

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jscales4000/LotLizard-V2.git
   cd LotLizard-V2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Maps API key:
   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs in the API Library:
     - Maps JavaScript API
     - Maps Static API
     - Geocoding API
   - Create an API key with appropriate restrictions (HTTP referrers recommended)
   - Create a `.env` file in the project root with your API key:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
     ```

4. Start the development server:
   ```bash
   npm start
   ```

### API Key Security Best Practices

- **Restrict your API key** in the Google Cloud Console to only the specific APIs you need
- Add **HTTP referrer restrictions** to limit where your key can be used
- For production, consider setting up a backend proxy to make API requests
- Never commit your actual API key to version control

## Contributing

_Coming soon: Contribution guidelines_

## License

_Coming soon: License information_

## Recent Features

- Automated commit
- Description of changes

- to-screen and fixed keyboard handler
