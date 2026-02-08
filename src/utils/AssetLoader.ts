import { useEffect, useMemo } from "react";
import {
  gamgeConfig,
  animationCache,
  avatarCache,
  getRequiredAssetsForChapter,
} from "../controls/Store";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

const AssetLoader: React.FC<{
  chapterIndex: number;
  onLoadComplete: () => void;
}> = ({ chapterIndex, onLoadComplete }) => {
  const assets = useMemo(() => {
    if (chapterIndex < 0 || !gamgeConfig.chapters[chapterIndex]) {
      return { gltfPaths: [], animationPaths: [] };
    }

    const chapter = gamgeConfig.chapters[chapterIndex];
    const required = getRequiredAssetsForChapter(chapter);

    const gltfPaths: string[] = [];
    const animationPaths: string[] = [];

    required.avatarKeys.forEach((key) => {
      const avatarConfig = gamgeConfig.config.avatars.find(
        (av) => av.key === key
      );
      if (avatarConfig) {
        if (avatarCache.find((r) => r.key === avatarConfig.value)) return;
        gltfPaths.push(avatarConfig.value);
      }
    });

    required.actionKeys.forEach((key) => {
      const animationConfig = gamgeConfig.config.animations.find(
        (av) => av.key === key
      );
      if (animationConfig) {
        if (animationCache.find((r) => r.key === animationConfig.value)) return;
        animationPaths.push(animationConfig.value);
      }
    });

    return { gltfPaths, animationPaths, required };
  }, [chapterIndex]);

  // Cleanup logic
  useEffect(() => {
    if (chapterIndex < 0) return;

    const chapter = gamgeConfig.chapters[chapterIndex];
    const required = getRequiredAssetsForChapter(chapter);

    const requiredAvatarPaths = required.avatarKeys
      .map((key) => gamgeConfig.config.avatars.find((av) => av.key === key)?.value)
      .filter(Boolean) as string[];

    const requiredAnimationPaths = required.actionKeys
      .map(
        (key) =>
          gamgeConfig.config.animations.find((av) => av.key === key)?.value
      )
      .filter(Boolean) as string[];

    // Cleanup avatarCache
    for (let i = avatarCache.length - 1; i >= 0; i--) {
      if (!requiredAvatarPaths.includes(avatarCache[i].key)) {
        const entry = avatarCache[i];
        if (entry.value) {
          entry.value.scene.traverse((obj: any) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((m: any) => m.dispose());
              } else {
                obj.material.dispose();
              }
            }
          });
        }
        avatarCache.splice(i, 1);
      }
    }

    // Cleanup animationCache
    for (let i = animationCache.length - 1; i >= 0; i--) {
      if (!requiredAnimationPaths.includes(animationCache[i].key)) {
        animationCache.splice(i, 1);
      }
    }
  }, [chapterIndex]);

  const tasks: Array<Promise<any>> = [];
  assets.animationPaths.forEach((path) => {
    const fbxLoader = new FBXLoader();
    tasks.push(
      new Promise((resolve, reject) => {
        fbxLoader.load(
          path,
          (obj: THREE.Group) => {
            animationCache.push({ key: path, value: obj });
            resolve(obj);
          },
          undefined,
          reject
        );
      })
    );
  });

  // Load animations
  useEffect(() => {
    if (tasks.length > 0) {
      Promise.all(tasks).then(() => {
        onLoadComplete();
      });
    } else {
      onLoadComplete();
    }
  }, [assets.animationPaths, onLoadComplete]);

  const gltf = useLoader(GLTFLoader, assets.gltfPaths, (loader) => {
    loader.register((parser: any) => new VRMLoaderPlugin(parser));
  });

  useEffect(() => {
    assets.gltfPaths.forEach((path, index) => {
      const existing = avatarCache.find((r) => r.key === path);
      if (existing) {
        existing.value = gltf[index] as any;
      } else {
        avatarCache.push({ key: path, value: gltf[index] as any });
      }
    });

    if (assets.gltfPaths.length > 0) {
      // If gltf loading happened, it might have suspended, 
      // but once here, it's done.
      // However, we still need to wait for animation tasks if any.
    }
  }, [gltf, assets.gltfPaths]);

  return null;
};

export default AssetLoader;
