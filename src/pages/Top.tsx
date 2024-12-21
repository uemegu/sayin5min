import { useEffect, useState } from "react";
import { SavedItem } from "../controls/Store";
import { loadData } from "../controls/common/LocalStorage";
import { useToast } from "../controls/common/Toast";

const Top: React.FC<{
  onStart: () => void;
  onContinue: (savedGame: SavedItem) => void;
}> = ({ onStart, onContinue }) => {
  const [showSaveList, setShowSaveList] = useState(false);
  const [savedGames, setSavedGames] = useState<SavedItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (showSaveList) {
    }
  }, [showSaveList]);

  const handleContinue = () => {
    const loadedSaves = loadData();
    if (loadedSaves.length === 0) {
      showToast("セーブデータがありません");
    } else {
      setSavedGames(loadedSaves);
      setShowSaveList(true);
    }
  };

  const handleLoadGame = (savedGame: SavedItem) => {
    console.log("Loading game:", savedGame);
    onContinue(savedGame);
  };

  return (
    <div className="top-menu h-screen w-screen flex flex-col items-center justify-center text-white gap-4">
      <img className="w-96" src="./images/title.png" alt="Title Logo" />
      <button
        className="bg-pink-500 px-6 py-3 mb-4 rounded hover:bg-pink-400 text-xl mt-16"
        onClick={onStart}
      >
        はじめから
      </button>
      <button
        className="bg-pink-500 px-6 py-3 rounded hover:bg-pink-400 text-xl"
        onClick={handleContinue}
      >
        つづきから
      </button>
      <div className="text-sm text-pink-600 mt-8">
        スマートフォン、タブレットの場合は<br></br>
        メモリ不足のため途中でエラーになる可能性があります
      </div>

      {showSaveList && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-30">
          <div className="bg-white rounded-lg max-h-[75%] overflow-y-auto">
            {savedGames
              .sort((a, b) => (a.savedData < b.savedData ? 1 : -1))
              .map((savedGame, index) => (
                <div
                  key={index}
                  className="flex p-4 items-center justify-between p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleLoadGame(savedGame)}
                >
                  <img
                    src={savedGame.screenShot}
                    alt="Save Screenshot"
                    className="w-32 mr-16 w-48"
                  />
                  <div className="w-64 mr-16">
                    <p className="text-gray-800 w-92 text-left font-bold">
                      {savedGame.savedData}
                    </p>
                    <p className="text-gray-800 w-92 text-left font-bold mb-4">
                      {savedGame.location}
                    </p>
                    <p className="text-gray-800 w-92 text-left italic">
                      {savedGame.text}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <button
            className="bg-pink-500 text-white px-4 py-2 w-48 rounded mt-4 hover:bg-pink-400"
            onClick={() => setShowSaveList(false)}
          >
            閉じる
          </button>
        </div>
      )}

      <img
        className="h-full w-full fixed opacity-15 pointer-events-none"
        src="./images/top_background.png"
        alt="Background"
      />
    </div>
  );
};

export default Top;
