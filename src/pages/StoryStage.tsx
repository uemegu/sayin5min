import React, { useState, Suspense } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import { gamgeConfig, gameStatus } from "../controls/Store";
import BGM from "../controls/common/BGM";
import ItemsDisplay from "../controls/common/Items";
import Loading from "../controls/common/Loading";
import LoadingOverlay from "../controls/common/LoadingOverlay";
import Save from "../controls/common/Save";

interface StoryStageProps {
  onExit: () => void;
}

const StoryStage: React.FC<StoryStageProps> = ({ onExit }) => {
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

  const changeMessageIndex = (index: number) => {
    if (
      location !=
      gamgeConfig.chapters[gameStatus.chapterIndex].scenes[index].location
    ) {
      setIsLoading(true);
      setTimeout(() => {
        gameStatus.messageIndex = index;
        updateLocation();
      }, 1000);
    } else {
      gameStatus.messageIndex = index;
      updateLocation();
    }
  };

  const next = (increment: number) => {
    const { scenes } = gamgeConfig.chapters[gameStatus.chapterIndex];
    if (gameStatus.messageIndex < scenes.length - increment) {
      if (
        gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
          gameStatus.messageIndex + increment
        ].goto
      ) {
        const targets =
          gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
            gameStatus.messageIndex + increment
          ].goto?.split(".");
        const chapter = gamgeConfig.chapters.find((c) => c.id === targets![0])!;
        const scene = chapter?.scenes.find((c) => c.id === targets![1])!;
        gameStatus.chapterIndex = gamgeConfig.chapters.indexOf(chapter);
        changeMessageIndex(chapter.scenes.indexOf(scene));
      } else if (
        gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
          gameStatus.messageIndex + increment
        ].conditions
      ) {
        const allElementsExist = gamgeConfig.chapters[
          gameStatus.chapterIndex
        ].scenes[gameStatus.messageIndex + increment].conditions!.every(
          (element) => gameStatus.flags.includes(element)
        );
        if (allElementsExist) {
          changeMessageIndex(gameStatus.messageIndex + increment);
        } else {
          next(increment + 1);
        }
      } else {
        changeMessageIndex(gameStatus.messageIndex + increment);
      }
    } else {
      if (gamgeConfig.chapters.length > gameStatus.chapterIndex + 1) {
        setIsLoading(true);
        setTimeout(() => {
          gameStatus.chapterIndex++;
          increment = 0;
          gameStatus.messageIndex = 0;
          next(increment);
        }, 1000);
      }
    }
  };

  const handleClick = () => {
    if (
      gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
        gameStatus.messageIndex
      ].items
    ) {
      return;
    }
    next(1);
  };

  const itemSelected = () => {
    next(1);
  };

  const handleLoadingClose = () => {
    setIsLoading(false);
  };

  const handleExit = () => {
    onExit();
  };

  return (
    <Suspense fallback={<Loading />}>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <CanvasComponent onClick={handleClick} />
        <MessageWindow />
        <ItemsDisplay onClick={itemSelected} />
        <div className="fixed left-0 top-0 right-0 h-8 bg-black"></div>
        <BGM />
        <Save />
        <button
          className="absolute text-sm top-0 h-8 right-0 p-2 text-white hover:underline"
          onClick={handleExit}
        >
          終了する
        </button>
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
