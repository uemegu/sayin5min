import { useEffect, useMemo } from "react";
import {
  gamgeConfig,
  animationCache,
  avatarCache,
  imangeCache,
} from "../controls/Store";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const AssetLoader: React.FC<{ onLoadComplete: () => void }> = ({
  onLoadComplete,
}) => {
  //const { chapterIndex } = useSnapshot(gameStatus);

  const assets = useMemo(() => {
    const gltfPaths: string[] = [];
    const animationPaths: string[] = [];

    const avatarKeySet = new Set<string>();
    const actionKeySet = new Set<string>();
    const audioKeySet = new Set<string>();

    // FIXME 本当はチャプター単位でロードしたい
    gamgeConfig.chapters.forEach((chapter) =>
      chapter.scenes.forEach((s) => {
        s.avatars?.forEach((a) => {
          avatarKeySet.add(a.id);
          actionKeySet.add(a.action);
        });
        if (s.bgm) audioKeySet.add(s.bgm);
        if (s.voice) audioKeySet.add(s.voice);
      })
    );

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

    return { gltfPaths, animationPaths };
  }, []);

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
