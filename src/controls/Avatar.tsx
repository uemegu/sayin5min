import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { VRM } from "@pixiv/three-vrm";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { useSnapshot } from "valtio";
import {
  gameStatus,
  animationCache,
  animationClipCache,
  avatarCache,
  gamgeConfig,
} from "./Store";

const PHONEMES = ["aa", "ee", "ih", "oh", "ou"] as const;
type Phoneme = (typeof PHONEMES)[number];
const SMOOTHING = 0.2;

const Avatar: React.FC<{
  url: string;
  animationUrl: string;
  expression?: string;
  faceUrl?: string;
  index: number;
  attention?: boolean;
  isTalking: boolean;
}> = ({ url, animationUrl, expression, index, attention, isTalking }) => {
  const { scene, camera } = useThree();
  const { cameraDirection } = useSnapshot(gameStatus);
  const { phoneme } = useSnapshot(gamgeConfig);
  const gltfEntry = avatarCache.find((r) => r.key === url);
  const gltf = gltfEntry?.value;
  const [avatar, setAvatar] = useState<VRM | null>(null);
  const [prevAnimationUrl, setPrevAnimationUrl] = useState<string | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [currentAnimation, setCurrentAnimation] =
    useState<THREE.AnimationAction | null>(null);

  if (!gltf) return null;
  const positions = [0, 0.7, -0.7];
  const rotation = [0, -30, 30];

  const applyExpression = () => {
    if (avatar && expression) {
      avatar.expressionManager!.setValue("happy", 0.0);
      avatar.expressionManager!.setValue("angry", 0.0);
      avatar.expressionManager!.setValue("sad", 0.0);
      avatar.expressionManager!.setValue("surprised", 0.0);
      avatar.expressionManager!.setValue(expression, 1.0);
    }
  };

  const blinkTimer = useRef(0);
  const lookAtTimer = useRef(0);
  const blinkState = useRef(0); // 0: open, 1: closing, 2: closed, 3: opening
  useFrame((_, delta) => {
    if (!avatar || !avatar.expressionManager) return;
    if (avatar.expressionManager!.getValue("happy") === 1.0) return;

    blinkTimer.current -= delta;
    if (blinkTimer.current < 0) {
      blinkState.current = 1;
      blinkTimer.current = getRandomBlinkInterval(5, 10);
    }
    lookAtTimer.current += delta;
    if (lookAtTimer.current > 1) {
      lookAtTimer.current = 0;
      if (avatar.lookAt && camera) {
        const targetPosition = new THREE.Vector3();
        camera.getWorldPosition(targetPosition);
        avatar.lookAt.lookAt(targetPosition);
      }
    }

    // まばたきの状態管理
    const expressionManager = avatar.expressionManager;
    switch (blinkState.current) {
      case 1: // 閉じる
        avatar.expressionManager.setValue(
          "blink",
          Math.min(
            1.0,
            avatar.expressionManager.getValue("blink")! + delta * 10
          )
        );
        if (avatar.expressionManager.getValue("blink")! >= 1.0)
          blinkState.current = 2; // 完全に閉じた
        break;
      case 2: // 閉じた状態を保持
        expressionManager.setValue("blink", 1.0);
        blinkState.current = 3; // 開く準備
        break;
      case 3: // 開く
        avatar.expressionManager.setValue(
          "blink",
          Math.max(
            0.0,
            avatar.expressionManager.getValue("blink")! - delta * 10
          )
        );
        if (avatar.expressionManager.getValue("blink")! <= 0.0)
          blinkState.current = 0; // 完全に開いた
        break;
    }
  });

  const getRandomBlinkInterval = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const lookMe = (avatar: VRM) => {
    const bbox = new THREE.Box3().setFromObject(avatar.scene);
    const facePosition = new THREE.Vector3(
      positions[index] / 2,
      (bbox.max.y * 2.5) / 3,
      0
    );

    if (cameraDirection) {
      const target = {
        x: cameraDirection.x * 1000,
        y: cameraDirection.y,
        z: cameraDirection.z,
      }; // 初期値
      gsap.to(target, {
        duration: 1,
        x: facePosition.x * 1000,
        y: facePosition.y,
        z: facePosition.z,
        onUpdate: () => {
          camera.lookAt(new THREE.Vector3(target.x / 1000, target.y, target.z));
          if (avatar.lookAt && camera) {
            const targetPosition = new THREE.Vector3();
            camera.getWorldPosition(targetPosition);
            avatar.lookAt.lookAt(targetPosition);
          }
        },
        onComplete: () => {
          gameStatus.cameraDirection = facePosition;
        },
      });
    } else {
      camera.lookAt(
        new THREE.Vector3(facePosition.x, facePosition.y, facePosition.z)
      );
      if (avatar.lookAt && camera) {
        const targetPosition = new THREE.Vector3();
        camera.getWorldPosition(targetPosition);
        avatar.lookAt.lookAt(targetPosition);
      }
      gameStatus.cameraDirection = facePosition;
    }
  };

  const loadAnimation = (avatar: VRM) => {
    const clip = loadMixamoAnimation(animationUrl, avatar);

    if (
      prevAnimationUrl === "./animations/Standing Greeting.fbx" &&
      animationUrl === "./animations/Idle.fbx"
    ) {
      for (let track of clip.tracks) {
        if (track.name.includes(".position")) {
          for (let i = 1; i < track.values.length; i += 3) {
            track.values[i] += 0.043;
          }
        }
      }
    }

    const newMixer = new THREE.AnimationMixer(avatar.scene);
    setMixer(newMixer);
    const action = newMixer.clipAction(clip);
    if (currentAnimation) {
      action.crossFadeFrom(currentAnimation, 1, false);
    }
    if (animationUrl !== "./animations/Idle.fbx") {
      action.setLoop(THREE.LoopOnce, 1); // 1回だけ再生
      action.clampWhenFinished = true; // 最後のフレームで停止
    }
    action.play();
    setCurrentAnimation(action);
    setPrevAnimationUrl(animationUrl);
  };

  useEffect(() => {
    if (gltf.userData.vrm) {
      const vrm = gltf.userData.vrm as VRM;
      vrm.scene.position.set(positions[index], 0, 0);
      vrm.scene.layers.set(1);
      scene.add(vrm.scene);
      vrm.scene.rotation.y = THREE.MathUtils.degToRad(rotation[index]);
      console.log(vrm.scene.layers.mask.toString(2));
      setCurrentAnimation(null);
      setAvatar(vrm);
      if (attention) {
        lookMe(gltf.userData.vrm);
      }
    }

    return () => {
      if (gltf.userData.vrm) {
        scene.remove(gltf.userData.vrm.scene);
      }
    };
  }, [gltf, scene]);

  useEffect(() => {
    if (attention && avatar) {
      lookMe(avatar);
    }
  }, [attention, avatar]);

  useEffect(() => {
    if (avatar && animationUrl) {
      loadAnimation(avatar);
    }
  }, [avatar, animationUrl]);

  useEffect(() => {
    applyExpression();
  }, [avatar, expression]);

  const phonemeRef = useRef<Phoneme | "nn" | undefined>(undefined);
  useEffect(() => {
    if (isTalking) {
      phonemeRef.current = phoneme as Phoneme | "nn" | undefined;
    }
  }, [phoneme]);
  const weightsRef = useRef<Record<Phoneme, number>>({
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0,
  });

  useFrame((_, delta) => {
    if (avatar) {
      // 3-1) ターゲット重み決定
      const target: Record<Phoneme, number> = {
        aa: 0,
        ee: 0,
        ih: 0,
        oh: 0,
        ou: 0,
      };
      const detected = phonemeRef.current;
      if (detected && detected !== "nn") {
        target[detected] = 1;
      }

      // 3-2) 線形補間してセット
      PHONEMES.forEach((p) => {
        const cw = weightsRef.current[p];
        const tw = target[p];
        const nw = cw + SMOOTHING * (tw - cw);
        weightsRef.current[p] = nw;
        avatar.expressionManager!.setValue(p, nw * 0.8);
      });
      avatar.update(delta);
    }
    if (mixer) mixer.update(delta);
  });

  return null;
};

export default Avatar;

// from https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-core/examples/humanoidAnimation/loadMixamoAnimation.js

/**
 * Load Mixamo animation, convert for three-vrm use, and return it.
 *
 * @param {string} url A url of mixamo animation data
 * @param {VRM} vrm A target VRM
 * @returns {Promise<THREE.AnimationClip>} The converted AnimationClip
 */
export function loadMixamoAnimation(url: string, vrm: any) {
  const cache = animationClipCache.find((r) => r.key === url)?.value;
  if (cache) {
    return cache;
  }

  const asset = animationCache.find((r) => r.key === url)!.value!;

  const clip = THREE.AnimationClip.findByName(asset.animations, "mixamo.com"); // extract the AnimationClip
  const tracks: THREE.KeyframeTrack[] | undefined = []; // KeyframeTracks compatible with VRM will be added here

  const restRotationInverse = new THREE.Quaternion();
  const parentRestWorldRotation = new THREE.Quaternion();
  const _quatA = new THREE.Quaternion();
  const _vec3 = new THREE.Vector3();

  // Adjust with reference to hips height.
  const motionHipsHeight = asset.getObjectByName("mixamorigHips")!.position.y;
  const vrmHipsY = vrm.humanoid
    ?.getNormalizedBoneNode("hips")
    .getWorldPosition(_vec3).y;
  const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
  const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
  const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

  clip!.tracks.forEach((track) => {
    // Convert each tracks for VRM use, and push to `tracks`
    const trackSplitted = track.name.split(".");
    const mixamoRigName = trackSplitted[0];
    const vrmBoneName = {
      mixamorigHips: "hips",
      mixamorigSpine: "spine",
      mixamorigSpine1: "chest",
      mixamorigSpine2: "upperChest",
      mixamorigNeck: "neck",
      mixamorigHead: "head",
      mixamorigLeftShoulder: "leftShoulder",
      mixamorigLeftArm: "leftUpperArm",
      mixamorigLeftForeArm: "leftLowerArm",
      mixamorigLeftHand: "leftHand",
      mixamorigLeftHandThumb1: "leftThumbMetacarpal",
      mixamorigLeftHandThumb2: "leftThumbProximal",
      mixamorigLeftHandThumb3: "leftThumbDistal",
      mixamorigLeftHandIndex1: "leftIndexProximal",
      mixamorigLeftHandIndex2: "leftIndexIntermediate",
      mixamorigLeftHandIndex3: "leftIndexDistal",
      mixamorigLeftHandMiddle1: "leftMiddleProximal",
      mixamorigLeftHandMiddle2: "leftMiddleIntermediate",
      mixamorigLeftHandMiddle3: "leftMiddleDistal",
      mixamorigLeftHandRing1: "leftRingProximal",
      mixamorigLeftHandRing2: "leftRingIntermediate",
      mixamorigLeftHandRing3: "leftRingDistal",
      mixamorigLeftHandPinky1: "leftLittleProximal",
      mixamorigLeftHandPinky2: "leftLittleIntermediate",
      mixamorigLeftHandPinky3: "leftLittleDistal",
      mixamorigRightShoulder: "rightShoulder",
      mixamorigRightArm: "rightUpperArm",
      mixamorigRightForeArm: "rightLowerArm",
      mixamorigRightHand: "rightHand",
      mixamorigRightHandPinky1: "rightLittleProximal",
      mixamorigRightHandPinky2: "rightLittleIntermediate",
      mixamorigRightHandPinky3: "rightLittleDistal",
      mixamorigRightHandRing1: "rightRingProximal",
      mixamorigRightHandRing2: "rightRingIntermediate",
      mixamorigRightHandRing3: "rightRingDistal",
      mixamorigRightHandMiddle1: "rightMiddleProximal",
      mixamorigRightHandMiddle2: "rightMiddleIntermediate",
      mixamorigRightHandMiddle3: "rightMiddleDistal",
      mixamorigRightHandIndex1: "rightIndexProximal",
      mixamorigRightHandIndex2: "rightIndexIntermediate",
      mixamorigRightHandIndex3: "rightIndexDistal",
      mixamorigRightHandThumb1: "rightThumbMetacarpal",
      mixamorigRightHandThumb2: "rightThumbProximal",
      mixamorigRightHandThumb3: "rightThumbDistal",
      mixamorigLeftUpLeg: "leftUpperLeg",
      mixamorigLeftLeg: "leftLowerLeg",
      mixamorigLeftFoot: "leftFoot",
      mixamorigLeftToeBase: "leftToes",
      mixamorigRightUpLeg: "rightUpperLeg",
      mixamorigRightLeg: "rightLowerLeg",
      mixamorigRightFoot: "rightFoot",
      mixamorigRightToeBase: "rightToes",
    }[mixamoRigName];

    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
    const mixamoRigNode = asset.getObjectByName(mixamoRigName);

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1];

      // Store rotations of rest-pose.
      mixamoRigNode!.getWorldQuaternion(restRotationInverse).invert();
      mixamoRigNode!.parent!.getWorldQuaternion(parentRestWorldRotation);

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone.
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4);

          _quatA.fromArray(flatQuaternion);

          // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
          _quatA
            .premultiply(parentRestWorldRotation)
            .multiply(restRotationInverse);

          _quatA.toArray(flatQuaternion);

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v;
          });
        }

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            Array.from(track.times),
            Array.from(track.values).map((v, i) =>
              vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v
            )
          )
        );
      } else if (track instanceof THREE.VectorKeyframeTrack) {
        const value = Array.from(track.values).map(
          (v, i) =>
            (vrm.meta?.metaVersion === "0" && i % 3 !== 1 ? -v : v) *
            hipsPositionScale
        );
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            Array.from(track.times),
            value
          )
        );
      }
    }
  });

  const result = new THREE.AnimationClip(
    "vrmAnimation",
    clip!.duration,
    tracks
  );
  animationClipCache.push({ key: url, value: result });
  return result;
}
