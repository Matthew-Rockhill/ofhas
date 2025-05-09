// src/services/shareService.js
import axios from 'axios';

/**
 * Share assessment report via email
 * @param {Object} options - Options for sharing
 * @param {Object} options.assessmentData - The assessment data to share
 * @param {String} options.recipientEmail - Email address of recipient
 * @param {String} options.senderName - Name of the sender
 * @param {String} options.message - Optional message to include
 * @param {Boolean} options.includePdf - Whether to attach PDF (default: true)
 * @returns {Promise<Object>} - Promise that resolves when sharing is complete
 */
export const shareReportByEmail = async ({
  assessmentData,
  recipientEmail,
  senderName,
  message = '',
  includePdf = true
}) => {
  try {
    const response = await axios.post('/api/share/email', {
      assessmentData,
      recipientEmail,
      senderName,
      message,
      includePdf
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sharing report:', error);
    throw new Error(error.response?.data?.error || 'Failed to share report');
  }
};

/**
 * Generate a shareable link to the report
 * @param {Object} assessmentData - The assessment data to share
 * @returns {Promise<String>} - Promise that resolves to a shareable URL
 */
export const generateShareableLink = async (assessmentData) => {
  try {
    const response = await axios.post('/api/share/link', {
      assessmentData
    });
    
    return response.data.shareUrl;
  } catch (error) {
    console.error('Error generating shareable link:', error);
    throw new Error('Failed to generate shareable link');
  }
};

/**
 * Copy shareable link to clipboard
 * @param {String} link - The link to copy to clipboard
 * @returns {Promise<Boolean>} - Promise that resolves to true if successful
 */
export const copyLinkToClipboard = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Fallback method for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = link;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      throw new Error('Failed to copy link');
    }
  }
};