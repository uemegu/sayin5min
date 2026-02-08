import { describe, it, expect } from "vitest";
import { getRequiredAssetsForChapter, Chapter } from "./Store";

describe("getRequiredAssetsForChapter", () => {
    it("should extract unique assets from scenes", () => {
        const mockChapter: Chapter = {
            id: "ch1",
            title: "Chapter 1",
            scenes: [
                {
                    location: "loc1",
                    text: "text1",
                    avatars: [{ id: "av1", action: "act1" }],
                    bgm: "bgm1",
                    voice: "v1",
                },
                {
                    location: "loc1",
                    text: "text2",
                    avatars: [
                        { id: "av1", action: "act2" },
                        { id: "av2", action: "act1" },
                    ],
                    voice: "v2",
                },
            ],
        };

        const result = getRequiredAssetsForChapter(mockChapter);

        expect(result.avatarKeys).toContain("av1");
        expect(result.avatarKeys).toContain("av2");
        expect(result.avatarKeys).toHaveLength(2);

        expect(result.actionKeys).toContain("act1");
        expect(result.actionKeys).toContain("act2");
        expect(result.actionKeys).toHaveLength(2);

        expect(result.bgmKeys).toEqual(["bgm1"]);
        expect(result.voiceKeys).toEqual(["v1", "v2"]);
    });

    it("should return empty arrays if no assets are defined", () => {
        const mockChapter: Chapter = {
            id: "ch2",
            title: "Chapter 2",
            scenes: [
                {
                    location: "loc2",
                    text: "text2",
                },
            ],
        };

        const result = getRequiredAssetsForChapter(mockChapter);

        expect(result.avatarKeys).toEqual([]);
        expect(result.actionKeys).toEqual([]);
        expect(result.bgmKeys).toEqual([]);
        expect(result.voiceKeys).toEqual([]);
    });
});
