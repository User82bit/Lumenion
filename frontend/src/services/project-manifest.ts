/**
 * Contrato persistente do projeto Lumenion.
 *
 * manifestVersion versiona este schema, não a engine nem o pacote .light.
 * Os campos de settings adicionais são JSON serializável para permitir
 * evolução gradual sem inventar opções que a engine ainda não implementa.
 */
import type { ProjectConfig } from './project-store';

export type ProjectJsonValue =
  | string
  | number
  | boolean
  | null
  | ProjectJsonValue[]
  | { [key: string]: ProjectJsonValue };

export type ProjectJsonObject = Record<string, ProjectJsonValue>;

export interface ProjectManifest {
  manifestVersion: 1;
  identity: {
    id: string;
    name: string;
    description: string;
    image: string;
    createdAt: number;
    updatedAt: number;
  };
  structure: {
    dimension: ProjectConfig['dimension'];
    templateId: string;
    scriptingMode: ProjectConfig['scriptingMode'];
  };
  settings: {
    display: {
      resolutionWidth: number;
      resolutionHeight: number;
      vsync: boolean;
    };
    physics: {
      gravity: number;
    };
    diagnostics: {
      debugMode: boolean;
    };
    rendering: ProjectJsonObject;
    input: ProjectJsonObject;
    audio: ProjectJsonObject;
    camera: ProjectJsonObject;
    advanced: ProjectJsonObject;
  };
  content: {
    scenes: Array<{ id: string; path: string }>;
    scripts: Array<{ id: string; path: string }>;
    assets: Array<{ id: string; path: string; type: string }>;
  };
  extensions: Array<{
    id: string;
    version?: string;
    optional?: boolean;
  }>;
  compatibility: {
    engineVersion?: string;
    minimumEngineVersion?: string;
  };
}

export interface ProjectManifestInput {
  id: number;
  image: string;
  gameName: string;
  gameInfo: string;
  config: ProjectConfig;
  createdAt: number;
  updatedAt: number;
  manifest?: ProjectManifest;
}

export function createProjectManifest(project: ProjectManifestInput): ProjectManifest {
  const existing = project.manifest;

  if (existing) {
    return {
      ...existing,
      manifestVersion: 1,
      identity: {
        ...existing.identity,
        id: String(project.id),
        name: project.gameName,
        description: project.gameInfo,
        image: project.image,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      structure: {
        ...existing.structure,
        dimension: project.config.dimension,
        scriptingMode: project.config.scriptingMode,
      },
      settings: {
        ...existing.settings,
        display: {
          ...existing.settings.display,
          resolutionWidth: project.config.resolutionWidth,
          resolutionHeight: project.config.resolutionHeight,
          vsync: project.config.vsync,
        },
        physics: { ...existing.settings.physics, gravity: project.config.gravity },
        diagnostics: { ...existing.settings.diagnostics, debugMode: project.config.debugMode },
      },
    };
  }

  return {
    manifestVersion: 1,
    identity: {
      id: String(project.id),
      name: project.gameName,
      description: project.gameInfo,
      image: project.image,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    structure: {
      dimension: project.config.dimension,
      templateId: 'custom',
      scriptingMode: project.config.scriptingMode,
    },
    settings: {
      display: {
        resolutionWidth: project.config.resolutionWidth,
        resolutionHeight: project.config.resolutionHeight,
        vsync: project.config.vsync,
      },
      physics: { gravity: project.config.gravity },
      diagnostics: { debugMode: project.config.debugMode },
      rendering: {},
      input: {},
      audio: {},
      camera: {},
      advanced: {},
    },
    content: { scenes: [], scripts: [], assets: [] },
    extensions: [],
    compatibility: {},
  };
}

export function validateProjectManifest(value: unknown): value is ProjectManifest {
  if (!value || typeof value !== 'object') return false;
  const manifest = value as Partial<ProjectManifest>;
  const identity = manifest.identity;
  const structure = manifest.structure;
  const settings = manifest.settings;
  const content = manifest.content;

  return manifest.manifestVersion === 1
    && !!identity
    && typeof identity.id === 'string'
    && typeof identity.name === 'string'
    && typeof identity.description === 'string'
    && typeof identity.image === 'string'
    && typeof identity.createdAt === 'number'
    && typeof identity.updatedAt === 'number'
    && !!structure
    && (structure.dimension === '2D' || structure.dimension === '3D')
    && typeof structure.templateId === 'string'
    && (structure.scriptingMode === 'csharp' || structure.scriptingMode === 'lumen')
    && !!settings
    && !!settings.display
    && Number.isFinite(settings.display.resolutionWidth)
    && Number.isFinite(settings.display.resolutionHeight)
    && typeof settings.display.vsync === 'boolean'
    && !!settings.physics
    && Number.isFinite(settings.physics.gravity)
    && !!settings.diagnostics
    && typeof settings.diagnostics.debugMode === 'boolean'
    && !!settings.rendering && typeof settings.rendering === 'object'
    && !!settings.input && typeof settings.input === 'object'
    && !!settings.audio && typeof settings.audio === 'object'
    && !!settings.camera && typeof settings.camera === 'object'
    && !!settings.advanced && typeof settings.advanced === 'object'
    && !!content
    && Array.isArray(content.scenes)
    && Array.isArray(content.scripts)
    && Array.isArray(content.assets)
    && Array.isArray(manifest.extensions)
    && !!manifest.compatibility;
}

/** Lança erro em vez de permitir conversão estrutural acidental. */
export function assertProjectDimensionUnchanged(
  current: ProjectManifest['structure']['dimension'],
  requested: ProjectManifest['structure']['dimension'],
): void {
  if (current !== requested) {
    throw new Error(
      `A dimensão do projeto é imutável. O projeto foi criado em ${current} e não pode ser alterado para ${requested}.`,
    );
  }
}
