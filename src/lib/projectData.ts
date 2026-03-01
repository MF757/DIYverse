/**
 * Load and save project BOM, instruction steps, and files from Supabase tables.
 * Uses only standard types: string, number, boolean, null, string[].
 */

import { supabase } from './supabase/browserClient';
import type { MaterialItem, InstructionStep, FileRef } from '../types/projectUpload';
import type { ProjectFileType } from './supabase/database.types';
import { PROJECT_ASSETS_BUCKET } from './storage';

/** Load gallery image paths (project_images) for a project, in order. */
export async function loadProjectImages(projectId: string): Promise<string[]> {
  if (!projectId || typeof projectId !== 'string') return [];
  const { data, error } = await supabase
    .from('project_images')
    .select('storage_path')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (error || !data || !Array.isArray(data)) return [];
  return data
    .map((row) => (typeof row.storage_path === 'string' ? row.storage_path.trim() : ''))
    .filter((p) => p.length > 0);
}

/** Load BOM (project_components) for a project. Returns items ordered by sort_order. */
export async function loadProjectBom(projectId: string): Promise<MaterialItem[]> {
  const { data, error } = await supabase
    .from('project_components')
    .select('id, name, quantity, link')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  if (!data || !Array.isArray(data)) return [];
  return data.map((row) => ({
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : '',
    quantity: typeof row.quantity === 'string' ? row.quantity : '1',
    link: row.link != null && typeof row.link === 'string' ? row.link : null,
  }));
}

/** Load instruction steps with step–component links. Ordered by sort_order. */
export async function loadProjectInstructionSteps(projectId: string): Promise<InstructionStep[]> {
  const { data: steps, error: stepsErr } = await supabase
    .from('project_instruction_steps')
    .select('id, sort_order, description, image_path, tools')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (stepsErr || !steps || !Array.isArray(steps) || steps.length === 0) return [];

  const stepIds = steps.map((s) => s.id);
  const { data: links } = await supabase
    .from('project_instruction_step_components')
    .select('step_id, component_id')
    .in('step_id', stepIds);
  const linksByStep = new Map<string, string[]>();
  for (const row of links ?? []) {
    const stepId = typeof row.step_id === 'string' ? row.step_id : '';
    const compId = typeof row.component_id === 'string' ? row.component_id : '';
    if (!stepId || !compId) continue;
    const arr = linksByStep.get(stepId) ?? [];
    arr.push(compId);
    linksByStep.set(stepId, arr);
  }

  return steps.map((row) => ({
    id: typeof row.id === 'string' ? row.id : '',
    description: typeof row.description === 'string' ? row.description : '',
    imageUrl: row.image_path != null && typeof row.image_path === 'string' ? row.image_path : null,
    materialIds: linksByStep.get(row.id) ?? [],
    tools: Array.isArray(row.tools) ? row.tools.filter((t): t is string => typeof t === 'string') : [],
  }));
}

/** Load downloadable files (project_files) for a project. */
export async function loadProjectFiles(projectId: string): Promise<FileRef[]> {
  if (!projectId || typeof projectId !== 'string') return [];
  const { data, error } = await supabase
    .from('project_files')
    .select('id, name, storage_path, file_type')
    .eq('project_id', projectId);
  if (error) return [];
  if (!data || !Array.isArray(data)) return [];
  const typeMap: Record<string, FileRef['type']> = {
    stl: 'stl',
    '3mf': '3mf',
    gerber: 'gerber',
    pdf: 'pdf',
    other: 'other',
  };
  const result: FileRef[] = [];
  for (const row of data) {
    const id = typeof row.id === 'string' ? row.id : '';
    const name = typeof row.name === 'string' ? row.name : '';
    const path = typeof row.storage_path === 'string' ? String(row.storage_path).trim() : '';
    if (!path) continue;
    const type = typeMap[String(row.file_type)] ?? 'other';
    result.push({ id, name: name || 'download', path, type });
  }
  return result;
}

/**
 * Save BOM: replace all components for the project.
 * Returns a Map from original material id (form) to new DB component id, for linking steps.
 */
export async function saveProjectBom(
  projectId: string,
  materials: MaterialItem[]
): Promise<Map<string, string>> {
  await supabase.from('project_components').delete().eq('project_id', projectId);
  const toInsert = materials.filter((m) => typeof m.name === 'string' && m.name.trim().length > 0);
  const idMap = new Map<string, string>();
  if (toInsert.length === 0) return idMap;
  const rows = toInsert.map((m, i) => ({
    project_id: projectId,
    name: m.name.trim(),
    quantity: typeof m.quantity === 'string' && m.quantity.trim() ? m.quantity.trim() : '1',
    link: m.link != null && typeof m.link === 'string' && m.link.trim() ? m.link.trim() : null,
    sort_order: i,
  }));
  const { data: inserted } = await supabase.from('project_components').insert(rows).select('id');
  if (inserted && Array.isArray(inserted)) {
    toInsert.forEach((m, i) => {
      const newId = inserted[i]?.id;
      if (typeof m.id === 'string' && typeof newId === 'string') idMap.set(m.id, newId);
    });
  }
  return idMap;
}

/**
 * Save instruction steps: replace all steps and step–component links.
 * materialsWithNewIds: materials after saveProjectBom, so id is the DB component id.
 * formSteps: steps with materialIds that refer to form material ids; formMaterialIdToComponentId maps those to DB component ids.
 */
export async function saveProjectInstructionSteps(
  projectId: string,
  formSteps: InstructionStep[],
  formMaterialIdToComponentId: Map<string, string>
): Promise<void> {
  await supabase.from('project_instruction_steps').delete().eq('project_id', projectId);
  if (formSteps.length === 0) return;

  const stepsToInsert = formSteps.map((s, i) => ({
    project_id: projectId,
    sort_order: i,
    description: typeof s.description === 'string' ? s.description.trim() : '',
    image_path: s.imageUrl != null && typeof s.imageUrl === 'string' ? s.imageUrl : null,
    tools: Array.isArray(s.tools) ? s.tools.filter((t): t is string => typeof t === 'string') : [],
  })).filter((s) => s.description.length > 0);

  const { data: inserted } = await supabase
    .from('project_instruction_steps')
    .insert(stepsToInsert)
    .select('id, sort_order');
  if (!inserted || inserted.length === 0) return;

  const stepComponentRows: { step_id: string; component_id: string }[] = [];
  for (let i = 0; i < formSteps.length; i++) {
    const formStep = formSteps[i];
    const stepRow = inserted.find((r) => r.sort_order === i);
    if (!stepRow || !formStep.materialIds?.length) continue;
    const stepId = stepRow.id;
    for (const formMaterialId of formStep.materialIds) {
      const componentId = formMaterialIdToComponentId.get(formMaterialId);
      if (componentId) stepComponentRows.push({ step_id: stepId, component_id: componentId });
    }
  }
  if (stepComponentRows.length > 0) {
    await supabase.from('project_instruction_step_components').insert(stepComponentRows);
  }
}

const FILE_TYPES: FileRef['type'][] = ['stl', '3mf', 'gerber', 'pdf', 'other'];

/** Save gallery images: replace all project_images for the project (ordered paths). */
export async function saveProjectImages(projectId: string, storagePaths: string[]): Promise<string | null> {
  if (!projectId || typeof projectId !== 'string') return 'Invalid project.';
  const paths = storagePaths
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter((p) => p.length > 0);
  const { error: deleteErr } = await supabase.from('project_images').delete().eq('project_id', projectId);
  if (deleteErr) return deleteErr.message ?? 'Failed to update images.';
  if (paths.length === 0) return null;
  const rows = paths.map((storage_path, i) => ({
    project_id: projectId,
    sort_order: i,
    storage_path,
  }));
  const { error: insertErr } = await supabase.from('project_images').insert(rows);
  if (insertErr) return insertErr.message ?? 'Failed to save images.';
  return null;
}

/**
 * Save files: delta update (delete only removed, insert only new). Avoids losing all file refs if insert fails.
 * Uses storage_path as stable key; name/type can change.
 */
export async function saveProjectFiles(projectId: string, fileRefs: FileRef[]): Promise<string | null> {
  if (!projectId || typeof projectId !== 'string') return 'Invalid project.';
  const typeMap: Record<FileRef['type'], ProjectFileType> = {
    stl: 'stl',
    '3mf': '3mf',
    gerber: 'gerber',
    pdf: 'pdf',
    other: 'other',
  };
  const validRefs = fileRefs
    .filter((f) => {
      const name = typeof f.name === 'string' ? f.name.trim() : '';
      const path = typeof f.path === 'string' ? f.path.trim() : '';
      return name.length > 0 && path.length > 0;
    })
    .map((f) => ({
      id: f.id,
      name: (typeof f.name === 'string' ? f.name.trim() : '') || 'download',
      path: (typeof f.path === 'string' ? f.path.trim() : '') as string,
      type: typeMap[FILE_TYPES.includes(f.type) ? f.type : 'other'] as ProjectFileType,
    }));
  const pathsSet = new Set(validRefs.map((r) => r.path));

  const { data: existing } = await supabase
    .from('project_files')
    .select('id, storage_path')
    .eq('project_id', projectId);
  const existingList = Array.isArray(existing) ? existing : [];
  const toDelete = existingList.filter((row) => {
    const p = typeof row.storage_path === 'string' ? row.storage_path.trim() : '';
    return p.length > 0 && !pathsSet.has(p);
  });
  for (const row of toDelete) {
    const id = typeof row.id === 'string' ? row.id : '';
    if (id) await supabase.from('project_files').delete().eq('id', id);
  }
  const existingPaths = new Set(existingList.map((row) => (typeof row.storage_path === 'string' ? row.storage_path.trim() : '')));
  const toInsert = validRefs.filter((r) => !existingPaths.has(r.path));
  if (toInsert.length === 0) return null;
  const insertRows = toInsert.map((r) => ({
    project_id: projectId,
    name: r.name,
    storage_path: r.path,
    file_type: r.type,
  }));
  const { error: insertErr } = await supabase.from('project_files').insert(insertRows);
  if (insertErr) return insertErr.message ?? 'Failed to save files.';
  return null;
}

/** Get public URL for a storage path (e.g. for downloads). */
export function getProjectFilePublicUrl(storagePath: string): string {
  const path = typeof storagePath === 'string' ? storagePath.trim() : '';
  if (!path) return '#';
  const { data } = supabase.storage.from(PROJECT_ASSETS_BUCKET).getPublicUrl(path);
  return (data?.publicUrl && typeof data.publicUrl === 'string') ? data.publicUrl : path;
}
