import React from "react";
import { useSnapshot } from "valtio";
import { gamgeConfig, gameStatus } from "../Store";
import { useToast } from "./Toast";
import { saveData } from "./LocalStorage";
import { captureElementScreenshot } from "video-canvas-screenshot";

const Save: React.FC = () => {
  const { messageIndex, chapterIndex, cameraDirection, flags } =
    useSnapshot(gameStatus);
  const { version } = useSnapshot(gamgeConfig);
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      const canvasElement = document.querySelector(
        "canvas"
      ) as HTMLCanvasElement;
      if (canvasElement) {
        captureElementScreenshot(canvasElement, (imageData) => {
          const text =
            gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
              gameStatus.messageIndex
            ].text;
          saveData({
            gameStatus: {
              cameraDirection: cameraDirection,
              messageIndex: messageIndex,
              chapterIndex: chapterIndex,
              flags: [...flags],
              version: version,
            },
            location:
              gamgeConfig.chapters[gameStatus.chapterIndex].scenes[
                gameStatus.messageIndex
              ].location,
            screenShot: imageData,
            savedData: new Date().toLocaleString(),
            text: text.length > 15 ? text.substring(0, 15) + "..." : text,
          });
          showToast("ゲームの進行状況を保存しました。");
        });
      }
    } catch (error) {
      console.error("save failed", error);
    }
  };

  return (
    <>
      <button
        className="absolute text-sm top-0 h-8 right-24 p-2 text-white hover:underline"
        onClick={handleSave}
      >
        保存する
      </button>
    </>
  );
};

export default Save;
