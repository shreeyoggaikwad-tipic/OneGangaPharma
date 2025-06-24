// Configuration settings for the medicine management system
export const config = {
  // Minimum shelf life policy (in months)
  // Only medicines with this much remaining shelf life will be available for customer purchase
  // Short-expiry medicines (below this threshold) are excluded from regular sales
  minimumShelfLifeMonths: 3,
  
  // Low stock alert threshold
  lowStockThreshold: 10,
  
  // Expiry warning period (in days)
  expiryWarningDays: 30,
  
  // Order settings
  maxItemsPerOrder: 50,
  
  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Helper function to get shelf life interval for SQL queries
export function getShelfLifeInterval(): string {
  return `${config.minimumShelfLifeMonths} months`;
}

// Helper function to update shelf life configuration
export function updateMinimumShelfLife(months: number): void {
  if (months < 1 || months > 12) {
    throw new Error('Minimum shelf life must be between 1 and 12 months');
  }
  config.minimumShelfLifeMonths = months;
}