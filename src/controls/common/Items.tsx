import { FC } from "react";
import { useSnapshot } from "valtio";
import { gameStatus, gamgeConfig } from "../Store";
import Button from "./Button";

type ItemsDisplayProps = {
  onClick: () => void;
};

const ItemsDisplay: FC<ItemsDisplayProps> = ({ onClick }) => {
  const { chapters } = useSnapshot(gamgeConfig);
  const { messageIndex, chapterIndex } = useSnapshot(gameStatus);
  const currentScene = chapters[chapterIndex]?.scenes[messageIndex];
  const rotate =
    currentScene?.items?.length == 3
      ? ["rotate-6", "rotate-0", "-rotate-6"]
      : ["rotate-6", "rotate-2", "-rotate-2", "-rotate-6"];

  return (
    <>
      {currentScene?.items && (
        <img
          src="./images/hero.png"
          className="fixed lg:top-1/2 top-1/3 left-1/2 w-44 h-44 transform translate-x-4 -translate-y-1/2 "
        ></img>
      )}
      <div className="fixed top-1/2 left-1/2 transform lg:-translate-x-full -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
        {currentScene?.items?.map((i, index) => (
          <div key={index} className={rotate[index]}>
            <div
              className={`transform -translate-x-24 opacity-0 animate-slide-in animation-delay-${index}`}
            >
              <Button
                onClick={() => {
                  if (i.flg) {
                    console.log(`${i.flg}が立ちました`);
                    gameStatus.flags.push(i.flg);
                  }
                  if (onClick) onClick();
                }}
              >
                {i.text}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ItemsDisplay;
