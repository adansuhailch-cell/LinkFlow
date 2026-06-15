// ============================================================
// LinkFlow - Utility Functions
// Helper functions for common operations
// ============================================================

/**
 * Convert hex color to rgba string
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Raw text
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Save custom links to localStorage
 * @param {Array} links - Links to save
 */
function saveCustomLinks(links) {
  localStorage.setItem('linkflow_custom_links', JSON.stringify(links));
}

/**
 * Load custom links from localStorage
 * @returns {Array} Saved custom links
 */
function loadCustomLinks() {
  const saved = localStorage.getItem('linkflow_custom_links');
  return saved ? JSON.parse(saved) : [];
}

/**
 * Export data as JSON
 * @param {Array} data - Data to export
 * @param {string} filename - Output filename
 */
function exportAsJSON(data, filename = 'linkflow_links.json') {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Copy result
 */
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(
    () => console.log('Copied to clipboard'),
    err => console.error('Failed to copy', err)
  );
}

/**
 * Generate share URL
 * @param {Array} links - Links to encode
 * @returns {string} Shareable URL
 */
function generateShareUrl(links) {
  const encoded = btoa(JSON.stringify(links));
  return `${window.location.origin}?import=${encoded}`;
}

/**
 * Parse URL parameters
 * @returns {object} URL parameters
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};
  for (let [key, value] of params) {
    obj[key] = value;
  }
  return obj;
}