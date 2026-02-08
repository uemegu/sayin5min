import React, { useState, Suspense, useEffect, useCallback } from "react";
import CanvasComponent from "../controls/Canvas";
import MessageWindow from "../controls/MessageWindow";
import { gamgeConfig, gameStatus } from "../controls/Store";
import BGM from "../controls/common/BGM";
import ItemsDisplay from "../controls/common/Items";
import Loading from "../controls/common/Loading";
import Save from "../controls/common/Save";
import GoodEnd from "../controls/GoodEnding";
import SlideInImage from "../controls/common/SlideInImage";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

interface StoryStageProps {
  onExit: () => void;
}

const StoryStage: React.FC<StoryStageProps> = ({ onExit }) => {
  const [pan, setPan] = useState(0);
  const [showingImagePath, setShowingImagePath] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);
  const { chapterIndex, messageIndex, flags } = useSnapshot(gameStatus);
  const { chapters, config } = useSnapshot(gamgeConfig);

  const [location, setLocation] = useState(
    chapters[chapterIndex]?.scenes[messageIndex]?.location
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (chapters.length > 0) {
      setLocation(chapters[chapterIndex]?.scenes[messageIndex]?.location);
    }
  }, [chapterIndex, messageIndex, chapters]);

  const updateLocation = () => {
    if (location != chapters[chapterIndex]?.scenes[messageIndex]?.location) {
      setLocation(chapters[chapterIndex]?.scenes[messageIndex]?.location);
    }
  };

  const changeMessageIndex = (index: number) => {
    if (location != chapters[chapterIndex]?.scenes[index]?.location) {
      gameStatus.isLoading = true;
      gameStatus.isTransitioning = true;
      setTimeout(() => {
        gameStatus.messageIndex = index;
        updateLocation();
        gameStatus.isTransitioning = false;
      }, 1000);
    } else {
      gameStatus.messageIndex = index;
      updateLocation();
    }
    if (chapters[chapterIndex]?.scenes[index]?.image) {
      setShowingImagePath(chapters[chapterIndex].scenes[index].image!);
    } else {
      setShowingImagePath(null);
    }

    const avatars = chapters[chapterIndex]?.scenes[messageIndex]?.avatars;
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
    const { scenes } = chapters[chapterIndex];
    if (messageIndex < scenes.length - increment) {
      if (chapters[chapterIndex]?.scenes[messageIndex + increment]?.goto) {
        if (
          chapters[chapterIndex].scenes[messageIndex + increment].goto ===
          "good_end"
        ) {
          gameStatus.isLoading = true;
          gameStatus.isTransitioning = true;
          setTimeout(() => {
            setEnding(
              chapters[chapterIndex].scenes[messageIndex + increment].goto!
            );
            gameStatus.isTransitioning = false;
          }, 1000);
        } else {
          const targets =
            chapters[chapterIndex].scenes[messageIndex + increment].goto?.split(
              "."
            );
          const nextChapter = chapters.find((c) => c.id === targets![0])!;
          const nextScene = nextChapter?.scenes.find(
            (c) => c.id === targets![1]
          )!;
          gameStatus.chapterIndex = chapters.indexOf(nextChapter);
          changeMessageIndex(nextChapter.scenes.indexOf(nextScene));
        }
      } else if (
        chapters[chapterIndex]?.scenes[messageIndex + increment]?.conditions
      ) {
        const allElementsExist = chapters[chapterIndex].scenes[
          messageIndex + increment
        ].conditions!.every((element) => flags.includes(element));
        if (allElementsExist) {
          changeMessageIndex(messageIndex + increment);
        } else {
          next(increment + 1);
        }
      } else {
        changeMessageIndex(messageIndex + increment);
      }
    } else {
      if (chapters.length > chapterIndex + 1) {
        gameStatus.isLoading = true;
        gameStatus.isTransitioning = true;
        setTimeout(() => {
          gameStatus.chapterIndex++;
          increment = 0;
          gameStatus.messageIndex = 0;
          gameStatus.isTransitioning = false;
          // Note: App side useEffect in StoreStage will update things
        }, 1000);
      }
    }
  };

  const handleClick = () => {
    if (gameStatus.isLoading) return;
    if (
      gamgeConfig.chapters[gameStatus.chapterIndex]?.scenes[
        gameStatus.messageIndex
      ]?.items
    ) {
      return;
    }
    next(1);
  };

  const itemSelected = useCallback(() => {
    next(1);
  }, [next]);


  const handleExit = useCallback(() => {
    onExit();
  }, [onExit]);

  const locationLeftOffset =
    document.body.clientWidth > 1280
      ? (document.body.clientWidth - 1280) / 2
      : 0;

  if (chapters.length === 0) {
    return <Loading />;
  }

  const backgroundConfig = config.backgrounds.find(
    (bg) => bg.key === chapters[chapterIndex]?.scenes[messageIndex]?.background
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
    </Suspense>
  );
};

export default StoryStage;
