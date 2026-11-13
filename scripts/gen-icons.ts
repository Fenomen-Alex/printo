import fs from 'fs';
import path from 'path';

const ICONS_DIR = path.join(
  'node_modules',
  'lucide-react',
  'dist',
  'esm',
  'icons'
);

// Desired icon keys -> lucide file names (without .js)
const ICON_MAP: Record<string, string> = {
  camera: 'camera',
  rotateCw: 'rotate-cw',
  refresh: 'refresh-cw',
  upload: 'upload',
  image: 'image',
  type: 'type',
  sparkles: 'sparkles',
  trash: 'trash',
  shirt: 'shirt',
  mug: 'beer',
  menu: 'menu',
  x: 'x',
  check: 'check',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  sliders: 'sliders',
  eye: 'eye',
  eyeOff: 'eye-off',
  hoodie: 'shirt',
  phone: 'smartphone',
  bottle: 'bottle-wine',
  backpack: 'backpack',
  cap: 'hat-glasses',
};

function resolveReexport(filePath: string): string {
  const src = fs.readFileSync(filePath, 'utf8');
  const m = src.match(/export\s*\{[^}]*default[^}]*\}\s*from\s*['"](\.\/[^'"]+)['"]/);
  if (m) {
    const dir = path.dirname(filePath);
    return resolveReexport(path.resolve(dir, m[1]));
  }
  return filePath;
}

function extractIconNode(filePath: string): any[] {
  const resolved = resolveReexport(filePath);
  const src = fs.readFileSync(resolved, 'utf8');
  const start = src.indexOf('const __iconNode = [');
  if (start === -1) throw new Error(`No __iconNode in ${filePath}`);
  const bracketStart = src.indexOf('[', start);
  let depth = 0;
  let end = -1;
  for (let i = bracketStart; i < src.length; i++) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end === -1) throw new Error(`Unbalanced __iconNode in ${filePath}`);
  // eslint-disable-next-line no-eval
  const node = eval('(' + src.slice(bracketStart, end) + ')');
  return node;
}

function attrString(attrs: Record<string, any>): string {
  return Object.entries(attrs)
    .filter(([k]) => k !== 'key')
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
}

function nodeToSvg(node: any[]): string {
  return node
    .map((item) => {
      const [tag, attrs] = item;
      const attrStr = attrs ? attrString(attrs) : '';
      const selfClose = ['br', 'hr', 'img', 'input'].includes(tag);
      return selfClose ? `<${tag} ${attrStr}/>` : `<${tag} ${attrStr}></${tag}>`;
    })
    .join('');
}

const out: string[] = [
  `// AUTO-GENERATED from lucide-react v0.546.0 icon nodes.`,
  `// Do not edit by hand. Re-run scripts/gen-icons.ts to regenerate.`,
  `export const ICONS: Record<string, string> = {`
];

for (const [key, fileName] of Object.entries(ICON_MAP)) {
  const filePath = path.join(ICONS_DIR, `${fileName}.js`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing icon file for ${key}: ${filePath}`);
    continue;
  }
  const node = extractIconNode(filePath);
  const svgInner = nodeToSvg(node);
  const svg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgInner}</svg>`;
  out.push(`  ${key}: \`${svg.replace(/`/g, '\\`')}\`,`);
}

out.push('};');

fs.writeFileSync('src/ui/icons.ts', out.join('\n') + '\n');
console.log('Wrote src/ui/icons.ts with', Object.keys(ICON_MAP).length, 'icons');