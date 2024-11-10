import { useEffect, useState, Suspense } from "react";
import "./App.css";
import StoryStage from "./pages/StoryStage";
import { gamgeConfig, gameStatus, Chapter, SavedItem } from "./controls/Store";
import Loading from "./controls/common/Loading";
import json from "./assets/Story.json";
import AssetLoader from "./utils/AssetLoader";
import Top from "./pages/Top";
import LoadingOverlay from "./controls/common/LoadingOverlay";
import { ToastProvider } from "./controls/common/Toast";
import { saveData } from "./controls/common/LocalStorage";

function App() {
  const [isStoryLoaded, setIsStoryLoaded] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    gamgeConfig.chapters = json.chapters as Chapter[];
    gamgeConfig.config = json.config;
    gameStatus.chapterIndex = 0;
  }, []);

  const handleLoadComplete = () => {
    setIsStoryLoaded(true);
  };

  const handleStart = () => {
    gameStatus.chapterIndex = 0;
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

  function handleLoadingClose(): void {
    setIsLoading(false);
  }

  return (
    <ToastProvider>
      <Suspense fallback={<Loading />}>
        <AssetLoader onLoadComplete={handleLoadComplete} />
      </Suspense>
      {showTopMenu ? (
        <Top onStart={handleStart} onContinue={handleContinue} />
      ) : (
        <>
          <StoryStage />
        </>
      )}
      {isLoading && <LoadingOverlay onClose={handleLoadingClose} />}
      {!isStoryLoaded && <Loading />}{" "}
    </ToastProvider>
  );
}

export default App;
