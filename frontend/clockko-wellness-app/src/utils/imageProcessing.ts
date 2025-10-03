/*
imageProcessing.ts - Utility functions for processing avatar images
Handles resizing, cropping, and quality optimization for user uploads
*/

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  cropToSquare?: boolean;
}

/**
 * Process an uploaded image file for avatar use
 * - Resizes to optimal dimensions
 * - Crops to square if needed
 * - Optimizes quality and file size
 */
export async function processAvatarImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    maxWidth = 256,
    maxHeight = 256,
    quality = 0.9,
    format = 'image/jpeg',
    cropToSquare = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate dimensions for square crop
        let { width, height } = img;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = width;
        let sourceHeight = height;

        if (cropToSquare) {
          // Crop to square by taking the center square of the image
          const minDimension = Math.min(width, height);
          sourceWidth = minDimension;
          sourceHeight = minDimension;
          sourceX = (width - minDimension) / 2;
          sourceY = (height - minDimension) / 2;
        }

        // Set canvas dimensions
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill with white background (in case of transparency)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        // Draw the resized and cropped image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
          0, 0, maxWidth, maxHeight // Destination rectangle
        );

        // Convert to data URL with specified quality
        const processedDataURL = canvas.toDataURL(format, quality);
        resolve(processedDataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL from file and load into image
    const objectURL = URL.createObjectURL(file);
    img.src = objectURL;

    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectURL);
      try {
        // Process image as before...
        let { width, height } = img;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = width;
        let sourceHeight = height;

        if (cropToSquare) {
          const minDimension = Math.min(width, height);
          sourceWidth = minDimension;
          sourceHeight = minDimension;
          sourceX = (width - minDimension) / 2;
          sourceY = (height - minDimension) / 2;
        }

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, maxWidth, maxHeight
        );

        const processedDataURL = canvas.toDataURL(format, quality);
        resolve(processedDataURL);
      } catch (error) {
        reject(error);
      }
    };
  });
}

/**
 * Validate uploaded image file
 * Checks file type, size, and other constraints
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file.'
    };
  }

  // Check file size (max 5MB)
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: 'Image file size must be less than 5MB.'
    };
  }

  return { isValid: true };
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Preview processing options for user feedback
 */
export interface ProcessingPreview {
  originalSize: string;
  processedSize: string;
  compressionRatio: string;
  dimensions: string;
}

export async function getProcessingPreview(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessingPreview> {
  const processedDataURL = await processAvatarImage(file, options);
  const originalDimensions = await getImageDimensions(file);
  
  // Estimate processed size (data URL includes base64 encoding overhead)
  const processedSizeBytes = Math.round((processedDataURL.length * 3) / 4);
  const compressionRatio = ((file.size - processedSizeBytes) / file.size * 100).toFixed(1);
  
  return {
    originalSize: formatFileSize(file.size),
    processedSize: formatFileSize(processedSizeBytes),
    compressionRatio: `${compressionRatio}% smaller`,
    dimensions: `${originalDimensions.width}x${originalDimensions.height} → ${options.maxWidth || 256}x${options.maxHeight || 256}`
  };
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}