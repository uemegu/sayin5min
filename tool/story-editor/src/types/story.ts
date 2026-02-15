export type Expression = "normal" | "sad" | "angry" | "happy" | "surprised";
export type Face = "redface";
export type Effect = "light" | "dark";

export interface ConfigItem {
    key: string;
    value: string;
    option?: string;
}

export interface Config {
    avatars: ConfigItem[];
    animations: ConfigItem[];
    backgrounds: ConfigItem[];
    textures: ConfigItem[];
    bgms: ConfigItem[];
    voices: ConfigItem[];
}

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

export interface StoryData {
    config: Config;
    chapters: Chapter[];
    version: number;
}
