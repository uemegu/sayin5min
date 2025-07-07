import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        title: "Say in 5 minutes",
        start: "New Game",
        continue: "Continue",
        no_save_data: "No save data",
        close: "Close",
        memory_warning:
          "May error on smartphones and tablets due to insufficient memory.",
        "bgm on": "BGM ON",
        "bgm off": "BGM OFF",
        exit: "Exit",
        save: "Save",
        save_success: "Game progress saved.",
        save_failed: "Failed to save game progress.",
        GoodEnd: {
          hoshina: "Yua Hoshina",
          naruse: "Yosuke Naruse",
          shibukawa: "Takeshi Shibukawa",
          sister: "Sister",
          aisa: "Aisa Kamiya",
          aisa_father: "Aisa's Father",
          music:
            "Music: SUNO\n\n・Love Beyond Time and Space\n・Dreaming Knight\n・Playful Keys\n・Dance with the Night\n・Monsters in the Dark",
          world:
            "Everyone has their own world,\nand we live without knowing each other's worlds.",
          original: "Original Story: Ueda",
          end: "The End\n(Good End)",
        },
      },
    },
    ja: {
      translation: {
        title: "5分で言える",
        start: "はじめから",
        continue: "つづきから",
        no_save_data: "セーブデータがありません",
        close: "閉じる",
        memory_warning:
          "スマートフォン、タブレットの場合は<br></br>メモリ不足のため途中でエラーになる可能性があります",
        "bgm on": "BGMをONにする",
        "bgm off": "BGMをOFFにする",
        exit: "終了する",
        save: "保存する",
        save_success: "ゲームの進行状況を保存しました。",
        save_failed: "ゲームの進行状況を保存に失敗しました。",
        GoodEnd: {
          hoshina: "星奈 結愛",
          naruse: "成瀬 陽介",
          shibukawa: "渋川 猛",
          sister: "妹",
          aisa: "華宮 葵紗",
          aisa_father: "葵紗の父",
          music:
            "Music: SUNO\n\n・時空を超えた愛\n・夢見る騎士\n・Playful Keys\n・Dance with the Night\n・Monsters in the Dark",
          world:
            "人にはそれぞれの世界があって\n私たちはお互いの世界を知らずに生きている",
          original: "原作： Ueda",
          end: "おしまい\n（Good End）",
        },
      },
    },
  },
  lng: "ja",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
