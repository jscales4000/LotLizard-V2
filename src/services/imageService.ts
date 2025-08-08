// Service for handling image import and processing operations

export interface ImageData {
  url: string;
  width: number;
  height: number;
  name: string;
  size: number;
}

export class ImageService {
  /**
   * Import an image file and return image data
   */
  static async importImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Check file size (limit to 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        reject(new Error('Image file is too large. Please select an image smaller than 50MB'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        const url = event.target?.result as string;
        
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          resolve({
            url,
            width: img.width,
            height: img.height,
            name: file.name,
            size: file.size
          });
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load the image'));
        };
        
        img.src = url;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the image file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image file before import
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select a valid image file' };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image file is too large. Please select an image smaller than 50MB' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP' };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get optimal canvas dimensions for the image
   */
  static getOptimalCanvasDimensions(imageWidth: number, imageHeight: number, maxWidth: number, maxHeight: number) {
    const aspectRatio = imageWidth / imageHeight;
    
    let canvasWidth = imageWidth;
    let canvasHeight = imageHeight;
    
    // Scale down if image is larger than max dimensions
    if (canvasWidth > maxWidth) {
      canvasWidth = maxWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }
    
    return {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight),
      scale: Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight)
    };
  }
}
