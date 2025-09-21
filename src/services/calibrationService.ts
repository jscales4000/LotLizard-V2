// Service for handling calibration calculations and measurements

export interface CalibrationPoint {
  id: string;
  x: number;
  y: number;
  realWorldDistance?: number;
}

export interface CalibrationLine {
  id: string;
  startPoint: CalibrationPoint;
  endPoint: CalibrationPoint;
  pixelDistance: number;
  realWorldDistance: number;
  pixelsPerFoot: number;
}

export class CalibrationService {
  /**
   * Calculate the pixel distance between two points
   */
  static calculatePixelDistance(point1: CalibrationPoint, point2: CalibrationPoint): number {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * Calculate pixels per foot ratio from calibration line
   */
  static calculatePixelsPerFoot(pixelDistance: number, realWorldDistance: number): number {
    if (realWorldDistance <= 0) {
      throw new Error('Real world distance must be greater than 0');
    }
    return pixelDistance / realWorldDistance;
  }

  /**
   * Create a calibration line from two points and real world distance
   */
  static createCalibrationLine(
    startPoint: CalibrationPoint,
    endPoint: CalibrationPoint,
    realWorldDistance: number
  ): CalibrationLine {
    const pixelDistance = this.calculatePixelDistance(startPoint, endPoint);
    const pixelsPerFoot = this.calculatePixelsPerFoot(pixelDistance, realWorldDistance);

    return {
      id: `cal-${Date.now()}`,
      startPoint,
      endPoint,
      pixelDistance,
      realWorldDistance,
      pixelsPerFoot
    };
  }

  /**
   * Convert pixel measurements to real world measurements
   */
  static pixelsToFeet(pixels: number, pixelsPerFoot: number): number {
    return pixels / pixelsPerFoot;
  }

  /**
   * Convert real world measurements to pixel measurements
   */
  static feetToPixels(feet: number, pixelsPerFoot: number): number {
    return feet * pixelsPerFoot;
  }

  /**
   * Calculate the scale factor for the entire image
   */
  static calculateImageScale(calibrationLines: CalibrationLine[]): number {
    if (calibrationLines.length === 0) {
      return 1;
    }

    // Average the pixels per foot from all calibration lines
    const totalPixelsPerFoot = calibrationLines.reduce(
      (sum, line) => sum + line.pixelsPerFoot,
      0
    );

    return totalPixelsPerFoot / calibrationLines.length;
  }

  /**
   * Validate calibration data
   */
  static validateCalibration(calibrationLines: CalibrationLine[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (calibrationLines.length === 0) {
      errors.push('At least one calibration line is required');
      return { isValid: false, errors, warnings };
    }

    // Check for very short lines (might be accidental clicks)
    const shortLines = calibrationLines.filter(line => line.pixelDistance < 10);
    if (shortLines.length > 0) {
      warnings.push(`${shortLines.length} calibration line(s) are very short and might be inaccurate`);
    }

    // Check for inconsistent scales between multiple lines
    if (calibrationLines.length > 1) {
      const pixelsPerFootValues = calibrationLines.map(line => line.pixelsPerFoot);
      const average = pixelsPerFootValues.reduce((sum, val) => sum + val, 0) / pixelsPerFootValues.length;
      const maxDeviation = Math.max(...pixelsPerFootValues.map(val => Math.abs(val - average)));

      if (maxDeviation > average * 0.2) { // 20% deviation threshold
        warnings.push('Calibration lines have inconsistent scales. Consider recalibrating for better accuracy.');
      }
    }

    // Check for unrealistic scales
    calibrationLines.forEach((line, index) => {
      if (line.pixelsPerFoot < 0.3) {
        warnings.push(`Calibration line ${index + 1} suggests a very large scale. Please verify the real-world distance.`);
      }
      if (line.pixelsPerFoot > 300) {
        warnings.push(`Calibration line ${index + 1} suggests a very small scale. Please verify the real-world distance.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Format distance for display
   */
  static formatDistance(feet: number): string {
    return feet < 10 ? `${feet.toFixed(1)} ft` : `${Math.round(feet)} ft`;
  }
}
