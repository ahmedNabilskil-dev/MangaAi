// AI Magic Icon Generator
// Creates a magic AI-themed favicon

const fs = require('fs');
const path = require('path');

// Create SVG content for the AI magic icon
const svgContent = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient circle -->
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Main circle background -->
  <circle cx="64" cy="64" r="58" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="4"/>
  
  <!-- Central AI sparkle -->
  <g transform="translate(64,64)" filter="url(#glow)">
    <!-- Main star -->
    <path d="M-8,0 L-2,-2 L0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 Z" fill="#ffffff"/>
    <!-- Center dot -->
    <circle cx="0" cy="0" r="2" fill="#F59E0B"/>
  </g>
  
  <!-- Surrounding sparkles -->
  <g fill="#ffffff" opacity="0.9">
    <!-- Top left -->
    <path d="M25,25 L28,23 L30,20 L32,23 L35,25 L32,27 L30,30 L28,27 Z"/>
    <!-- Top right -->
    <circle cx="98" cy="30" r="3"/>
    <!-- Bottom left -->
    <circle cx="30" cy="98" r="2"/>
    <!-- Bottom right -->
    <path d="M95,95 L97,93 L99,91 L101,93 L103,95 L101,97 L99,99 L97,97 Z"/>
    <!-- Side sparkles -->
    <circle cx="20" cy="64" r="1.5"/>
    <circle cx="108" cy="64" r="2"/>
    <circle cx="64" cy="20" r="1"/>
    <circle cx="64" cy="108" r="1.5"/>
  </g>
  
  <!-- Small accent sparkles -->
  <g fill="#F59E0B" opacity="0.8">
    <circle cx="45" cy="35" r="1"/>
    <circle cx="83" cy="45" r="1"/>
    <circle cx="45" cy="83" r="1"/>
    <circle cx="83" cy="83" r="1"/>
  </g>
  
  <!-- Magic particles -->
  <g fill="#10B981" opacity="0.6">
    <circle cx="38" cy="50" r="0.5"/>
    <circle cx="90" cy="60" r="0.5"/>
    <circle cx="50" cy="90" r="0.5"/>
    <circle cx="78" cy="38" r="0.5"/>
  </g>
</svg>
`.trim();

// Write the SVG file
const svgPath = path.join(__dirname, 'public', 'images', 'ai-magic-favicon.svg');
const publicDir = path.join(__dirname, 'public', 'images');

// Ensure directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(svgPath, svgContent);

console.log('🎨 AI Magic Favicon Generated!');
console.log('');
console.log('✅ Created: public/images/ai-magic-favicon.svg');
console.log('');
console.log('🚀 Next steps:');
console.log('1. Convert SVG to ICO format:');
console.log('   - Visit: https://convertio.co/svg-ico/');
console.log('   - Upload: public/images/ai-magic-favicon.svg');
console.log('   - Download as: favicon.ico');
console.log('   - Replace: src/app/favicon.ico');
console.log('');
console.log('2. Or use the SVG directly in your layout.tsx');
console.log('');
console.log('The icon features:');
console.log('• Purple to pink gradient background');
console.log('• Central white star with golden center');
console.log('• Surrounding sparkles and magic particles');
console.log('• Perfect for AI/magic theme!');
