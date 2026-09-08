import { DesignTemplate } from '../types';

export const STARTER_GRAPHICS: Array<{ id: string; name: string; category: string; svg: string }> = [
  {
    id: 'mountain-explore',
    name: 'Mountain Peak',
    category: 'Outdoors',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="92" fill="none" stroke="#2D3748" stroke-width="6"/>
      <path d="M40 145 L85 80 L115 120 L135 95 L165 145 Z" fill="#2D3748"/>
      <polygon points="85,80 75,95 95,95" fill="#FFFFFF"/>
      <polygon points="135,95 127,107 143,107" fill="#FFFFFF"/>
      <circle cx="140" cy="65" r="14" fill="#E28743"/>
      <line x1="30" y1="145" x2="170" y2="145" stroke="#2D3748" stroke-width="5" stroke-linecap="round"/>
      <path d="M70 162 Q100 156 130 162" fill="none" stroke="#2D3748" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'coffee-craft',
    name: 'Coffee Roastery',
    category: 'Badge',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="150" height="150" rx="20" fill="none" stroke="#1A202C" stroke-width="5"/>
      <path d="M60 85 Q100 65 140 85 L135 130 Q100 145 65 130 Z" fill="#78350F"/>
      <path d="M140 92 C155 92 165 102 165 112 C165 122 155 128 135 125" fill="none" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
      <path d="M85 68 Q90 55 85 45" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 65 Q105 52 100 42" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
      <path d="M115 68 Q120 55 115 45" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
      <text x="100" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="#1A202C" letter-spacing="3">BREW &amp; CO.</text>
    </svg>`
  },
  {
    id: 'sol-nature',
    name: 'Nordic Sun & Flora',
    category: 'Minimal',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="38" fill="#F59E0B" opacity="0.9"/>
      <path d="M100 170 C100 130 75 100 60 70 C75 90 95 105 100 130" fill="none" stroke="#065F46" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 170 C100 125 125 95 140 65 C125 85 105 100 100 125" fill="none" stroke="#065F46" stroke-width="5" stroke-linecap="round"/>
      <circle cx="60" cy="70" r="6" fill="#047857"/>
      <circle cx="140" cy="65" r="6" fill="#047857"/>
      <circle cx="85" cy="115" r="5" fill="#047857"/>
      <circle cx="115" cy="110" r="5" fill="#047857"/>
      <line x1="45" y1="175" x2="155" y2="175" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'studio-geometric',
    name: 'Bauhaus Arc',
    category: 'Abstract',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 150 A60 60 0 0 1 160 150 Z" fill="#DC2626"/>
      <circle cx="100" cy="80" r="28" fill="#2563EB"/>
      <rect x="50" y="45" width="22" height="45" rx="4" fill="#F59E0B"/>
      <line x1="30" y1="150" x2="170" y2="150" stroke="#111827" stroke-width="4"/>
      <circle cx="145" cy="65" r="8" fill="#111827"/>
    </svg>`
  }
];

export const TEMPLATES: DesignTemplate[] = [
  {
    id: 'outdoor-adventure',
    name: 'Wander & Roam',
    description: 'Crisp mountain badge with modern bold serif typography',
    previewColor: '#1E293B',
    elements: [
      {
        type: 'image',
        svgMarkup: STARTER_GRAPHICS[0].svg,
        x: 0.5,
        y: 0.44,
        scale: 0.48,
        rotation: 0
      },
      {
        type: 'text',
        text: 'WANDER OFTEN',
        fontFamily: 'Bebas Neue',
        fontSize: 42,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#1E293B',
        textAlign: 'center',
        x: 0.5,
        y: 0.72,
        scale: 1,
        rotation: 0
      },
      {
        type: 'text',
        text: 'Pacific Crest Trail — Est. 1984',
        fontFamily: 'Playfair Display',
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#64748B',
        textAlign: 'center',
        x: 0.5,
        y: 0.81,
        scale: 1,
        rotation: 0
      }
    ]
  },
  {
    id: 'artisanal-coffee',
    name: 'Roastery Club',
    description: 'Vintage cafe crest tailored for morning coffee rituals',
    previewColor: '#78350F',
    elements: [
      {
        type: 'image',
        svgMarkup: STARTER_GRAPHICS[1].svg,
        x: 0.5,
        y: 0.44,
        scale: 0.52,
        rotation: 0
      },
      {
        type: 'text',
        text: 'SLOW DRIP & ESPRESSO',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 26,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#451A03',
        textAlign: 'center',
        x: 0.5,
        y: 0.73,
        scale: 1,
        rotation: 0
      },
      {
        type: 'text',
        text: 'Roasted in Small Batches',
        fontFamily: 'Caveat',
        fontSize: 32,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#B45309',
        textAlign: 'center',
        x: 0.5,
        y: 0.83,
        scale: 1,
        rotation: 0
      }
    ]
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic Botanical',
    description: 'Clean organic lines with high-contrast editorial script',
    previewColor: '#065F46',
    elements: [
      {
        type: 'image',
        svgMarkup: STARTER_GRAPHICS[2].svg,
        x: 0.5,
        y: 0.42,
        scale: 0.5,
        rotation: 0
      },
      {
        type: 'text',
        text: 'ATELIER BOTANIQUE',
        fontFamily: 'Cinzel',
        fontSize: 30,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#064E3B',
        textAlign: 'center',
        x: 0.5,
        y: 0.72,
        scale: 1,
        rotation: 0
      },
      {
        type: 'text',
        text: 'Copenhagen • Paris • Tokyo',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#6B7280',
        textAlign: 'center',
        x: 0.5,
        y: 0.8,
        scale: 1,
        rotation: 0
      }
    ]
  },
  {
    id: 'studio-creative',
    name: 'Form & Function',
    description: 'Modernist Bauhaus typography and abstract geometry',
    previewColor: '#DC2626',
    elements: [
      {
        type: 'image',
        svgMarkup: STARTER_GRAPHICS[3].svg,
        x: 0.5,
        y: 0.42,
        scale: 0.48,
        rotation: 0
      },
      {
        type: 'text',
        text: 'FORM FOLLOWS FUNCTION',
        fontFamily: 'Space Mono',
        fontSize: 22,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#111827',
        textAlign: 'center',
        x: 0.5,
        y: 0.72,
        scale: 1,
        rotation: 0
      },
      {
        type: 'text',
        text: 'Printo Studio Configurator No. 01',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#9CA3AF',
        textAlign: 'center',
        x: 0.5,
        y: 0.8,
        scale: 1,
        rotation: 0
      }
    ]
  }
];
