// Fase 3 — Tipos do Studio

export type VideoStyle =
  | 'ugc_autentico'
  | 'publicitario'
  | 'viral_tiktok'
  | 'dancinha'
  | 'close_up'
  | 'mirror_selfie'
  | 'hook_mao_camera';

export type VideoFormat = '9:16' | '16:9' | '3:4' | '1:1';

export type GenerationMode = 'automatico' | 'manual';

export type CameraAngle =
  | 'frontal_medio'
  | 'close_up'
  | 'plano_americano'
  | 'mirror_selfie'
  | 'pov'
  | 'hook_mao';

export type SceneType =
  | 'quarto' | 'escritorio' | 'cozinha' | 'banheiro'
  | 'sala' | 'academia' | 'bar' | 'externo'
  | 'estudio' | 'loja' | 'cafe' | 'carro' | 'personalizado';

export type LightingType =
  | 'natural_suave' | 'natural_forte' | 'artificial_quente'
  | 'fluorescente_fria' | 'low_key_noturno' | 'ambiente_bar';

export type CameraMovement =
  | 'handheld_suave' | 'estatico' | 'handheld_energetico' | 'zoom_lento';

export interface TakeConfig {
  takeNumber: number;
  durationSeconds: 8;
  scene: SceneType;
  cameraAngle: CameraAngle;
  cameraStyle?: string;
  videoStyle?: VideoStyle;
  lighting: LightingType;
  cameraMovement: CameraMovement;
  productInteraction: 'vestindo' | 'segurando' | 'espelho' | 'demonstrando';
  interaction?: string;
  pose?: string;
  scenarioText?: string;
  scenarioTags?: string[];
  dialogue: string;
  veo3Prompt?: string;
  imageJob?: any;
}

export const defaultTake = (n: number): TakeConfig => ({
  takeNumber: n,
  durationSeconds: 8,
  scene: 'quarto',
  cameraAngle: 'frontal_medio',
  lighting: 'natural_suave',
  cameraMovement: 'handheld_suave',
  productInteraction: 'vestindo',
  dialogue: '',
});
