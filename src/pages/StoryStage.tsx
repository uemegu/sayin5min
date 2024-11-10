import React, { useState, Suspense } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import { gamgeConfig, gameStatus } from "../controls/Store";
import BGM from "../controls/common/BGM";
import ItemsDisplay from "../controls/common/Items";
import Loading from "../controls/common/Loading";
import LoadingOverlay from "../controls/common/LoadingOverlay";
import Save from "../controls/common/Save";

const StoryStage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(
    gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
      gameStatus.messageIndex
    ].location
  );

  const updateLocation = () => {
    if (
      location !=
      gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
        gameStatus.messageIndex
      ].location
    ) {
      setLocation(
        gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
          gameStatus.messageIndex
        ].location
      );
    }
  };

  const next = () => {
    const { scenes } = gamgeConfig.chapters[gameStatus.chapterIndex];
    if (gameStatus.messageIndex < scenes.length - 1) {
      if (
        location !=
        gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
          gameStatus.messageIndex + 1
        ].location
      ) {
        setIsLoading(true);
        setTimeout(() => {
          gameStatus.messageIndex += 1;
          updateLocation();
        }, 1000);
        return;
      } else {
        gameStatus.messageIndex += 1;
      }
    }
    updateLocation();
  };

  const handleClick = () => {
    if (
      gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
        gameStatus.messageIndex
      ].items
    ) {
      return;
    }
    next();
  };

  const itemSelected = () => {
    next();
  };

  function handleLoadingClose(): void {
    setIsLoading(false);
  }

  return (
    <Suspense fallback={<Loading />}>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <CanvasComponent onClick={handleClick} />
        <MessageWindow />
        <ItemsDisplay onClick={itemSelected} />
        <div className="fixed left-0 top-0 right-0 h-8 bg-black"></div>
        <BGM />
        <Save />
        <div className="fixed left-0 top-10">
          <span className="absolute left-0 top-0 p-2 pl-4 text-2xl text-white w-56 text-left bg-gradient-to-r from-pink-700/90 via-pink-700/70 to-pink-700/0">
            {location}
          </span>
        </div>
        <div className="fixed left-0 bottom-0 right-0 h-8 bg-black"></div>
      </div>
      {isLoading && <LoadingOverlay onClose={handleLoadingClose} />}
    </Suspense>
  );
};

export default StoryStage;
