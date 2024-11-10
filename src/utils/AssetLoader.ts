import { useEffect, useMemo } from "react";
import {
  gameStatus,
  gamgeConfig,
  animationCache,
  avatarCache,
  imangeCache,
} from "../controls/Store";
import { useSnapshot } from "valtio";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const AssetLoader: React.FC<{ onLoadComplete: () => void }> = ({
  onLoadComplete,
}) => {
  const { chapterIndex } = useSnapshot(gameStatus);

  const assets = useMemo(() => {
    const gltfPaths: string[] = [];
    const animationPaths: string[] = [];
    const imagePaths: string[] = [];

    const avatarKeySet = new Set<string>();
    const actionKeySet = new Set<string>();
    const audioKeySet = new Set<string>();
    const imageKeySet = new Set<string>();

    gamgeConfig.chapters[chapterIndex]?.scenes.forEach((s) => {
      s.avatars?.forEach((a) => {
        avatarKeySet.add(a.id);
        actionKeySet.add(a.action);
      });
      if (s.bgm) audioKeySet.add(s.bgm);
      if (s.voice) audioKeySet.add(s.voice);
      if (s.background) imageKeySet.add(s.background);
    });

    avatarKeySet.forEach((key) => {
      const avatarConfig = gamgeConfig.config.avatars.find(
        (av) => av.key === key
      );
      if (avatarConfig) {
        if (avatarCache.find((r) => r.key === avatarConfig.value)) return;
        gltfPaths.push(avatarConfig.value);
      }
    });

    actionKeySet.forEach((key) => {
      const animationConfig = gamgeConfig.config.animations.find(
        (av) => av.key === key
      );
      if (animationConfig) {
        if (animationCache.find((r) => r.key === animationConfig.value)) return;
        animationPaths.push(animationConfig.value);
      }
    });

    imageKeySet.forEach((key) => {
      const imageConfig = gamgeConfig.config.backgrounds.find(
        (bg) => bg.key === key
      );
      if (imageConfig) imagePaths.push(imageConfig.value);
    });

    return { gltfPaths, imagePaths, animationPaths };
  }, [chapterIndex]);

  const tasks: Array<Promise<any>> = [];
  assets.animationPaths.forEach((path) => {
    const fbxLoader = new FBXLoader();
    tasks.push(
      fbxLoader.loadAsync(path).then((obj) => {
        animationCache.push({ key: path, value: obj });
      })
    );
  });
  Promise.all(tasks);

  assets.imagePaths.forEach((path) => {
    const loader = new THREE.TextureLoader();
    const obj = loader.load(path);
    imangeCache.push({ key: path, value: obj });
  });

  const gltf = useLoader(GLTFLoader, assets.gltfPaths, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  useEffect(() => {
    assets.gltfPaths.forEach((path, index) => {
      if (avatarCache.find((r) => r.key === path)) {
        avatarCache.find((r) => r.key === path)!.value = gltf[index];
      } else {
        avatarCache.push({ key: path, value: null });
      }
    });

    onLoadComplete();
  }, [gltf, onLoadComplete]);

  return null;
};

export default AssetLoader;
