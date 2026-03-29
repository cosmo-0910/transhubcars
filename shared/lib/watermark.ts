/**
 * Applies a "transhub/username" watermark to an image file.
 * Returns a Blob that can be uploaded to storage.
 */
export async function applyWatermark(file: File, username: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to match image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark formatting
        const usernameClean = username.toLowerCase().replace(/\s+/g, '');
        const watermarkText = usernameClean === 'admin' ? 'transhub' : `transhub/${usernameClean}`;
        
        // Dynamic font size starting point
        let fontSize = Math.max(20, Math.floor(canvas.width / 30)); 
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        // Ensure text fits within 75% of canvas width
        const maxWatermarkWidth = canvas.width * 0.75;
        let textMetrics = ctx.measureText(watermarkText);
        
        while (textMetrics.width > maxWatermarkWidth && fontSize > 12) {
          fontSize -= 2;
          ctx.font = `bold ${fontSize}px sans-serif`;
          textMetrics = ctx.measureText(watermarkText);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // Draw background strip for better readability
        const bgPadding = fontSize / 1.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // More subtle background
        ctx.fillRect(
          x - textMetrics.width / 2 - bgPadding, 
          y - fontSize / 2 - bgPadding / 3, 
          textMetrics.width + bgPadding * 2, 
          fontSize + bgPadding / 1.5
        );

        // Draw main watermark text
        ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'; // Transhub Gold, subtle transparency
        ctx.fillText(watermarkText, x, y);

        // Convert back to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, file.type, 0.9);
      };
      img.onerror = () => reject(new Error('Failed to load image for watermarking'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
