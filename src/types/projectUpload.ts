/**
 * Project upload form data and metadata (maps to existing schema + embedded metadata).
 * Types use only standard primitives: string, number, boolean, null, and arrays/objects of those.
 */

export interface MaterialItem {
  id: string;
  name: string;
  quantity: string;
  link: string | null;
}

export interface InstructionStep {
  id: string;
  imageUrl: string | null;
  description: string;
  materialIds: string[];
  tools: string[];
}

export interface FileRef {
  id: string;
  name: string;
  path: string;
  type: 'stl' | '3mf' | 'gerber' | 'pdf' | 'other';
}

export interface InstructionFileRef {
  path: string;
  name: string;
}

export interface ProjectMetadata {
  tags: string[];
  imageUrls: string[];
  materials: MaterialItem[];
  instructionMode: 'maker' | 'upload';
  instructionSteps: InstructionStep[] | null;
  instructionFileRef: InstructionFileRef | null;
  fileRefs: FileRef[];
}

export const DIYVERSE_META_PREFIX = '\n\n__DIYVERSE_META_7f3a9b2c__\n';
export const DIYVERSE_META_SUFFIX = '\n';

export function parseDescriptionWithMetadata(raw: string | null): {
  description: string;
  metadata: ProjectMetadata | null;
} {
  if (!raw || typeof raw !== 'string') {
    return { description: '', metadata: null };
  }
  const idx = raw.indexOf(DIYVERSE_META_PREFIX);
  if (idx === -1) {
    return { description: raw.trim(), metadata: null };
  }
  const description = raw.slice(0, idx).trim();
  const rest = raw.slice(idx + DIYVERSE_META_PREFIX.length);
  const endIdx = rest.indexOf(DIYVERSE_META_SUFFIX);
  const jsonStr = endIdx === -1 ? rest : rest.slice(0, endIdx);
  try {
    const metadata = JSON.parse(jsonStr) as ProjectMetadata;
    return { description, metadata };
  } catch {
    return { description, metadata: null };
  }
}

export function serializeDescriptionWithMetadata(
  description: string,
  metadata: ProjectMetadata | null
): string {
  const base = description.trim();
  if (!metadata) return base;
  const jsonStr = JSON.stringify(metadata);
  return base + DIYVERSE_META_PREFIX + jsonStr + DIYVERSE_META_SUFFIX;
}

export const SUGGESTED_TAGS = [
  'electronics',
  'Arduino',
  'ESP32',
  'Raspberry Pi',
  '3D printing',
  'woodworking',
  'soldering',
  'sensors',
  'LED',
  'IoT',
  'robotics',
  'CNC',
  'laser cutting',
];

export const TITLE_MAX_LENGTH = 100;
export const SLUG_MAX_LENGTH = 80;
