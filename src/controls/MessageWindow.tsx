import React, { useState, useEffect } from "react";
import next from "../assets/icon/next.svg";
import { useSnapshot } from "valtio";
import { gamgeConfig, gameStatus } from "./Store";

const MessageWindow: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { chapters } = useSnapshot(gamgeConfig);
  const { messageIndex, chapterIndex } = useSnapshot(gameStatus);
  const [currentMessage, setCurrentMessage] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentScene = chapters[chapterIndex]?.scenes[messageIndex];
    if (currentScene && charIndex < currentScene.text.length) {
      const timer = setTimeout(() => {
        setCurrentMessage((prev) => prev + currentScene.text[charIndex]);
        setCharIndex(charIndex + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [charIndex, messageIndex, chapterIndex, chapters]);

  useEffect(() => {
    setCurrentMessage("");
    setCharIndex(0);
  }, [messageIndex, chapterIndex]);

  const splitMessages = currentMessage.split("。");

  return (
    <div
      onClick={onClick}
      className="fixed bottom-0 left-0 right-0 h-96 text-xl p-4 pt-32 text-white  bg-gradient-to-b from-gray-950/0 via-gray-950/70 to-gray-950/100 flex justify-center"
    >
      <div className="text-left text-teal-100 w-[40rem] kiwi-maru-regular select-none">
        {" "}
        {splitMessages.map((message, index) => (
          <div key={index}>
            {message.includes("「") ? (
              <>
                <div className="font-bold text-sky-300">
                  {message.split("「")[0]}
                </div>
                <span>「{message.split("「")[1]}</span>
              </>
            ) : (
              message
            )}
            {index !== splitMessages.length - 1 && "。"}
          </div>
        ))}
      </div>
      {chapters[chapterIndex]?.scenes[messageIndex]?.text.length === charIndex &&
        !chapters[chapterIndex]?.scenes[messageIndex]?.items && (
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
