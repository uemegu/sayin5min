import type { Scene, Avatar } from "../types/story";

/**
 * Creates a new scene inheriting properties from the previous scene.
 */
export function createInheritedScene(previousScene: Scene | undefined): Scene {
    if (!previousScene) {
        return {
            text: "",
            location: "New Location",
            background: "",
            bgm: "",
            avatars: [],
        };
    }

    // Deep copy avatars to avoid mutations
    const inheritedAvatars: Avatar[] = previousScene.avatars
        ? previousScene.avatars.map((a) => ({ ...a }))
        : [];

    return {
        text: "",
        location: previousScene.location,
        background: previousScene.background,
        bgm: previousScene.bgm,
        avatars: inheritedAvatars,
        effect: previousScene.effect,
    };
}

/**
 * Validates a scene for common errors.
 */
export function validateScene(scene: Scene, config: { [key: string]: Set<string> }): string[] {
    const errors: string[] = [];

    if (!scene.text && !scene.items) {
        errors.push("Text or Items must be provided.");
    }

    if (scene.background && !config.backgrounds?.has(scene.background)) {
        errors.push(`Background "${scene.background}" not found in config.`);
    }

    if (scene.bgm && !config.bgms?.has(scene.bgm)) {
        errors.push(`BGM "${scene.bgm}" not found in config.`);
    }

    if (scene.avatars) {
        scene.avatars.forEach((a) => {
            if (!config.avatars?.has(a.id)) {
                errors.push(`Avatar "${a.id}" not found in config.`);
            }
            if (a.action && !config.animations?.has(a.action)) {
                errors.push(`Animation "${a.action}" for avatar "${a.id}" not found in config.`);
            }
        });
    }

    return errors;
}
