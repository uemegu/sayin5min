import { proxy, subscribe } from "valtio";
import type { StoryData, Chapter, Scene } from "../types/story";
import { createInheritedScene } from "../logic/storyLogic";

interface EditorState {
    storyData: StoryData | null;
    currentChapterIndex: number;
    currentSceneIndex: number;
    history: StoryData[];
    historyIndex: number;
}

export const editorStore = proxy<EditorState>({
    storyData: null,
    currentChapterIndex: 0,
    currentSceneIndex: 0,
    history: [],
    historyIndex: -1,
});

// Helper for undo/redo
export function pushHistory() {
    if (!editorStore.storyData) return;
    const snapshot = JSON.parse(JSON.stringify(editorStore.storyData));
    editorStore.history = editorStore.history.slice(0, editorStore.historyIndex + 1);
    editorStore.history.push(snapshot);
    if (editorStore.history.length > 50) editorStore.history.shift();
    editorStore.historyIndex = editorStore.history.length - 1;
}

export function undo() {
    if (editorStore.historyIndex > 0) {
        editorStore.historyIndex--;
        editorStore.storyData = JSON.parse(JSON.stringify(editorStore.history[editorStore.historyIndex]));
    }
}

export function redo() {
    if (editorStore.historyIndex < editorStore.history.length - 1) {
        editorStore.historyIndex++;
        editorStore.storyData = JSON.parse(JSON.stringify(editorStore.history[editorStore.historyIndex]));
    }
}

// Editor Actions
export const editorActions = {
    loadStory(data: StoryData) {
        editorStore.storyData = data;
        editorStore.currentChapterIndex = 0;
        editorStore.currentSceneIndex = 0;
        pushHistory();
    },

    selectChapter(index: number) {
        editorStore.currentChapterIndex = index;
        editorStore.currentSceneIndex = 0;
    },

    selectScene(index: number) {
        editorStore.currentSceneIndex = index;
    },

    updateScene(scene: Partial<Scene>) {
        if (!editorStore.storyData) return;
        const chapter = editorStore.storyData.chapters[editorStore.currentChapterIndex];
        if (!chapter) return;
        const currentScene = chapter.scenes[editorStore.currentSceneIndex];
        if (!currentScene) return;

        Object.assign(currentScene, scene);
        pushHistory();
    },

    addScene() {
        if (!editorStore.storyData) return;
        const chapter = editorStore.storyData.chapters[editorStore.currentChapterIndex];
        if (!chapter) return;

        const previousScene = chapter.scenes[editorStore.currentSceneIndex];
        const newScene = createInheritedScene(previousScene);

        chapter.scenes.splice(editorStore.currentSceneIndex + 1, 0, newScene);
        editorStore.currentSceneIndex++;
        pushHistory();
    },

    deleteScene() {
        if (!editorStore.storyData) return;
        const chapter = editorStore.storyData.chapters[editorStore.currentChapterIndex];
        if (!chapter || chapter.scenes.length <= 1) return;

        chapter.scenes.splice(editorStore.currentSceneIndex, 1);
        if (editorStore.currentSceneIndex >= chapter.scenes.length) {
            editorStore.currentSceneIndex = chapter.scenes.length - 1;
        }
        pushHistory();
    },

    reorderScene(fromIndex: number, toIndex: number) {
        if (!editorStore.storyData) return;
        const chapter = editorStore.storyData.chapters[editorStore.currentChapterIndex];
        if (!chapter) return;

        const [moved] = chapter.scenes.splice(fromIndex, 1);
        chapter.scenes.splice(toIndex, 0, moved);
        editorStore.currentSceneIndex = toIndex;
        pushHistory();
    },

    updateConfig(type: string, list: any[]) {
        if (!editorStore.storyData) return;
        (editorStore.storyData.config as any)[type] = list;
        pushHistory();
    }
};
