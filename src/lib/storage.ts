/**
 * Storage helpers for project-assets bucket.
 * Path convention: <project_id>/images/<filename> | <project_id>/files/<filename>
 */

export function getStoragePath(projectId: string, type: 'images' | 'files', filename: string): string {
  return `${projectId}/${type}/${filename}`;
}

export function isStoragePath(url: string): boolean {
  return typeof url === 'string' && !url.startsWith('http');
}

export const AVATARS_BUCKET = 'avatars';
