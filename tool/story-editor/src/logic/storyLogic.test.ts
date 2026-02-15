import { describe, it, expect } from "vitest";
import { createInheritedScene, validateScene } from "./storyLogic";
import type { Scene } from "../types/story";

describe("storyLogic", () => {
    describe("createInheritedScene", () => {
        it("should inherit properties from previous scene", () => {
            const prev: Scene = {
                text: "Hello",
                location: "Park",
                background: "park_bg",
                bgm: "park_music",
                avatars: [{ id: "hoshina01", action: "idle" }],
            };

            const next = createInheritedScene(prev);

            expect(next.text).toBe("");
            expect(next.location).toBe("Park");
            expect(next.background).toBe("park_bg");
            expect(next.bgm).toBe("park_music");
            expect(next.avatars).toHaveLength(1);
            expect(next.avatars![0].id).toBe("hoshina01");
            // Ensure deep copy (not same reference)
            expect(next.avatars![0]).not.toBe(prev.avatars![0]);
        });

        it("should work with undefined previous scene", () => {
            const next = createInheritedScene(undefined);
            expect(next.location).toBe("New Location");
            expect(next.avatars).toEqual([]);
        });
    });

    describe("validateScene", () => {
        const config = {
            backgrounds: new Set(["park"]),
            bgms: new Set(["music"]),
            avatars: new Set(["char1"]),
            animations: new Set(["idle"]),
        };

        it("should detect missing text and items", () => {
            const scene: Scene = { text: "", location: "test" };
            const errors = validateScene(scene, config);
            expect(errors).toContain("Text or Items must be provided.");
        });

        it("should detect invalid assets", () => {
            const scene: Scene = {
                text: "hi",
                location: "test",
                background: "invalid_bg",
                avatars: [{ id: "invalid_char", action: "idle" }],
            };
            const errors = validateScene(scene, config);
            expect(errors).toContain('Background "invalid_bg" not found in config.');
            expect(errors).toContain('Avatar "invalid_char" not found in config.');
        });

        it("should return no errors for valid scene", () => {
            const scene: Scene = {
                text: "hi",
                location: "test",
                background: "park",
                bgm: "music",
                avatars: [{ id: "char1", action: "idle" }],
            };
            const errors = validateScene(scene, config);
            expect(errors).toHaveLength(0);
        });
    });
});
