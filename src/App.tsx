import { useEffect, useState, Suspense } from "react";
import "./App.css";
import StoryStage from "./pages/StoryStage";
import {
  gamgeConfig,
  gameStatus,
  Chapter,
  SavedItem,
} from "./controls/Store";
import Loading from "./controls/common/Loading";
import AssetLoader from "./utils/AssetLoader";
import Top from "./pages/Top";
import LoadingOverlay from "./controls/common/LoadingOverlay";
import { ToastProvider } from "./controls/common/Toast";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";

function App() {
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStoryDataLoaded, setIsStoryDataLoaded] = useState(false);
  const { i18n } = useTranslation();
  const { chapterIndex } = useSnapshot(gameStatus);

  useEffect(() => {
    const loadStory = async () => {
      const response = await fetch(`./assets/Story.${i18n.language}.json`);
      const story = await response.json();
      gamgeConfig.chapters = story.chapters as any as Chapter[];
      gamgeConfig.config = story.config;
      gameStatus.chapterIndex = 0;
      setIsStoryDataLoaded(true);
    };
    loadStory();
  }, [i18n.language]);

  // Reset asset loading state when chapter changes
  useEffect(() => {
    if (chapterIndex >= 0) {
      setIsAssetsLoaded(false);
    }
  }, [chapterIndex]);

  const handleLoadComplete = () => {
    setIsAssetsLoaded(true);
  };

  const handleStart = () => {
    gameStatus.chapterIndex = 0;
    gameStatus.messageIndex = 0;
    gameStatus.flags = [];
    setIsLoading(true);
    setTimeout(() => {
      setShowTopMenu(false);
    }, 1000);
  };

  const handleContinue = (savedGame: SavedItem) => {
    gameStatus.cameraDirection = savedGame.gameStatus.cameraDirection;
    gameStatus.flags = [...savedGame.gameStatus.flags];
    gameStatus.chapterIndex = savedGame.gameStatus.chapterIndex;
    gameStatus.messageIndex = savedGame.gameStatus.messageIndex;

    setIsLoading(true);
    setTimeout(() => {
      setShowTopMenu(false);
    }, 1000);
  };

  const handleLoadingClose = () => {
    setIsLoading(false);
  };

  const handleExit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowTopMenu(true);
    }, 1000);
  };

  return (
    <ToastProvider>
      <Suspense fallback={<Loading />}>
        <AssetLoader
          chapterIndex={chapterIndex}
          onLoadComplete={handleLoadComplete}
        />
      </Suspense>
      {isStoryDataLoaded ? (
        showTopMenu ? (
          <Top onStart={handleStart} onContinue={handleContinue} />
        ) : isAssetsLoaded ? (
          <StoryStage onExit={handleExit} />
        ) : (
          <div className="bg-black w-screen h-screen" />
        )
      ) : (
        <Loading />
      )}
      {(isLoading || (!isAssetsLoaded && !showTopMenu)) && (
        <LoadingOverlay
          onClose={handleLoadingClose}
          loading={!isAssetsLoaded && !showTopMenu}
        />
      )}
      {!isAssetsLoaded && chapterIndex >= 0 && showTopMenu && <Loading />}
    </ToastProvider>
  );
}

export default App;
