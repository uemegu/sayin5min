import { useEffect, useState, Suspense } from "react";
import "./App.css";
import StoryStage from "./pages/StoryStage";
import { gamgeConfig, gameStatus, Chapter, SavedItem } from "./controls/Store";
import Loading from "./controls/common/Loading";
import AssetLoader from "./utils/AssetLoader";
import Top from "./pages/Top";
import LoadingOverlay from "./controls/common/LoadingOverlay";
import { ToastProvider } from "./controls/common/Toast";
import { useTranslation } from "react-i18next";

function App() {
  const [isStoryLoaded, setIsStoryLoaded] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStoryDataLoaded, setIsStoryDataLoaded] = useState(false); // New state
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const loadStory = async () => {
      const response = await fetch(`./assets/Story.${i18n.language}.json`);
      const story = await response.json();
      gamgeConfig.chapters = story.chapters as any as Chapter[];
      gamgeConfig.config = story.config;
      gameStatus.chapterIndex = 0;
      setIsStoryDataLoaded(true); // Set to true after data is loaded
    };
    loadStory();
  }, [i18n.language]);

  const handleLoadComplete = () => {
    setIsStoryLoaded(true);
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ToastProvider>
      <Suspense fallback={<Loading />}>
        <AssetLoader onLoadComplete={handleLoadComplete} />
      </Suspense>
      {isStoryDataLoaded ? (
        showTopMenu ? (
          <Top onStart={handleStart} onContinue={handleContinue} />
        ) : (
          <>
            <StoryStage onExit={handleExit} />
          </>
        )
      ) : (
        <Loading />
      )}
      {isLoading && <LoadingOverlay onClose={handleLoadingClose} />}
      {!isStoryLoaded && <Loading />}{" "}
      
    </ToastProvider>
  );
}

export default App;
