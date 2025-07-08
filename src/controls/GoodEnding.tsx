import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const GoodEnd = () => {
  const { t } = useTranslation();
  const contents = [
    {
      image: "images/endroll_hoshina_1.jpg",
      text: t("GoodEnd.hoshina"),
    },
    {
      image: "images/endroll_naruse_1.jpg",
      text: t("GoodEnd.naruse"),
    },
    {
      image: "images/endroll_shibukawa_1.jpg",
      text: t("GoodEnd.shibukawa"),
    },
    {
      image: "images/endroll_sister_1.jpg",
      text: t("GoodEnd.sister"),
    },
    {
      image: "images/endroll_aisa_1.jpg",
      text: t("GoodEnd.aisa"),
    },
    {
      image: "images/endroll_aisa_father_1.jpg",
      text: t("GoodEnd.aisa_father"),
    },
    {
      image: "images/hero.png",
      text: t("GoodEnd.music"),
    },
    {
      image: "images/top_background.png",
      text: t("GoodEnd.world"),
    },
    {
      image: "images/title.png",
      text: t("GoodEnd.original"),
    },
    {
      image: "images/title.png",
      text: t("GoodEnd.end"),
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
            clearInterval(interval); // すべて表示したらintervalを停止
            return prevIndex; // インデックスはそのまま
          }
          return prevIndex + 1;
        });
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }, 500); // アニメーション時間に合わせる
    }, 5000);

    return () => clearInterval(interval); // クリーンアップ
  }, [contents.length]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen bg-black text-white">
      {/* 画像 */}
      <div className="w-96 flex flex-1 items-center justify-center relative">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={contents[currentIndex].image}
            alt="Staff Image"
            className="max-w-4/5 max-h-4/5 object-contain"
          />
        </div>
      </div>
      {/* テキスト */}
      <div
        className={` w-96 flex flex-1 items-center justify-center text-center transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
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
