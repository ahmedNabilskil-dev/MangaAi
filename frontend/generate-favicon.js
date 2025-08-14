#!/usr/bin/env node

/**
 * Favicon Generation Script
 * 
 * This script helps generate favicons from your manga.png image.
 * 
 * Option 1: Online converter (Recommended)
 * - Go to https://favicon.io/favicon-converter/
 * - Upload your public/images/manga.png
 * - Download the generated favicon package
 * - Replace the favicon.ico in src/app/ directory
 * 
 * Option 2: Using ImageMagick (if installed)
 * Run: convert public/images/manga.png -resize 32x32 src/app/favicon.ico
 * 
 * Option 3: Using online tools
 * - https://realfavicongenerator.net/
 * - https://www.favicon-generator.org/
 * 
 * After generating the favicon, the metadata in layout.tsx has been
 * updated to use your manga.png as fallback icons.
 */

console.log('🎨 Favicon Generation Guide');
console.log('');
console.log('Your manga.png has been configured as the icon in layout.tsx');
console.log('');
console.log('To create a proper favicon.ico:');
console.log('1. Visit: https://favicon.io/favicon-converter/');
console.log('2. Upload: public/images/manga.png');
console.log('3. Download the generated favicon.ico');
console.log('4. Replace: src/app/favicon.ico');
console.log('');
console.log('The new favicon will appear after restarting your dev server.');
