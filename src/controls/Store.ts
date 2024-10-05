import { Vector3 } from "three";
import { proxy } from "valtio";

interface ConfigItem {
  key: string;
  value: string;
}

interface Config {
  avatars: ConfigItem[];
  animations: ConfigItem[];
  backgrounds: ConfigItem[];
  bgms: ConfigItem[];
}

export type Expression = "normal" | "sad" | "angry" | "happy";

export interface Avatar {
  position?: string;
  id: string;
  action: string;
  expression?: Expression;
  attension?: boolean;
}

export interface Scene {
  avatars?: Avatar[];
  bgm?: string;
  background?: string;
  text: string;
}

export interface Chapter {
  title: string;
  location: string;
  scenes: Scene[];
}

export interface Store {
  config: Config;
  chapters: Chapter[];
  messageIndex: number;
  chapterIndex: number;
  cameraDirection: Vector3 | null;
}

const store = proxy<Store>({
  config: {
    avatars: [],
    animations: [],
    backgrounds: [],
    bgms: [],
  },
  chapters: [
    {
      title: "",
      location: "",
      scenes: [],
    },
  ],
  messageIndex: 0,
  chapterIndex: 0,
  cameraDirection: null,
});

export default store;
