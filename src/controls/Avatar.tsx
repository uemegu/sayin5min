import React, { useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import * as THREE from "three";
import { gsap } from "gsap";
import { useSnapshot } from "valtio";
import StorySetting from "./Store";

const Avatar: React.FC<{
  url: string;
  animationUrl: string;
  expression?: string;
  index: number;
  attention?: boolean;
}> = ({ url, animationUrl, expression, index, attention }) => {
  const { scene, camera } = useThree();
  const { cameraDirection } = useSnapshot(StorySetting);
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });
  const [avatar, setAvatar] = useState<VRM | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [currentAnimation, setCurrentAnimation] =
    useState<THREE.AnimationAction | null>(null);

  const applyExpression = () => {
    if (avatar && expression) {
      avatar.expressionManager!.setValue("happy", 0.0);
      avatar.expressionManager!.setValue("angry", 0.0);
      avatar.expressionManager!.setValue("sad", 0.0);
      avatar.expressionManager!.setValue(expression, 1.0);
    }
  };

  const lookMe = (avatar: VRM) => {
    const bbox = new THREE.Box3().setFromObject(avatar.scene);
    const facePosition = new THREE.Vector3(
      index * 0.7,
      (bbox.max.y * 2) / 3,
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
        },
        onComplete: () => {
          StorySetting.cameraDirection = facePosition;
        },
      });
    } else {
      camera.lookAt(
        new THREE.Vector3(facePosition.x, facePosition.y, facePosition.z)
      );
      StorySetting.cameraDirection = facePosition;
    }
  };

  const loadAnimation = (avatar: VRM) => {
    loadMixamoAnimation(animationUrl, avatar).then((clip) => {
      for (let track of clip.tracks) {
        if (track.name.includes(".position")) {
          for (let i = 1; i < track.values.length; i += 3) {
            track.values[i] += 0.023;
          }
        }
      }

      const mixer = new THREE.AnimationMixer(avatar.scene);
      setMixer(mixer);
      const action = mixer.clipAction(clip);
      if (currentAnimation) {
        action.crossFadeFrom(currentAnimation, 1, false);
      }
      action.play();
      setCurrentAnimation(action);
    });
  };

  useEffect(() => {
    if (gltf.userData.vrm) {
      const vrm = gltf.userData.vrm as VRM;
      vrm.scene.position.set(index * 0.7, 0, 0);
      vrm.scene.rotateY(Math.PI - (index * Math.PI) / 8);
      scene.add(vrm.scene);
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
  }, [gltf, index, scene]);

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

  useFrame((_, delta) => {
    if (avatar) {
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
  const loader = new FBXLoader(); // A loader which loads FBX
  return loader.loadAsync(url).then((asset) => {
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

    clip.tracks.forEach((track) => {
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

      const vrmNodeName =
        vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
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
              track.times,
              track.values.map((v, i) =>
                vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v
              )
            )
          );
        } else if (track instanceof THREE.VectorKeyframeTrack) {
          const value = track.values.map(
            (v, i) =>
              (vrm.meta?.metaVersion === "0" && i % 3 !== 1 ? -v : v) *
              hipsPositionScale
          );
          tracks.push(
            new THREE.VectorKeyframeTrack(
              `${vrmNodeName}.${propertyName}`,
              track.times,
              value
            )
          );
        }
      }
    });

    return new THREE.AnimationClip("vrmAnimation", clip.duration, tracks);
  });
}
