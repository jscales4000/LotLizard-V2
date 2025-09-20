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
  projectLocation?: string;
  exportDate: string;
  itemCount: number;
  calibrationInfo?: string;
  scale?: number;
  equipmentItems?: EquipmentItemData[];
}

export interface EquipmentItemData {
  id: string;
  name: string;
  category: string;
  shape: 'rectangle' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  capacity?: number;
  weight?: number;
  verticalHeight?: number;
  turnAroundTime?: number;
  powerLoad?: number;
  powerGen?: number;
  ticketCount?: number;
  color?: string;
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

      // Add title and location header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
      
      // Add location if provided
      if (metadata.projectLocation) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Location: ${metadata.projectLocation}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;
      } else {
        currentY += 5;
      }

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
      currentY += imgHeight + 10;

      // Add equipment table if equipment items are provided
      if (metadata.equipmentItems && metadata.equipmentItems.length > 0) {
        // Check if we need a new page for the equipment table
        const tableHeight = this.estimateTableHeight(metadata.equipmentItems);
        if (currentY + tableHeight > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
        
        currentY = this.addEquipmentTable(pdf, metadata.equipmentItems, margin, currentY, contentWidth);
      }

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
   * Add equipment table to PDF
   */
  private static addEquipmentTable(
    pdf: jsPDF,
    equipmentItems: EquipmentItemData[],
    margin: number,
    startY: number,
    contentWidth: number
  ): number {
    let currentY = startY;
    
    // Table title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Equipment List', margin, currentY);
    currentY += 10;
    
    // Define table columns
    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Position (X,Y)', key: 'position', width: 25 },
      { header: 'Dimensions', key: 'dimensions', width: 25 },
      { header: 'Capacity', key: 'capacity', width: 15 },
      { header: 'Weight (lbs)', key: 'weight', width: 18 },
      { header: 'Height (ft)', key: 'verticalHeight', width: 15 },
      { header: 'Power Load', key: 'powerLoad', width: 18 },
      { header: 'Power Gen', key: 'powerGen', width: 17 },
      { header: 'Tickets', key: 'ticketCount', width: 12 }
    ];
    
    // Calculate column widths based on content width
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const scaleFactor = contentWidth / totalWidth;
    columns.forEach(col => col.width *= scaleFactor);
    
    // Draw table header
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(240, 240, 240);
    
    let currentX = margin;
    const headerHeight = 8;
    
    // Draw header background
    pdf.rect(margin, currentY, contentWidth, headerHeight, 'F');
    
    // Draw header text
    columns.forEach(column => {
      pdf.text(column.header, currentX + 2, currentY + 5);
      currentX += column.width;
    });
    
    currentY += headerHeight;
    
    // Draw table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFillColor(255, 255, 255);
    
    equipmentItems.forEach((item, index) => {
      const rowHeight = 6;
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }
      
      currentX = margin;
      
      // Format data for each column
      const rowData = {
        name: item.name || 'Unnamed',
        category: item.category || 'Unknown',
        position: `(${Math.round(item.x)}, ${Math.round(item.y)})`,
        dimensions: item.shape === 'circle' 
          ? `R: ${item.radius || 0}ft`
          : `${item.width || 0} × ${item.height || 0}ft`,
        capacity: (item.capacity || 0).toString(),
        weight: (item.weight || 0).toString(),
        verticalHeight: (item.verticalHeight || 0).toString(),
        powerLoad: (item.powerLoad || 0).toString(),
        powerGen: (item.powerGen || 0).toString(),
        ticketCount: (item.ticketCount || 0).toString()
      };
      
      // Draw cell data
      columns.forEach(column => {
        const cellData = rowData[column.key as keyof typeof rowData] || '';
        // Truncate text if too long
        const maxLength = Math.floor(column.width / 2);
        const displayText = cellData.length > maxLength 
          ? cellData.substring(0, maxLength - 3) + '...'
          : cellData;
        
        pdf.text(displayText, currentX + 2, currentY + 4);
        currentX += column.width;
      });
      
      currentY += rowHeight;
    });
    
    // Draw table border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, startY + 10, contentWidth, currentY - startY - 10);
    
    // Draw column separators
    currentX = margin;
    columns.forEach((column, index) => {
      if (index < columns.length - 1) {
        currentX += column.width;
        pdf.line(currentX, startY + 10, currentX, currentY);
      }
    });
    
    return currentY + 10;
  }
  
  /**
   * Estimate table height for pagination
   */
  private static estimateTableHeight(equipmentItems: EquipmentItemData[]): number {
    const headerHeight = 18; // Title + header row
    const rowHeight = 6;
    const padding = 10;
    
    return headerHeight + (equipmentItems.length * rowHeight) + padding;
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
