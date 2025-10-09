/*
ImageProcessingTest.tsx - Test component to verify avatar image processing
This can be temporarily added to test the image processing functionality
*/

import React, { useState, useRef } from 'react';
import { processAvatarImage, validateImageFile, getProcessingPreview } from '../../utils/imageProcessing';

interface ProcessingResult {
  original: string;
  processed: string;
  preview: any;
}

export function ImageProcessingTest() {
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Get original image as data URL for comparison
      const originalDataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Process image
      const processedDataURL = await processAvatarImage(file, {
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.9,
        format: 'image/jpeg',
        cropToSquare: true
      });

      // Get processing preview info
      const preview = await getProcessingPreview(file);

      setResult({
        original: originalDataURL,
        processed: processedDataURL,
        preview
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🖼️ Avatar Image Processing Test</h2>
      
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
          disabled={isProcessing}
        />
        
        {isProcessing && (
          <div className="text-blue-600">
            <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Processing image...
          </div>
        )}
        
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded border">
            ❌ Error: {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Processing Info */}
          <div className="bg-blue-50 p-4 rounded border">
            <h3 className="font-semibold mb-2">📊 Processing Results:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Original Size:</strong> {result.preview.originalSize}</li>
              <li><strong>Processed Size:</strong> {result.preview.processedSize}</li>
              <li><strong>Compression:</strong> {result.preview.compressionRatio}</li>
              <li><strong>Dimensions:</strong> {result.preview.dimensions}</li>
            </ul>
          </div>

          {/* Image Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="text-center">
              <h3 className="font-semibold mb-2">📸 Original Image</h3>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <img 
                  src={result.original} 
                  alt="Original" 
                  className="max-w-full max-h-64 mx-auto object-contain"
                />
              </div>
            </div>

            {/* Processed */}
            <div className="text-center">
              <h3 className="font-semibold mb-2">✨ Processed Avatar</h3>
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <img 
                  src={result.processed} 
                  alt="Processed" 
                  className="w-32 h-32 mx-auto object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Perfect square avatar at 256x256px
              </p>
            </div>
          </div>

          {/* Usage Example */}
          <div className="bg-green-50 p-4 rounded border">
            <h3 className="font-semibold mb-2">👤 How it looks in UI:</h3>
            <div className="flex items-center gap-4">
              <img 
                src={result.processed} 
                alt="Avatar Preview" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <p className="font-medium">User Name</p>
                <p className="text-sm text-gray-600">Perfect avatar sizing!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded text-sm">
        <h4 className="font-semibold mb-2">🔧 How it works:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Validates file type and size (max 5MB)</li>
          <li>Crops to perfect square (takes center portion)</li>
          <li>Resizes to 256x256px for consistent display</li>
          <li>Optimizes quality (90%) to reduce file size</li>
          <li>Converts to JPEG format for best compatibility</li>
          <li>Returns processed data URL ready for use</li>
        </ul>
      </div>
    </div>
  );
}