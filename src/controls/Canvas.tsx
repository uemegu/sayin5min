import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  HueSaturation,
  BrightnessContrast,
} from "@react-three/postprocessing";
import Avatar from "./Avatar";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import { gameStatus, gamgeConfig, imangeCache } from "./Store";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";

const Background: React.FC<{ url: string }> = ({ url }) => {
  const { camera } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const texture = imangeCache.find((r) => r.key === url)!.value!;
    // テクスチャを背景平面のマテリアルに適用
    if (planeRef.current) {
      (planeRef.current.material as THREE.MeshBasicMaterial).map = texture;
      (planeRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }, [url]);

  useFrame(() => {
    if (planeRef.current) {
      // 背景の平面をカメラの位置に追従させる
      planeRef.current.position.copy(camera.position);
      planeRef.current.position.z -= 20; // カメラの背後に配置
      planeRef.current.position.y += 8; // カメラの背後に配置
    }
  });

  return (
    <mesh ref={planeRef}>
      <planeGeometry args={[16 * 3, 9 * 3]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};
const CameraController: React.FC<{ isZoom: boolean }> = ({ isZoom }) => {
  const cameraRef = useRef<any>();

  useFrame(() => {
    if (cameraRef.current) {
      const targetZ = isZoom ? 0.9 : 1.5;
      cameraRef.current.position.z +=
        (targetZ - cameraRef.current.position.z) * 0.1;
      const targetY = isZoom ? 1.2 : 1.0;
      cameraRef.current.position.y +=
        (targetY - cameraRef.current.position.y) * 0.1;
    }
  });

  return (
    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.2, 1.5]} />
  );
};

const CanvasComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { messageIndex, chapterIndex } = useSnapshot(gameStatus);
  const { chapters, config } = useSnapshot(gamgeConfig);
  const currentScene = chapters[chapterIndex].scenes[messageIndex];
  const backgroundConfig = config.backgrounds.find(
    (bg) => bg.key === currentScene?.background
  );
  const backgroundUrl = backgroundConfig ? backgroundConfig.value : "";
  const isZoom = currentScene?.avatars?.find((a) => a.attension)?.zoom;

  return (
    <Canvas
      className="w-screen h-screen"
      style={{ maxWidth: "1280px" }}
      onClick={onClick}
    >
      {backgroundUrl && <Background url={backgroundUrl} />}
      <CameraController isZoom={!!isZoom} />
      <ambientLight color={0xff4444} intensity={1.2} />
      <directionalLight position={[0.5, 2, 2]} intensity={2.2} />
      {currentScene?.avatars?.map((avatar, index) => {
        const avatarConfig = config.avatars.find((av) => av.key === avatar.id);
        const animationConfig = config.animations.find(
          (anim) => anim.key === avatar.action
        );
        const faceConfig = config.textures.find(
          (texture) => texture.key === avatar.face
        );
        return (
          <Avatar
            key={index}
            url={avatarConfig ? avatarConfig.value : ""}
            animationUrl={animationConfig ? animationConfig.value : ""}
            faceUrl={faceConfig ? faceConfig.value : ""}
            expression={avatar.expression}
            index={index}
            attention={avatar.attension}
          />
        );
      })}
      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={1.4} height={300} />
        <HueSaturation saturation={0.2} />
        {currentScene.effect === "dark" ? (
          <BrightnessContrast brightness={-0.2} contrast={0.1} />
        ) : (
          <></>
        )}
        {currentScene.effect === "light" ? (
          <BrightnessContrast brightness={0.5} contrast={0.1} />
        ) : (
          <></>
        )}
      </EffectComposer>
    </Canvas>
  );
};

export default CanvasComponent;
