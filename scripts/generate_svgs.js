import fs from 'fs';
import path from 'path';

const carsDir = path.join(process.cwd(), 'public', 'cars');
if (!fs.existsSync(carsDir)) {
  fs.mkdirSync(carsDir, { recursive: true });
}

const models = [
  { name: 'civic', title: 'Honda Civic', color: '#E60012', type: 'sedan' },
  { name: 'accord', title: 'Honda Accord', color: '#2563EB', type: 'sedan' },
  { name: 'crv', title: 'Honda CR-V', color: '#059669', type: 'suv' },
  { name: 'pilot', title: 'Honda Pilot', color: '#7C3AED', type: 'suv' },
  { name: 'hrv', title: 'Honda HR-V', color: '#D97706', type: 'suv' },
  { name: 'passport', title: 'Honda Passport', color: '#0891B2', type: 'suv' },
  { name: 'odyssey', title: 'Honda Odyssey', color: '#4F46E5', type: 'minivan' },
  { name: 'ridgeline', title: 'Honda Ridgeline', color: '#EA580C', type: 'truck' },
  { name: 'insight', title: 'Honda Insight', color: '#10B981', type: 'hybrid' },
  { name: 'clarity', title: 'Honda Clarity', color: '#06B6D4', type: 'electric' },
  { name: 'fit', title: 'Honda Fit', color: '#EC4899', type: 'hatchback' },
  { name: 'element', title: 'Honda Element', color: '#84CC16', type: 'box' },
  { name: 's2000', title: 'Honda S2000', color: '#F43F5E', type: 'sports' },
  { name: 'default', title: 'Honda Vehicle', color: '#64748B', type: 'sedan' }
];

function generateCarSvg(title, color, type) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="350" fill="url(#bgGrad)" rx="16"/>
  <circle cx="500" cy="80" r="140" fill="${color}" opacity="0.08" />
  <circle cx="100" cy="270" r="180" fill="${color}" opacity="0.05" />

  <!-- Grid accent lines -->
  <path d="M 0 260 L 600 260" stroke="#334155" stroke-width="1" stroke-dasharray="8 8" opacity="0.4"/>

  <!-- Vehicle Silhouette Group -->
  <g filter="url(#shadow)" transform="translate(40, 40)">
    <!-- Car Body -->
    ${type === 'truck' ? `
      <path d="M 40 180 L 100 180 L 130 110 L 290 110 L 330 140 L 480 140 L 480 180 L 460 210 L 60 210 Z" fill="${color}" opacity="0.9" />
      <path d="M 140 118 L 280 118 L 315 145 L 140 145 Z" fill="#38BDF8" opacity="0.3" />
      <rect x="340" y="145" width="130" height="35" fill="#1E293B" rx="4" />
    ` : type === 'suv' ? `
      <path d="M 40 180 L 90 170 L 140 100 L 370 100 L 440 150 L 470 180 L 450 215 L 60 215 Z" fill="${color}" opacity="0.9" />
      <path d="M 150 108 L 250 108 L 250 150 L 105 150 Z" fill="#38BDF8" opacity="0.3" />
      <path d="M 260 108 L 360 108 L 420 150 L 260 150 Z" fill="#38BDF8" opacity="0.3" />
    ` : type === 'minivan' ? `
      <path d="M 40 180 L 80 160 L 160 90 L 390 90 L 450 150 L 470 180 L 450 215 L 60 215 Z" fill="${color}" opacity="0.9" />
      <path d="M 170 98 L 270 98 L 270 150 L 95 150 Z" fill="#38BDF8" opacity="0.3" />
      <path d="M 280 98 L 380 98 L 430 150 L 280 150 Z" fill="#38BDF8" opacity="0.3" />
    ` : `
      <!-- Sleek Sedan / Sports Coupe -->
      <path d="M 40 185 L 110 175 L 170 115 L 340 115 L 420 165 L 470 185 L 450 215 L 60 215 Z" fill="${color}" opacity="0.9" />
      <path d="M 180 122 L 260 122 L 260 160 L 125 160 Z" fill="#38BDF8" opacity="0.35" />
      <path d="M 270 122 L 330 122 L 400 160 L 270 160 Z" fill="#38BDF8" opacity="0.35" />
    `}

    <!-- Headlight & Taillight -->
    <path d="M 460 185 L 475 188 L 465 198 Z" fill="#60A5FA" />
    <path d="M 38 185 L 45 185 L 42 195 Z" fill="#EF4444" />

    <!-- Wheels -->
    <circle cx="130" cy="215" r="36" fill="url(#wheelGrad)" stroke="#475569" stroke-width="6"/>
    <circle cx="130" cy="215" r="18" fill="#0F172A" stroke="#94A3B8" stroke-width="4"/>
    
    <circle cx="390" cy="215" r="36" fill="url(#wheelGrad)" stroke="#475569" stroke-width="6"/>
    <circle cx="390" cy="215" r="18" fill="#0F172A" stroke="#94A3B8" stroke-width="4"/>
  </g>

  <!-- Honda Emblem Overlay -->
  <g transform="translate(40, 35)">
    <rect width="36" height="28" rx="6" fill="#0F172A" stroke="#E2E8F0" stroke-width="2" />
    <text x="18" y="21" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#E2E8F0" text-anchor="middle">H</text>
  </g>

  <!-- Label overlay -->
  <text x="560" y="315" font-family="system-ui, sans-serif" font-weight="800" font-size="22" fill="#F8FAFC" text-anchor="end" opacity="0.9">${title.toUpperCase()}</text>
  <text x="560" y="333" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="${color}" text-anchor="end" letter-spacing="2">AUTHENTIC HONDA ANALYTICS</text>
</svg>`;
}

models.forEach(m => {
  const filePath = path.join(carsDir, `${m.name}.svg`);
  fs.writeFileSync(filePath, generateCarSvg(m.title, m.color, m.type));
});

console.log('Generated car SVGs successfully!');
