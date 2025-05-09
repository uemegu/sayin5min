import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  HueSaturation,
  BrightnessContrast,
  ToneMapping,
} from "@react-three/postprocessing";
import Avatar from "./Avatar";
import { useSnapshot } from "valtio";
import { gameStatus, gamgeConfig } from "./Store";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { KernelSize, ToneMappingMode } from "postprocessing";

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

  const isZoom = currentScene?.avatars?.find((a) => a.attension)?.zoom;

  return (
    <>
      <Canvas
        className="w-screen h-screen"
        style={{ maxWidth: "1280px" }}
        onClick={onClick}
      >
        <CameraController isZoom={!!isZoom} />
        <ambientLight color={0xbb8888} intensity={1.0} />
        <directionalLight position={[0.5, 2, 2]} intensity={3.0} />
        {currentScene?.avatars?.map((avatar, index) => {
          const avatarConfig = config.avatars.find(
            (av) => av.key === avatar.id
          );
          const animationConfig = config.animations.find(
            (anim) => anim.key === avatar.action
          );
          const speaker = currentScene.text.split("「")[0];
          return (
            <Avatar
              key={index}
              url={avatarConfig ? avatarConfig.value : ""}
              isTalking={
                speaker == avatarConfig?.option ||
                (speaker.length == 0 && currentScene?.avatars?.length == 1)
              }
              animationUrl={animationConfig ? animationConfig.value : ""}
              expression={avatar.expression}
              index={index}
              attention={avatar.attension}
            />
          );
        })}
        <EffectComposer>
          <ToneMapping mode={ToneMappingMode.REINHARD} />
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={1.0}
            kernelSize={KernelSize.VERY_SMALL}
          />
          <HueSaturation saturation={0.5} />
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
    </>
  );
};

export default CanvasComponent;
