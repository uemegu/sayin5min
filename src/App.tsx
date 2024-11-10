import { useEffect, useState, Suspense } from "react";
import "./App.css";
import StoryStage from "./pages/StoryStage";
import StorySetting, { Chapter } from "./controls/Store";
import Loading from "./controls/common/Loading";
import json from "./assets/Story.json";
import AssetLoader from "./utils/AssetLoader";
import Top from "./pages/Top";
import LoadingOverlay from "./controls/common/LoadingOverlay";

function App() {
  const [isStoryLoaded, setIsStoryLoaded] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    StorySetting.chapters = json.chapters as Chapter[];
    StorySetting.config = json.config;
    StorySetting.chapterIndex = 0;
  }, []);

  const handleLoadComplete = () => {
    setIsStoryLoaded(true);
  };

  const handleStart = () => {
    StorySetting.chapterIndex = 0;
    setIsLoading(true);
    setTimeout(() => {
      setShowTopMenu(false);
    }, 1000);
  };

  const handleContinue = () => {
    setShowTopMenu(false);
  };

  function handleLoadingClose(): void {
    setIsLoading(false);
  }

  return (
    <>
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
      {!isStoryLoaded && <Loading />}
    </>
  );
}

export default App;
