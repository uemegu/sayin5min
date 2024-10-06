import React, { useEffect, useState } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import StorySetting, { Chapter } from "../controls/Store";
import json from "../assets/Story.json";
import BGM from "../controls/BGM";
import ItemsDisplay from "../controls/Items";

const StoryStage: React.FC = () => {
  const [location, setLocation] = useState("");

  useEffect(() => {
    StorySetting.chapters = json.chapters as Chapter[];
    StorySetting.config = json.config;
    setLocation(StorySetting.chapters[StorySetting.chapterIndex].location);
  }, []);

  const handleClick = () => {
    const { scenes } = StorySetting.chapters[StorySetting.chapterIndex];
    if (StorySetting.messageIndex < scenes.length - 1) {
      StorySetting.messageIndex += 1;
    }
    if (location != StorySetting.chapters[StorySetting.chapterIndex].location) {
      setLocation(StorySetting.chapters[StorySetting.chapterIndex].location);
    }
  };
  return (
    <div
      style={{ width: "100vw", height: "100vh", position: "relative" }}
      onClick={handleClick}
    >
      <CanvasComponent />
      <MessageWindow />
      <ItemsDisplay />
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
