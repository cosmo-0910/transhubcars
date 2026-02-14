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
        const fontSize = Math.max(30, Math.floor(canvas.width / 25)); // Slightly larger for center
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // Draw background strip for better readability in the center
        const metrics = ctx.measureText(watermarkText);
        const bgPadding = fontSize / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(
          x - metrics.width / 2 - bgPadding, 
          y - fontSize / 2 - bgPadding / 2, 
          metrics.width + bgPadding * 2, 
          fontSize + bgPadding
        );

        // Draw main watermark text
        ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'; // Transhub Gold, slightly more transparent
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
