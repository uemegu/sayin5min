import React, { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import store from "./Store";

const BGM: React.FC = () => {
  const { chapters, messageIndex, chapterIndex, config } = useSnapshot(store);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentScene = chapters[chapterIndex].scenes[messageIndex];
  const bgmConfig = config.bgms?.find((bgm) => bgm.key === currentScene?.bgm);
  const bgmUrl = bgmConfig ? bgmConfig.value : "";
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (bgmUrl && audioRef.current) {
      if (audioRef.current.src !== bgmUrl) {
        audioRef.current.src = bgmUrl;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [bgmUrl, isPlaying]);

  const handleToggleBGM = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop />
      <button
        className="absolute text-sm top-0 h-8 right-0 p-2 text-white"
        onClick={handleToggleBGM}
      >
        {isPlaying ? "BGMをOFFにする" : "BGMをONにする"}
      </button>
    </>
  );
};

export default BGM;
