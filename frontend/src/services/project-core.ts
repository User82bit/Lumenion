/**
 * Fachada central do ciclo de vida do projeto.
 * Os editores devem consumir e alterar o projeto por esta camada, evitando
 * manter modelos de configuração independentes.
 */
import {
  getProject,
  saveProject,
  type ProjectConfig,
  type StoredProject,
  type SaveProjectInput,
} from './project-store';
import type { ProjectManifest } from './project-manifest';

export type ProjectCoreEvent =
  | { type: 'project.opened'; projectId: number; manifest: ProjectManifest }
  | { type: 'project.saved'; projectId: number; manifest: ProjectManifest }
  | { type: 'project.settings.updated'; projectId: number; manifest: ProjectManifest }
  | { type: 'project.closed'; projectId: number };

type ProjectCoreListener = (event: ProjectCoreEvent) => void;
const listeners = new Set<ProjectCoreListener>();

function publish(event: ProjectCoreEvent): void {
  listeners.forEach((listener) => listener(event));
}

export function subscribeToProjectEvents(listener: ProjectCoreListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Persiste identidade e configurações pela camada central do projeto. */
export function saveProjectContext(input: SaveProjectInput): StoredProject {
  const saved = saveProject(input);
  publish({ type: 'project.saved', projectId: saved.id, manifest: saved.manifest });
  return saved;
}

/** Retorna o registro completo e o manifesto central do projeto. */
export function getProjectContext(projectId: number): StoredProject | undefined {
  const project = getProject(projectId);
  if (project) {
    publish({ type: 'project.opened', projectId, manifest: project.manifest });
  }
  return project;
}

/**
 * Atualiza somente configurações editáveis. A dimensão não faz parte do tipo
 * de patch e também é protegida novamente pela persistência.
 */
export function updateProjectSettings(
  projectId: number,
  patch: Partial<Omit<ProjectConfig, 'dimension'>>,
): StoredProject {
  const current = getProject(projectId);
  if (!current) throw new Error(`Projeto ${projectId} não encontrado.`);

  const updated = saveProject({
    ...current,
    config: { ...current.config, ...patch, dimension: current.manifest.structure.dimension },
  });

  publish({ type: 'project.settings.updated', projectId, manifest: updated.manifest });
  publish({ type: 'project.saved', projectId, manifest: updated.manifest });
  return updated;
}

export function notifyProjectClosed(projectId: number): void {
  publish({ type: 'project.closed', projectId });
}
