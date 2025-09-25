const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Asegurar que el directorio de salida existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generando iconos PWA...');

  try {
    // Leer el SVG
    const svgBuffer = fs.readFileSync(inputSvg);

    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generado: icon-${size}x${size}.png`);
    }

    console.log('¡Todos los iconos han sido generados exitosamente!');
  } catch (error) {
    console.error('Error generando iconos:', error);
  }
}

generateIcons();
