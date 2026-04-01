import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Captures an HTML element by ID and downloads it as a PDF.
 * @param {string} elementId The ID of the HTML element to capture.
 * @param {string} filename The name of the downloaded PDF file (without .pdf extension).
 * @param {object} options Optional configuration (e.g., orientation, margins).
 */
export const downloadAsPDF = async (elementId, filename = 'download', options = {}) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found.`);
        return;
    }

    try {
        // Temporarily style the element for better PDF rendering
        const originalStyle = {
            width: element.style.width,
            maxWidth: element.style.maxWidth,
            padding: element.style.padding,
            margin: element.style.margin,
            background: element.style.background,
            borderRadius: element.style.borderRadius,
            boxShadow: element.style.boxShadow,
            border: element.style.border
        };

        // Standardize dimensions for capture
        element.style.width = '1200px';
        element.style.maxWidth = 'none';
        element.style.padding = '40px';
        element.style.margin = '0';
        element.style.background = '#0a0b10'; // Dark theme background
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        element.style.borderRadius = '0';

        // Additional overrides to ensure images load
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true, // Allow external images
            logging: false,
            backgroundColor: '#0a0b10',
            windowWidth: 1200
        });

        // Restore original styles
        Object.assign(element.style, originalStyle);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Calculate PDF dimensions (A4 size: 210 x 297 mm)
        const pdf = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit PDF width while maintaining aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const margin = options.margin || 10;
        const availableWidth = pdfWidth - (margin * 2);

        const imgWidth = availableWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = margin;

        // Add first page
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - (margin * 2));

        // Add multi-page logic if content is too long
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + margin; // Shift image up
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - (margin * 2));
        }

        pdf.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};

/**
 * Generates a PDF containing a formatted table using jspdf-autotable.
 * @param {string} title The title to display at the top of the PDF.
 * @param {Array<string>} headers An array of column headers.
 * @param {Array<Array<any>>} data An array of data rows matching the headers.
 * @param {string} filename The name of the downloaded PDF file (without .pdf extension).
 */
export const downloadTableAsPDF = (title, headers, data, filename = 'download') => {
    try {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 14, 22);

        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Add AutoTable
        autoTable(doc, {
            startY: 36,
            head: [headers],
            body: data,
            theme: 'grid',
            headStyles: {
                fillColor: [220, 38, 38], // Red-ish theme color for header
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 5
            }
        });

        doc.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating tabular PDF:', error);
        return false;
    }
};
