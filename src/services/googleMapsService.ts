import { Loader } from '@googlemaps/js-api-loader';

export interface GoogleMapsLocation {
  lat: number;
  lng: number;
  zoom: number;
  address?: string;
}

export interface GoogleMapsOptions {
  apiKey: string;
  mapType?: 'satellite' | 'roadmap' | 'terrain' | 'hybrid';
  width?: number;
  height?: number;
  scale?: number; // For high-DPI devices, values can be 1 or 2
}

export class GoogleMapsService {
  private static apiKey: string = ''; // Should be populated from environment variable or config
  private static loader: Loader | null = null;
  
  /**
   * Initialize the Google Maps API loader
   * @param apiKey Google Maps API key
   */
  static init(apiKey: string): void {
    this.apiKey = apiKey;
    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    });
  }
  
  /**
   * Get a static map image URL for a location
   * @param location Location coordinates and zoom level
   * @param options Map display options
   * @returns URL to static map image
   */
  static getStaticMapUrl(location: GoogleMapsLocation, options: Partial<GoogleMapsOptions> = {}): string {
    const { lat, lng, zoom } = location;
    const { mapType = 'satellite', width = 800, height = 600, scale = 2 } = options;
    
    // Build Google Static Maps API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: `${lat},${lng}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      maptype: mapType,
      scale: scale.toString(),
      key: this.apiKey || ''
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  /**
   * Load the Google Maps JavaScript API
   * @returns Promise resolving to the Google Maps API
   */
  static async loadMapsApi(): Promise<any> {
    if (!this.loader) {
      throw new Error('Google Maps API not initialized. Call GoogleMapsService.init() first');
    }
    
    try {
      return await this.loader.load();
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
      throw error;
    }
  }
  
  /**
   * Geocode an address to get coordinates
   * @param address Address to geocode
   * @returns Promise resolving to location information
   */
  static async geocodeAddress(address: string): Promise<GoogleMapsLocation | null> {
    try {
      // Ensure Google Maps API is loaded properly
      const maps = await this.loadMapsApi();
      console.log('Maps API loaded:', !!maps, typeof maps);
      
      // Access the Geocoder via the global google object
      if (!google || !google.maps || !google.maps.Geocoder) {
        console.error('Google Maps Geocoder not available');
        throw new Error('Google Maps Geocoder not available');
      }
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          console.log('Geocode results:', results, 'status:', status);
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
              zoom: 18, // Default zoom level for geocoded addresses
              address: results[0].formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error in geocodeAddress:', error);
      throw error;
    }
  }
  
  /**
   * Estimate pixels per meter at a specific latitude and zoom level
   * @param latitude Latitude in degrees
   * @param zoom Google Maps zoom level
   * @returns Estimated pixels per meter
   */
  static calculatePixelsPerMeter(latitude: number, zoom: number): number {
    // The formula is based on Google Maps' projection and scaling
    const pixelsPerTile = 256; // Standard Google Maps tile size
    const latitudeRadians = latitude * (Math.PI / 180);
    
    // Earth's circumference at the equator in meters
    const earthCircumference = 40075016.686;
    
    // Number of tiles around the Earth at the equator at this zoom level
    const tilesAtEquator = Math.pow(2, zoom);
    
    // Adjust for latitude (Mercator projection adjustment)
    const latitudeAdjustment = Math.cos(latitudeRadians);
    
    // Calculate meters per pixel
    const metersPerPixel = (earthCircumference * latitudeAdjustment) / (tilesAtEquator * pixelsPerTile);
    
    // Based on real-world testing (30x30ft item showing as ~6 yards), apply a correction factor
    // This helps account for Google Maps projection inaccuracies and other factors
    const correctionFactor = 1.65; // Adjusted based on testing
    
    // Return pixels per meter (inverse of meters per pixel) with correction
    return (1 / metersPerPixel) * correctionFactor;
  }
  
  /**
   * Convert a static map image URL to a Blob
   * @param url Static map image URL
   * @returns Promise resolving to the image Blob and calculated pixelsPerMeter
   */
  static async fetchStaticMapImage(url: string, latitude: number, zoom: number): 
    Promise<{ blob: Blob; pixelsPerMeter: number }> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch map image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const pixelsPerMeter = this.calculatePixelsPerMeter(latitude, zoom);
      
      return { blob, pixelsPerMeter };
    } catch (error) {
      console.error('Error fetching static map:', error);
      throw error;
    }
  }
}
