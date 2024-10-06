import React, { FC, ReactNode } from "react";
import { useSnapshot } from "valtio";
import StorySetting from "./Store";
import Button from "./Button";

type ItemsDisplayProps = {};

const ItemsDisplay: FC<ItemsDisplayProps> = () => {
  const { chapters, messageIndex, chapterIndex } = useSnapshot(StorySetting);
  const currentScene = chapters[chapterIndex]?.scenes[messageIndex];

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
      {currentScene?.items?.map((i, index) => (
        <Button
          key={index}
          onClick={() => {
            if (i.flg) {
              console.log(`${i.flg}が立ちました`);
              StorySetting.flags.push(i.flg);
            }
          }}
        >
          {i.text}
        </Button>
      ))}
    </div>
  );
};

export default ItemsDisplay;
