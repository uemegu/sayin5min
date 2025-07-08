import React from "react";
import { useSnapshot } from "valtio";
import { gamgeConfig, gameStatus } from "../Store";
import { useToast } from "./Toast";
import { saveData } from "./LocalStorage";
import { captureElementScreenshot } from "video-canvas-screenshot";
import { useTranslation } from "react-i18next";

const Save: React.FC = () => {
  const { messageIndex, chapterIndex, cameraDirection, flags } =
    useSnapshot(gameStatus);
  const { version } = useSnapshot(gamgeConfig);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleSave = async () => {
    try {
      const canvasElement = document.querySelector(
        "canvas"
      ) as HTMLCanvasElement;
      if (canvasElement) {
        captureElementScreenshot(
          canvasElement,
          (imageData) => {
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
            showToast(t("save_success"));
          },
          "image/webp"
        );
      }
    } catch (error) {
      console.error("save failed", error);
      showToast(t("save_failed"));
    }
  };

  return (
    <>
      <button
        className="absolute text-sm top-0 h-8 right-24 p-2 text-white hover:underline"
        onClick={handleSave}
      >
        {t("save")}
      </button>
    </>
  );
};

export default Save;
