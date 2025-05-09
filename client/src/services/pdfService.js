// src/services/pdfService.js
import axios from 'axios';

/**
 * Generate a PDF report from assessment data
 * @param {Object} assessmentData - Object containing pillar results, overall score, etc.
 * @returns {Promise<Blob>} - Promise that resolves to PDF blob
 */
export const generatePdfReport = async (assessmentData) => {
  try {
    // Send the assessment data to our backend API for PDF generation
    const response = await axios.post('/api/pdf', assessmentData, {
      responseType: 'blob', // Important: we want binary data back
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Download the generated PDF
 * @param {Blob} pdfBlob - The PDF blob to download
 * @param {String} filename - The name for the downloaded file
 */
export const downloadPdf = (pdfBlob, filename = 'financial-health-report.pdf') => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(pdfBlob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  // Append to the document, click it, and clean up
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate and download a PDF report in one step
 * @param {Object} assessmentData - The assessment data to include in the PDF
 */
export const generateAndDownloadPdf = async (assessmentData) => {
  try {
    const blob = await generatePdfReport(assessmentData);
    downloadPdf(blob);
    return true;
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    throw error;
  }
};