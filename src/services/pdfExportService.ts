import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title?: string;
  includeMetadata?: boolean;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ProjectMetadata {
  projectName?: string;
  exportDate: string;
  itemCount: number;
  calibrationInfo?: string;
  scale?: number;
}

export class PDFExportService {
  /**
   * Export the map canvas to PDF
   */
  static async exportMapToPDF(
    canvasElement: HTMLCanvasElement,
    metadata: ProjectMetadata,
    options: PDFExportOptions = {}
  ): Promise<void> {
    try {
      const {
        title = 'LotLizard Layout Export',
        includeMetadata = true,
        quality = 0.95,
        format = 'a4',
        orientation = 'landscape'
      } = options;

      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate content area (leaving margins)
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);

      let currentY = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add metadata if requested
      if (includeMetadata) {
        currentY = this.addMetadataSection(pdf, metadata, margin, currentY);
        currentY += 10;
      }

      // Capture canvas as image
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#121212',
        scale: quality,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Convert canvas to data URL
      const imgData = canvas.toDataURL('image/png', quality);

      // Calculate image dimensions to fit in content area
      const canvasAspectRatio = canvas.width / canvas.height;
      const contentAspectRatio = contentWidth / (contentHeight - currentY + margin);

      let imgWidth, imgHeight;
      if (canvasAspectRatio > contentAspectRatio) {
        // Canvas is wider relative to content area
        imgWidth = contentWidth;
        imgHeight = contentWidth / canvasAspectRatio;
      } else {
        // Canvas is taller relative to content area
        imgHeight = contentHeight - currentY + margin;
        imgWidth = imgHeight * canvasAspectRatio;
      }

      // Center the image horizontally
      const imgX = (pageWidth - imgWidth) / 2;

      // Add the map image
      pdf.addImage(imgData, 'PNG', imgX, currentY, imgWidth, imgHeight);

      // Add footer
      this.addFooter(pdf, pageWidth, pageHeight);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `${metadata.projectName || 'LotLizard-Layout'}_${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export with custom canvas rendering (for high-quality export)
   */
  static async exportMapWithCustomRender(
    renderFunction: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
    metadata: ProjectMetadata,
    options: PDFExportOptions = {}
  ): Promise<void> {
    try {
      // Create a high-resolution canvas for export
      const exportCanvas = document.createElement('canvas');
      const exportScale = 2; // Higher resolution for PDF
      exportCanvas.width = 1920 * exportScale;
      exportCanvas.height = 1080 * exportScale;
      
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Scale context for high-resolution rendering
      ctx.scale(exportScale, exportScale);
      
      // Set high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Render the map content
      renderFunction(exportCanvas, ctx);

      // Export the rendered canvas
      await this.exportMapToPDF(exportCanvas, metadata, options);

    } catch (error) {
      console.error('Error exporting PDF with custom render:', error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add metadata section to PDF
   */
  private static addMetadataSection(
    pdf: jsPDF,
    metadata: ProjectMetadata,
    margin: number,
    startY: number
  ): number {
    let currentY = startY;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Information', margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (metadata.projectName) {
      pdf.text(`Project Name: ${metadata.projectName}`, margin, currentY);
      currentY += 6;
    }

    pdf.text(`Export Date: ${metadata.exportDate}`, margin, currentY);
    currentY += 6;

    pdf.text(`Equipment Items: ${metadata.itemCount}`, margin, currentY);
    currentY += 6;

    if (metadata.calibrationInfo) {
      pdf.text(`Calibration: ${metadata.calibrationInfo}`, margin, currentY);
      currentY += 6;
    }

    if (metadata.scale) {
      pdf.text(`View Scale: ${Math.round(metadata.scale * 100)}%`, margin, currentY);
      currentY += 6;
    }

    return currentY;
  }

  /**
   * Add footer to PDF
   */
  private static addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const footerY = pageHeight - 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    
    // Left side - Generated by
    pdf.text('Generated by LotLizard V2', 20, footerY);
    
    // Right side - Page number and timestamp
    const timestamp = new Date().toLocaleString();
    pdf.text(`Page 1 • ${timestamp}`, pageWidth - 20, footerY, { align: 'right' });
  }

  /**
   * Get optimal PDF format based on canvas dimensions
   */
  static getOptimalFormat(canvasWidth: number, canvasHeight: number): {
    format: 'a4' | 'letter' | 'legal';
    orientation: 'portrait' | 'landscape';
  } {
    const aspectRatio = canvasWidth / canvasHeight;
    
    // If canvas is wider than it is tall, use landscape
    if (aspectRatio > 1.2) {
      return { format: 'a4', orientation: 'landscape' };
    } else {
      return { format: 'a4', orientation: 'portrait' };
    }
  }

  /**
   * Validate export prerequisites
   */
  static validateExportConditions(canvasElement: HTMLCanvasElement): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!canvasElement) {
      issues.push('Canvas element not found');
    }

    if (canvasElement && (canvasElement.width === 0 || canvasElement.height === 0)) {
      issues.push('Canvas has no content to export');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
