import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Avatar from "./Avatar";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import StorySetting from "./Store";

const Background: React.FC<{ url: string }> = ({ url }) => {
  const { camera, scene } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      // テクスチャを背景平面のマテリアルに適用
      if (planeRef.current) {
        (planeRef.current.material as THREE.MeshBasicMaterial).map = texture;
        (planeRef.current.material as THREE.MeshBasicMaterial).needsUpdate =
          true;
      }
    });
  }, [url]);

  useFrame(() => {
    if (planeRef.current) {
      // 背景の平面をカメラの位置に追従させる
      planeRef.current.position.copy(camera.position);
      planeRef.current.position.z -= 23; // カメラの背後に配置
      planeRef.current.position.y += 2; // カメラの背後に配置
    }
  });

  return (
    <mesh ref={planeRef}>
      <planeGeometry args={[16 * 3, 9 * 3]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};

const CanvasComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
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
        fov: 40,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 80,
        position: [0, 1, 2.5],
      }}
      onClick={onClick}
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
