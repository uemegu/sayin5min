import React, { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { gamgeConfig, gameStatus } from "../Store";
import AudioAnalyzer from "./AudioAnalyzer";

const BGM: React.FC = () => {
  const { chapters, config } = useSnapshot(gamgeConfig);
  const { messageIndex, chapterIndex } = useSnapshot(gameStatus);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const currentScene = chapters[chapterIndex].scenes[messageIndex];
  const bgmConfig = config.bgms?.find((bgm) => bgm.key === currentScene?.bgm);
  const bgmUrl = bgmConfig ? bgmConfig.value : "";
  const voiceConfig = config.voices?.find(
    (voice) => voice.key === currentScene?.voice
  );
  const voiceUrl = voiceConfig ? voiceConfig.value : "";
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (bgmUrl && audioRef.current) {
      if (audioRef.current.src !== bgmUrl) {
        audioRef.current.src = bgmUrl;
        audioRef.current.volume = 0.2;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [bgmUrl, isPlaying]);

  useEffect(() => {
    if (voiceUrl && audioRef2.current) {
      if (audioRef2.current.src !== voiceUrl) {
        audioRef2.current.src = voiceUrl;
        if (isPlaying) {
          audioRef2.current.play();
        }
      }
    }
  }, [voiceUrl]);

  useEffect(() => {
    if (audioRef2.current) {
      try {
        const audioContext = new AudioContext();
        const sourceNode = audioContext.createMediaElementSource(
          audioRef2.current
        );
        const dest = audioContext.createMediaStreamDestination();
        sourceNode.connect(dest);
        sourceNode.connect(audioContext.destination);
        const mediaStream = dest.stream;
        const analyzer = new AudioAnalyzer((p) => {
          gamgeConfig.phoneme = p;
          console.log(p);
        });
        analyzer.setAudioAnalyzerForMediaStream(mediaStream);
      } catch {}
    }
  }, []);

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
      <audio ref={audioRef2} />
      <button
        className="absolute text-sm top-0 h-8 right-48 p-2 text-white hover:underline"
        onClick={handleToggleBGM}
      >
        {isPlaying ? "BGMをOFFにする" : "BGMをONにする"}
      </button>
    </>
  );
};

export default BGM;
