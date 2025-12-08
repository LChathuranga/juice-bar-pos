const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a stylish juice bar icon using SVG
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient for the cup -->
    <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradient for juice -->
    <linearGradient id="juiceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#F7931E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF5722;stop-opacity:1" />
    </linearGradient>
    
    <!-- Background gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2E7D32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5E20;stop-opacity:1" />
    </linearGradient>
    
    <!-- Straw gradient -->
    <linearGradient id="strawGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#E91E63;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF4081;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E91E63;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)"/>
  
  <!-- Inner circle highlight -->
  <circle cx="256" cy="256" r="220" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.2"/>
  
  <!-- Cup body (tapered) -->
  <path d="M160 180 L175 400 Q180 420 200 420 L312 420 Q332 420 337 400 L352 180 Z" 
        fill="url(#cupGradient)" filter="url(#shadow)" stroke="#e0e0e0" stroke-width="2"/>
  
  <!-- Juice inside cup -->
  <path d="M168 220 L180 390 Q183 405 200 405 L312 405 Q329 405 332 390 L344 220 Z" 
        fill="url(#juiceGradient)"/>
  
  <!-- Juice wave/surface -->
  <path d="M168 220 Q200 200, 256 220 Q312 240, 344 220 L344 240 Q312 260, 256 240 Q200 220, 168 240 Z" 
        fill="#FFAB40" opacity="0.6"/>
  
  <!-- Bubbles in juice -->
  <circle cx="200" cy="300" r="8" fill="#ffffff" opacity="0.4"/>
  <circle cx="280" cy="280" r="6" fill="#ffffff" opacity="0.3"/>
  <circle cx="240" cy="350" r="10" fill="#ffffff" opacity="0.35"/>
  <circle cx="310" cy="330" r="5" fill="#ffffff" opacity="0.3"/>
  
  <!-- Cup rim/lid -->
  <ellipse cx="256" cy="175" rx="100" ry="20" fill="#e8e8e8" stroke="#d0d0d0" stroke-width="2"/>
  <ellipse cx="256" cy="175" rx="85" ry="15" fill="#f5f5f5"/>
  
  <!-- Lid top -->
  <ellipse cx="256" cy="160" rx="95" ry="18" fill="#4CAF50"/>
  <ellipse cx="256" cy="160" rx="80" ry="14" fill="#66BB6A"/>
  
  <!-- Straw -->
  <rect x="280" y="80" width="16" height="150" rx="3" fill="url(#strawGradient)" transform="rotate(15, 288, 155)"/>
  
  <!-- Straw stripes -->
  <g transform="rotate(15, 288, 155)">
    <rect x="280" y="90" width="16" height="8" fill="#ffffff" opacity="0.5"/>
    <rect x="280" y="110" width="16" height="8" fill="#ffffff" opacity="0.5"/>
    <rect x="280" y="130" width="16" height="8" fill="#ffffff" opacity="0.5"/>
    <rect x="280" y="150" width="16" height="8" fill="#ffffff" opacity="0.5"/>
    <rect x="280" y="170" width="16" height="8" fill="#ffffff" opacity="0.5"/>
    <rect x="280" y="190" width="16" height="8" fill="#ffffff" opacity="0.5"/>
  </g>
  
  <!-- Orange slice decoration -->
  <g transform="translate(140, 120) rotate(-20)">
    <circle cx="0" cy="0" r="35" fill="#FF9800"/>
    <circle cx="0" cy="0" r="28" fill="#FFB74D"/>
    <circle cx="0" cy="0" r="20" fill="#FFCC80"/>
    <!-- Orange segments -->
    <line x1="0" y1="-20" x2="0" y2="20" stroke="#FF9800" stroke-width="2"/>
    <line x1="-17" y1="-10" x2="17" y2="10" stroke="#FF9800" stroke-width="2"/>
    <line x1="-17" y1="10" x2="17" y2="-10" stroke="#FF9800" stroke-width="2"/>
  </g>
  
  <!-- Leaf decoration -->
  <g transform="translate(130, 95)">
    <path d="M0 0 Q15 -20 30 0 Q15 5 0 0" fill="#4CAF50"/>
    <path d="M5 0 Q20 -15 30 0" fill="none" stroke="#2E7D32" stroke-width="1.5"/>
  </g>
  
  <!-- Shine on cup -->
  <path d="M175 200 Q180 300 185 380" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.3"/>
</svg>
`;

async function generateIcons() {
  const resourcesDir = path.join(__dirname, '..', 'resources');
  
  // Ensure resources directory exists
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }
  
  // Generate PNG icon (512x512) for Linux
  const pngBuffer = await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), pngBuffer);
  console.log('✓ Generated icon.png (512x512)');
  
  // Generate ICO for Windows (256x256 is the standard size for .ico)
  const icoBuffer = await sharp(Buffer.from(iconSvg))
    .resize(256, 256)
    .png()
    .toBuffer();
  
  // For proper ICO, we'll create multiple sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  const icoImages = [];
  
  for (const size of sizes) {
    const resized = await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toBuffer();
    icoImages.push({ size, buffer: resized });
  }
  
  // Create 256x256 PNG for ICO (electron-builder handles proper ICO conversion)
  const icoBuffer256 = await sharp(Buffer.from(iconSvg))
    .resize(256, 256)
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), icoBuffer256);
  console.log('✓ Generated icon.ico (256x256 PNG - electron-builder will convert)');
  
  // Generate ICNS placeholder for Mac (electron-builder will convert from PNG)
  // We'll save a 1024x1024 PNG that can be converted
  const macBuffer = await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(resourcesDir, 'icon.icns.png'), macBuffer);
  console.log('✓ Generated icon.icns.png (1024x1024) - rename to icon.icns or use png2icns');
  
  // Also save to build folder for electron
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(buildDir, 'icon.png'), pngBuffer);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer256);
  console.log('✓ Copied icons to build folder');
  
  console.log('\n🎉 Icon generation complete!');
  console.log('Icons saved to:', resourcesDir);
}

generateIcons().catch(console.error);
