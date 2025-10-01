import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateFavicons = async () => {
  const sourceLogo = join(__dirname, '..', 'src', 'assets', 'baptist-logo.png');
  const outputPath = join(__dirname, '..', 'src', 'assets');

  try {
    // Generate 32x32 favicon
    await sharp(sourceLogo)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(outputPath, 'baptist-logo-32.png'));

    // Generate 16x16 favicon
    await sharp(sourceLogo)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(outputPath, 'baptist-logo-16.png'));

    // Generate 180x180 Apple touch icon
    await sharp(sourceLogo)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(outputPath, 'baptist-logo-180.png'));

    console.log('Favicon images generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
};

generateFavicons();