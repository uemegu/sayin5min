import { Vector3 } from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { proxy } from "valtio";
import * as THREE from "three";

interface ConfigItem {
  key: string;
  value: string;
}

interface Config {
  avatars: ConfigItem[];
  animations: ConfigItem[];
  backgrounds: ConfigItem[];
  bgms: ConfigItem[];
  voices: ConfigItem[];
}

export type Expression = "normal" | "sad" | "angry" | "happy";

export interface Avatar {
  id: string;
  action: string;
  expression?: Expression;
  attension?: boolean;
}

export interface Item {
  text: string;
  flg?: string;
}

export interface Scene {
  avatars?: Avatar[];
  bgm?: string;
  voice?: string;
  background?: string;
  text: string;
  items?: Item[];
  location: string;
}

export interface Chapter {
  title: string;
  scenes: Scene[];
}

export interface Store {
  config: Config;
  chapters: Chapter[];
  messageIndex: number;
  chapterIndex: number;
  cameraDirection: Vector3 | null;
  flags: string[];
  version: number;
}

const store = proxy<Store>({
  config: {
    avatars: [],
    animations: [],
    backgrounds: [],
    bgms: [],
    voices: [],
  },
  chapters: [
    {
      title: "",
      scenes: [],
    },
  ],
  messageIndex: 0,
  chapterIndex: -1,
  cameraDirection: null,
  flags: [],
  version: 1,
});

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

export default store;
