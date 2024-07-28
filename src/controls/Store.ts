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

interface Avatar {
  position?: string;
  id: string;
  action: string;
  expression?: Expression;
}

interface Scene {
  avatars?: Avatar[];
  bgm?: string;
  background?: string;
  text: string;
}

interface Chapter {
  title: string;
  location: string;
  scenes: Scene[];
}

interface Store {
  config: Config;
  chapters: Chapter[];
  messageIndex: number;
  chapterIndex: number;
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
});

export default store;
