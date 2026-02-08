import { Vector3 } from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { proxy } from "valtio";
import * as THREE from "three";

interface ConfigItem {
  key: string;
  value: string;
  option?: string;
}

interface Config {
  avatars: ConfigItem[];
  animations: ConfigItem[];
  backgrounds: ConfigItem[];
  textures: ConfigItem[];
  bgms: ConfigItem[];
  voices: ConfigItem[];
}

export type Expression = "normal" | "sad" | "angry" | "happy" | "surprised";
export type Face = "redface";
export type Effect = "light" | "dark";

export interface Avatar {
  id: string;
  action: string;
  expression?: Expression;
  attension?: boolean;
  zoom?: boolean;
  face?: Face;
}

export interface Item {
  text: string;
  flg?: string;
}

export interface Scene {
  id?: string;
  conditions?: string[];
  avatars?: Avatar[];
  bgm?: string;
  voice?: string;
  background?: string;
  text: string;
  items?: Item[];
  location: string;
  effect?: Effect;
  image?: string;
  goto?: string;
}

export interface Chapter {
  id: string;
  conditions?: string[];
  title: string;
  scenes: Scene[];
}

export interface RequiredAssets {
  avatarKeys: string[];
  actionKeys: string[];
  bgmKeys: string[];
  voiceKeys: string[];
}

export interface Store {
  config: Config;
  chapters: Chapter[];
  version: number;
  phoneme: string | undefined;
}

export interface GameStatus {
  cameraDirection: Vector3 | null;
  messageIndex: number;
  chapterIndex: number;
  flags: string[];
  version: number;
  isTransitioning: boolean;
  isLoading: boolean;
}

export const gamgeConfig = proxy<Store>({
  config: {
    avatars: [],
    animations: [],
    backgrounds: [],
    textures: [],
    bgms: [],
    voices: [],
  },
  chapters: [
    {
      id: "",
      title: "",
      scenes: [],
    },
  ],
  version: 1,
  phoneme: "",
});

export const gameStatus = proxy<GameStatus>({
  cameraDirection: null,
  messageIndex: 0,
  chapterIndex: -1,
  flags: [],
  version: 1,
  isTransitioning: false,
  isLoading: false,
});

export interface SavedItem {
  screenShot: string;
  gameStatus: GameStatus;
  savedData: string;
  location: string;
  text: string;
}

export const avatarCache: Array<{ key: string; value: GLTF | null }> = [];
export const animationCache: Array<{
  key: string;
  value: THREE.Group<THREE.Object3DEventMap> | null;
}> = [];
export const animationClipCache: Array<{
  key: string;
  value: THREE.AnimationClip;
}> = [];
export const imangeCache: Array<{ key: string; value: THREE.Texture | null }> =
  [];

export function getRequiredAssetsForChapter(chapter: Chapter): RequiredAssets {
  const avatarKeySet = new Set<string>();
  const actionKeySet = new Set<string>();
  const bgmKeySet = new Set<string>();
  const voiceKeySet = new Set<string>();

  chapter.scenes.forEach((s) => {
    s.avatars?.forEach((a) => {
      avatarKeySet.add(a.id);
      actionKeySet.add(a.action);
    });
    if (s.bgm) bgmKeySet.add(s.bgm);
    if (s.voice) voiceKeySet.add(s.voice);
  });

  return {
    avatarKeys: Array.from(avatarKeySet),
    actionKeys: Array.from(actionKeySet),
    bgmKeys: Array.from(bgmKeySet),
    voiceKeys: Array.from(voiceKeySet),
  };
}
