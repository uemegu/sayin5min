import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Avatar from "./Avatar";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import StorySetting from "./Store";

const Background: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      scene.background = texture;
    });
  }, [url, scene]);

  return null;
};

const CanvasComponent: React.FC = () => {
  const { chapters, messageIndex, chapterIndex, config } =
    useSnapshot(StorySetting);
  const currentScene = chapters[chapterIndex].scenes[messageIndex];
  const backgroundConfig = config.backgrounds.find(
    (bg) => bg.key === currentScene?.background
  );
  const backgroundUrl = backgroundConfig ? backgroundConfig.value : "";
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{
        fov: 30,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 20,
        position: [0, 1, 2.5],
      }}
    >
      {backgroundUrl && <Background url={backgroundUrl} />}
      <ambientLight color={0xff4444} intensity={1} />
      <directionalLight position={[0.5, 2, 2]} intensity={2} />
      {currentScene?.avatars?.map((avatar, index) => {
        const avatarConfig = config.avatars.find((av) => av.key === avatar.id);
        const animationConfig = config.animations.find(
          (anim) => anim.key === avatar.action
        );
        return (
          <Avatar
            key={index}
            url={avatarConfig ? avatarConfig.value : ""}
            animationUrl={animationConfig ? animationConfig.value : ""}
            expression={avatar.expression}
            index={index}
            attention={avatar.attension}
          />
        );
      })}
      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer>
    </Canvas>
  );
};

export default CanvasComponent;
