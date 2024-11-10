import React, { useState, useEffect } from "react";
import next from "../assets/icon/next.svg";
import { useSnapshot } from "valtio";
import { gamgeConfig, gameStatus } from "./Store";

const MessageWindow: React.FC = () => {
  const { chapters } = useSnapshot(gamgeConfig);
  const { messageIndex, chapterIndex } = useSnapshot(gameStatus);
  const [currentMessage, setCurrentMessage] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentScene = chapters[chapterIndex].scenes[messageIndex];
    if (currentScene && charIndex < currentScene.text.length) {
      const timer = setTimeout(() => {
        setCurrentMessage((prev) => prev + currentScene.text[charIndex]);
        setCharIndex(charIndex + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [charIndex, messageIndex, chapters]);

  useEffect(() => {
    setCurrentMessage("");
    setCharIndex(0);
  }, [messageIndex]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 text-xl p-4 pt-32 text-white  bg-gradient-to-b from-sky-950/0 via-gray-950/70 to-gray-950/90 ">
      <div className=" text-teal-100">{currentMessage}</div>
      {charIndex === chapters[chapterIndex].scenes[messageIndex]?.text.length &&
        !chapters[chapterIndex].scenes[messageIndex]?.items && (
          <span>
            <img
              src={next}
              className="rotate-90 absolute right-8 bottom-8 animate-bounce"
            ></img>
          </span>
        )}
    </div>
  );
};

export default MessageWindow;
