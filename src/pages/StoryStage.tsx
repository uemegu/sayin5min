import React, { useEffect, useState } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import StorySetting, { Chapter } from "../controls/Store";
import json from "../assets/Story.json";
import BGM from "../controls/BGM";
import ItemsDisplay from "../controls/Items";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const StoryStage: React.FC = () => {
  const [location, setLocation] = useState("");

  useEffect(() => {
    StorySetting.chapters = json.chapters as Chapter[];
    StorySetting.config = json.config;
    setLocation(
      StorySetting.chapters[StorySetting.chapterIndex].scenes[
        StorySetting.messageIndex
      ].location
    );

    const avatorKey: Array<string> = [];
    StorySetting.chapters[StorySetting.chapterIndex].scenes.forEach((s) => {
      s.avatars?.forEach((a) => {
        if (!avatorKey.includes(a.id)) {
          avatorKey.push(a.id);
        }
      });
    });
    avatorKey.forEach((a) => {
      const avatarConfig = StorySetting.config.avatars.find(
        (av) => av.key === a
      );
      useLoader.preload(GLTFLoader, avatarConfig!.value, (loader) => {
        loader.register((parser) => new VRMLoaderPlugin(parser));
      });
    });
  }, []);

  const next = () => {
    const { scenes } = StorySetting.chapters[StorySetting.chapterIndex];
    if (StorySetting.messageIndex < scenes.length - 1) {
      StorySetting.messageIndex += 1;
    }
    if (
      location !=
      StorySetting.chapters[StorySetting.chapterIndex].scenes[
        StorySetting.messageIndex
      ].location
    ) {
      setLocation(
        StorySetting.chapters[StorySetting.chapterIndex].scenes[
          StorySetting.messageIndex
        ].location
      );
    }
  };
  const handleClick = () => {
    if (
      StorySetting.chapters[StorySetting.chapterIndex].scenes[
        StorySetting.messageIndex
      ].items
    ) {
      return;
    }
    next();
  };
  const itemSelected = () => {
    next();
  };
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <CanvasComponent onClick={handleClick} />
      <MessageWindow />
      <ItemsDisplay onClick={itemSelected} />
      <div className="fixed left-0 top-0 right-0 h-8 bg-black"></div>
      <BGM />
      <div className="fixed left-0 top-10">
        <span className="absolute left-0 top-0 p-2 text-2xl text-teal-100 w-56 text-left bg-gradient-to-r from-sky-950/90 via-sky-950/70 to-sky-950/0">
          {location}
        </span>
      </div>
      <div className="fixed left-0 bottom-0 right-0 h-8 bg-black"></div>
    </div>
  );
};

export default StoryStage;
