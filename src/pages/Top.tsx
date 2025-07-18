import { FC, useEffect, useRef, useState } from "react";
import { SavedItem } from "../controls/Store";
import { loadData } from "../controls/common/LocalStorage";
import { useToast } from "../controls/common/Toast";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

type BubbleProps = {
  delay: number;
  duration: number;
  left: number;
  size: number;
};

const Bubble: FC<BubbleProps> = ({ delay, duration, left, size }) => {
  return (
    <div
      className="bubble absolute rounded-full opacity-70"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle at 30% 30%, rgba(255, 192, 203, 0.8), rgba(255, 182, 193, 0.6), rgba(255, 105, 180, 0.4))`,
        boxShadow: `
          inset 0 0 ${size / 4}px rgba(255, 255, 255, 0.6),
          0 0 ${size / 2}px rgba(255, 192, 203, 0.3)
        `,
        animation: `float ${duration}s infinite linear ${delay}s`,
        bottom: "-100px",
      }}
    />
  );
};

const Top: React.FC<{
  onStart: () => void;
  onContinue: (savedGame: SavedItem) => void;
}> = ({ onStart, onContinue }) => {
  const [showSaveList, setShowSaveList] = useState(false);
  const [savedGames, setSavedGames] = useState<SavedItem[]>([]);
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // シャボン玉の設定
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    left: Math.random() * 100,
    size: 20 + Math.random() * 40,
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = "./bgms/5min_love.mp3";
      audioRef.current.volume = 0.05;
      audioRef.current.play();
    }
  }, []);

  useEffect(() => {
    if (showSaveList) {
    }
  }, [showSaveList]);

  const handleContinue = () => {
    const loadedSaves = loadData();
    if (loadedSaves.length === 0) {
      showToast(t("no_save_data"));
    } else {
      setSavedGames(loadedSaves);
      setShowSaveList(true);
    }
  };

  const handleLoadGame = (savedGame: SavedItem) => {
    console.log("Loading game:", savedGame);
    onContinue(savedGame);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="top-menu h-screen w-screen flex flex-col items-center justify-center text-white gap-4 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .bubble {
          animation-fill-mode: both;
        }

        .bubble::before {
          content: "";
          position: absolute;
          top: 10%;
          left: 10%;
          width: 25%;
          height: 25%;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          filter: blur(1px);
        }
      `}</style>

      {/* シャボン玉 */}
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          delay={bubble.delay}
          duration={bubble.duration}
          left={bubble.left}
          size={bubble.size}
        />
      ))}

      <audio ref={audioRef} loop />
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => changeLanguage("ja")}
          className={clsx(
            "p-2 w-16 rounded-md mr-4",
            i18n.language === "ja"
              ? "text-black border-solid border-2 border-sky-600"
              : "bg-sky-600 text-white"
          )}
        >
          JP
        </button>
        <button
          onClick={() => changeLanguage("en")}
          className={clsx(
            "p-2 w-16 rounded-md ",
            i18n.language === "en"
              ? "text-black border-solid border-2 border-sky-600"
              : "bg-sky-600 text-white"
          )}
        >
          EN
        </button>
      </div>
      <h1 className="text-white absolute top-5 left-5 z-10">{t("title")}</h1>
      <img className="w-96 z-10" src="./images/title.png" alt="Title Logo" />
      <button
        className="bg-pink-500 px-6 py-3 mb-4 rounded hover:bg-pink-400 text-xl mt-16 z-10"
        onClick={onStart}
      >
        {t("start")}
      </button>
      <button
        className="bg-pink-500 px-6 py-3 rounded hover:bg-pink-400 text-xl z-10"
        onClick={handleContinue}
      >
        {t("continue")}
      </button>
      <div
        className="text-sm text-pink-600 mt-8 z-10"
        dangerouslySetInnerHTML={{ __html: t("memory_warning") }}
      ></div>

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
            {t("close")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Top;
