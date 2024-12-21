import { useState, useEffect, useRef } from "react";

const GoodEnd = () => {
  // 表示内容のデータ
  const contents = [
    {
      image: "images/endroll_hoshina_1.jpg",
      text: "星奈 結愛: 水瀬 玲奈（にじボイス）",
    },
    {
      image: "images/endroll_naruse_1.jpg",
      text: "成瀬 陽介: 久咲 悠仁（にじボイス）",
    },
    {
      image: "images/endroll_shibukawa_1.jpg",
      text: "渋川 猛: ベン・カーター（にじボイス）",
    },
    {
      image: "images/endroll_sister_1.jpg",
      text: "妹: 橘 すずか（にじボイス）",
    },
    {
      image: "images/endroll_aisa_1.jpg",
      text: "華宮 葵紗: 若宮 紬（にじボイス）",
    },
    {
      image: "images/endroll_aisa_father_1.jpg",
      text: "葵紗の父: ヴィクター・D・アシュフォード（にじボイス）",
    },
    {
      image: "images/hero.png",
      text: "Music: SUNO\n\n・時空を超えた愛\n・夢見る騎士\n・Playful Keys\n・Dance with the Night\n・Monsters in the Dark",
    },
    {
      image: "images/top_background.png",
      text: "きっと人にはそれぞれの世界があって\n私たちはお互いの世界を知らずに生きている",
    },
    {
      image: "images/title.png",
      text: "原作： Ueda",
    },
    {
      image: "images/title.png",
      text: "おしまい（Good End）",
    },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = "./bgms/時空を超えた愛.mp3";
      audioRef.current.volume = 0.2;
      audioRef.current.play();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex + 1 === contents.length) {
            clearInterval(interval);
            return prevIndex;
          } else {
            return prevIndex + 1;
          }
        });
        setIsTransitioning(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [contents.length]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen bg-black text-white">
      {/* 画像 */}
      <div className="flex flex-1 items-center justify-center">
        <img
          src={contents[currentIndex].image}
          alt="Staff Image"
          className={`max-w-4/5 max-h-4/5 object-contain transition-transform duration-500 ${
            isTransitioning ? "blur-sm opacity-50" : "blur-none opacity-100"
          }`}
        />
      </div>
      {/* テキスト */}
      <div
        className={`flex flex-1 items-center justify-center text-center transition-all duration-500 ${
          isTransitioning ? "blur-sm opacity-50" : "blur-none opacity-100"
        }`}
      >
        <p className="text-2xl font-bold whitespace-pre-wrap">
          {contents[currentIndex].text}
        </p>
      </div>
      <audio ref={audioRef} loop />
    </div>
  );
};

export default GoodEnd;
