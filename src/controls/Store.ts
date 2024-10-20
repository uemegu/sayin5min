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
  chapterIndex: 0,
  cameraDirection: null,
  flags: [],
});

export default store;
