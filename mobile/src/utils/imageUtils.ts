import Marker, { Position, TextBackgroundType } from 'react-native-image-marker';

/**
 * Applies a "transhub/username" watermark to an image URI.
 * Returns the URI of the watermarked image.
 */
export async function watermarkImage(uri: string, username: string): Promise<string> {
  try {
    const usernameClean = username.toLowerCase().replace(/\s+/g, '');
    const watermarkText = usernameClean === 'admin' ? 'transhub' : `transhub/${usernameClean}`;
    
    // Process image with watermark
    const watermarkedUri = await Marker.markText({
      backgroundImage: {
        src: uri,
      },
      watermarkTexts: [{
        text: watermarkText,
        position: {
          position: Position.center,
        },
        style: {
          color: '#D4AF37AA', // Transhub Gold with transparency
          fontSize: 60,
          fontName: 'Arial-BoldMT',
          shadowStyle: {
            dx: 2,
            dy: 2,
            radius: 2,
            color: '#00000080',
          },
        }
      }],
      quality: 100,
    });

    return 'file://' + watermarkedUri;
  } catch (error) {
    console.error('Watermarking failed:', error);
    return uri; // Fallback to original URI if watermarking fails
  }
}
