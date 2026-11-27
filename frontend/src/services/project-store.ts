// Persistência local e compatibilidade do modelo legado de projetos.
// O ProjectManifest passa a ser o contexto estruturado compartilhado pelos editores.

import {
    assertProjectDimensionUnchanged,
    createProjectManifest,
    validateProjectManifest,
    type ProjectManifest,
} from './project-manifest';

const STORAGE_KEY = 'lumenion:projects';

export type ProjectDimension = '2D' | '3D';
export type ScriptingMode = 'csharp' | 'lumen';

export interface ProjectConfig {
    dimension: ProjectDimension;
    scriptingMode: ScriptingMode;
    resolutionWidth: number;
    resolutionHeight: number;
    vsync: boolean;
    gravity: number;
    debugMode: boolean;
}

export interface StoredProject {
    id: number;
    image: string;
    gameName: string;
    gameInfo: string;
    config: ProjectConfig;
    createdAt: number;
    updatedAt: number;
    folderPath?: string;
    /** Manifesto completo consumido pelo Settings Editor e pelo Game Editor. */
    manifest: ProjectManifest;
}

export type SaveProjectInput = Omit<StoredProject, 'updatedAt' | 'manifest'> & {
    updatedAt?: number;
    manifest?: ProjectManifest;
};

export function defaultProjectConfig(): ProjectConfig {
    return {
        dimension: '2D',
        scriptingMode: 'csharp',
        resolutionWidth: 1920,
        resolutionHeight: 1080,
        vsync: true,
        gravity: 9.8,
        debugMode: false,
    };
}

function hydrateProject(project: Omit<StoredProject, 'manifest'> & { manifest?: ProjectManifest }): StoredProject {
    const updatedAt = project.updatedAt ?? project.createdAt ?? Date.now();
    const manifest = project.manifest && validateProjectManifest(project.manifest)
        ? createProjectManifest({ ...project, updatedAt, manifest: project.manifest })
        : createProjectManifest({ ...project, updatedAt });

    return { ...project, updatedAt, manifest };
}

function readAll(): Record<number, StoredProject> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw) as Record<number, Omit<StoredProject, 'manifest'> & { manifest?: ProjectManifest }>;
        return Object.fromEntries(
            Object.entries(parsed).map(([id, project]) => [Number(id), hydrateProject(project)]),
        );
    } catch (error) {
        console.error('Falha ao ler projetos salvos do storage:', error);
        return {};
    }
}

function writeAll(data: Record<number, StoredProject>): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Falha ao salvar projetos no storage:', error);
        throw new Error('Não foi possível persistir o projeto no armazenamento local.');
    }
}

/**
 * Cria ou atualiza um projeto. A dimensão é validada contra o registro atual
 * antes de qualquer gravação, inclusive quando a chamada vem de importação.
 */
export function saveProject(project: SaveProjectInput): StoredProject {
    const all = readAll();
    const existing = all[project.id];

    if (existing) {
        assertProjectDimensionUnchanged(existing.manifest.structure.dimension, project.config.dimension);
        if (project.manifest) {
            assertProjectDimensionUnchanged(
                existing.manifest.structure.dimension,
                project.manifest.structure.dimension,
            );
        }
    } else if (project.manifest && project.manifest.structure.dimension !== project.config.dimension) {
        throw new Error('A dimensão do manifesto não corresponde à configuração inicial do projeto.');
    }

    const createdAt = existing?.createdAt ?? project.createdAt;
    const updatedAt = Date.now();
    const toSave = hydrateProject({
        ...project,
        createdAt,
        updatedAt,
        manifest: project.manifest ?? existing?.manifest,
    });

    all[project.id] = toSave;
    writeAll(all);
    return toSave;
}

export function getProject(id: number): StoredProject | undefined {
    return readAll()[id];
}

export function getAllProjects(): StoredProject[] {
    return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteProject(id: number): void {
    const all = readAll();
    delete all[id];
    writeAll(all);
}
