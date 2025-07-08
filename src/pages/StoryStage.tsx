import React, { useState, Suspense, useEffect } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import { gamgeConfig, gameStatus } from "../controls/Store";
import BGM from "../controls/common/BGM";
import ItemsDisplay from "../controls/common/Items";
import Loading from "../controls/common/Loading";
import LoadingOverlay from "../controls/common/LoadingOverlay";
import Save from "../controls/common/Save";
import GoodEnd from "../controls/GoodEnding";
import SlideInImage from "../controls/common/SlideInImage";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface StoryStageProps {
  onExit: () => void;
}

const StoryStage: React.FC<StoryStageProps> = ({ onExit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pan, setPan] = useState(0);
  const [showingImagePath, setShowingImagePath] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);
  const [location, setLocation] = useState(
    gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[gameStatus.messageIndex]
      ?.location
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (gamgeConfig.chapters.length > 0) {
      setLocation(
        gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
          gameStatus.messageIndex
        ]?.location
      );
    }
  }, [gameStatus.chapterIndex, gameStatus.messageIndex]);

  const updateLocation = () => {
    if (
      location !=
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[gameStatus.messageIndex]
        ?.location
    ) {
      setLocation(
        gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
          gameStatus.messageIndex
        ]?.location
      );
    }
  };

  const changeMessageIndex = (index: number) => {
    if (
      location !=
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[index]?.location
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
    if (gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[index]?.image) {
      setShowingImagePath(
        gamgeConfig.chapters[gameStatus.chapterIndex].scenes[index].image!
      );
    } else {
      setShowingImagePath(null);
    }

    const avatars =
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[gameStatus.messageIndex]
        ?.avatars;
    if (avatars) {
      if (avatars.find((a) => a.attension)) {
        if (avatars.indexOf(avatars.find((a) => a.attension)!) == 2) {
          setPan(2);
        } else if (avatars.indexOf(avatars.find((a) => a.attension)!) == 1) {
          setPan(1);
        } else {
          if (pan == 2) {
            setPan(-2);
          } else if (pan == 1) {
            setPan(-1);
          } else {
            setPan(0);
          }
        }
      }
    }
  };

  const next = (increment: number) => {
    const { scenes } = gamgeConfig.chapters[gameStatus.chapterIndex];
    if (gameStatus.messageIndex < scenes.length - increment) {
      if (
        gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
          gameStatus.messageIndex + increment
        ]?.goto
      ) {
        if (
          gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
            gameStatus.messageIndex + increment
          ].goto === "good_end"
        ) {
          setIsLoading(true);
          setTimeout(() => {
            setEnding(
              gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
                gameStatus.messageIndex + increment
              ].goto!
            );
          }, 1000);
        } else {
          const targets =
            gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
              gameStatus.messageIndex + increment
            ].goto?.split(".");
          const chapter = gamgeConfig.chapters.find(
            (c) => c.id === targets![0]
          )!;
          const scene = chapter?.scenes.find((c) => c.id === targets![1])!;
          gameStatus.chapterIndex = gamgeConfig.chapters.indexOf(chapter);
          changeMessageIndex(chapter.scenes.indexOf(scene));
        }
      } else if (
        gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
          gameStatus.messageIndex + increment
        ]?.conditions
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
    if (isLoading) return;
    if (
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
        gameStatus.messageIndex
      ]?.items
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

  const locationLeftOffset =
    document.body.clientWidth > 1280
      ? (document.body.clientWidth - 1280) / 2
      : 0;

  if (gamgeConfig.chapters.length === 0) {
    return <Loading />;
  }

  const backgroundConfig = gamgeConfig.config.backgrounds.find(
    (bg) =>
      bg.key ===
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[gameStatus.messageIndex]
        ?.background
  );
  const backgroundUrl = backgroundConfig ? backgroundConfig.value : "";

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex justify-center w-screen h-screen relative bg-black">
        {ending === "good_end" ? (
          <>
            <GoodEnd />
            <button
              className="absolute text-sm top-0 h-8 right-0 p-2 text-white hover:underline"
              onClick={handleExit}
            >
              {t("exit")}
            </button>
          </>
        ) : (
          <>
            {backgroundUrl && (
              <img
                src={backgroundUrl}
                className={clsx("fixed w-screen h-screen object-cover")}
                style={{ maxWidth: "1280px" }}
              />
            )}
            <CanvasComponent onClick={handleClick} />
            <MessageWindow onClick={handleClick} />
            <ItemsDisplay onClick={itemSelected} />
            {showingImagePath && (
              <>
                <div
                  className="fixed left-0 top-12 w-full flex items-center justify-center"
                  onClick={handleClick}
                >
                  <SlideInImage
                    imageSrc={showingImagePath}
                    altText="Sample Image"
                  />
                </div>
              </>
            )}
            <div className="fixed left-0 top-0 right-0 h-8 bg-black"></div>
            <BGM />
            <Save />
            <button
              className="absolute text-sm top-0 h-8 right-0 p-2 text-white hover:underline"
              onClick={handleExit}
            >
              {t("exit")}
            </button>
            <div
              className={`fixed top-10 w-screen left-[${locationLeftOffset}px] `}
              style={{ maxWidth: "1280px" }}
            >
              <span className="absolute left-0 top-0 p-2 pl-4 text-2xl text-white w-56 text-left bg-gradient-to-r from-pink-700/90 via-pink-700/70 to-pink-700/0">
                {location}
              </span>
            </div>
            <div className="fixed left-0 bottom-0 right-0 h-8 bg-black"></div>
          </>
        )}
      </div>
      {isLoading && <LoadingOverlay onClose={handleLoadingClose} />}
    </Suspense>
  );
};

export default StoryStage;
