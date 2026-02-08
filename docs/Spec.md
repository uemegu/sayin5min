# Spec.md (プロジェクト仕様書)

## 1. プロジェクト概要
本作は、React, Three.js, @react-three/fiber をベースとした3Dビジュアルノベル（アドベンチャーゲーム）です。VRM形式の3Dモデルを使用し、表情豊かなキャラクター演出と、選択肢によるストーリー分岐を実現しています。

## 2. ディレクトリ構成
```text
/
├── public/
│   ├── assets/       # ストーリーJSON (Story.ja.json, Story.en.json)
│   ├── models/       # キャラクターVRMモデル
│   ├── animations/   # Mixamoアニメーション(FBX)
│   ├── bgms/         # BGMファイル (SUNO生成)
│   ├── voice/        # ボイスファイル
│   └── images/       # 背景・アイテム・UI用画像
├── src/
│   ├── pages/        # ページコンポーネント (Top, StoryStage)
│   ├── controls/     # 主要コンポーネント
│   │   ├── common/   # 共通パーツ (BGM, UI部品, セーブ等)
│   │   ├── Avatar    # VRMモデルの制御ロジック
│   │   ├── Canvas    # R3F(React Three Fiber)の描画舞台
│   │   └── Store     # Valtioによる状態管理
│   ├── i18n.ts       # 多言語対応設定
│   └── main.tsx      # エントリポイント
```

## 3. 主要ファイルの機能

### 3.1 状態管理 (`src/controls/Store.ts`)
`valtio` を使用したプロキシベースの状態管理。
- `gamgeConfig`: ストーリーの定義データ（JSONの内容を読み込んだもの）。
- `gameStatus`: チャプター/シーンのインデックス、フラグ（選択肢の結果）などの動的なゲーム状態。
- `avatarCache` 等: リソースのメモリ管理。

### 3.2 描画・演出 (`src/controls/Canvas.tsx`, `src/controls/Avatar.tsx`)
- **CanvasComponent**: 3D空間のセットアップ、照明、ポストプロセス（Bloom, ToneMapping, Hue/Saturation）を担当。
- **Avatar**: VRMモデルの表示、表情制御、アニメーション再生、およびボイスに連動したリップシンク（Morph Target制御）を実行。

### 3.3 ストーリー進行 (`src/pages/StoryStage.tsx`)
ゲームのメインループを担当。
- `Store` から現在のシーン情報を取得。
- テキストの1文字ずつの表示、背景切り替え、BGM/ボイスの再生制御。
- 選択肢（Items）によるフラグ管理とストーリー分岐、`goto` によるシーン遷移。

### 3.4 セーブ・ロード (`src/controls/common/LocalStorage.ts`)
- `localStorage` を利用した永続化。
- セーブデータは `CryptoJS` (AES) により暗号化されて保存される。

## 4. ストーリーJSONスキーマ
`public/assets/Story.ja.json` 等で定義される。

### 構成
- `version`: スキーマバージョン。
- `config`: リソース定義マップ（avatars, animations, backgrounds, bgms, voices）。
- `chapters`: チャプターの配列。

### Scene オブジェクトの役割
各シーンは以下のプロパティでストーリーを構築する。
- `text`: 表示される文章（「」で名前とセリフを分離）。
- `location`: 画面左上に表示される場所名。
- `avatars`: 登場キャラリスト。`id`, `action`(アニメ名), `expression`(表情), `attension`(カメラ注視), `zoom` 指定が可能。
- `background`: 背景画像のキー。
- `bgm` / `voice`: 再生する音源のキー。
- `items`: 選択肢。選んだ際に `flg` を立てる。
- `conditions`: 特定のフラグが立っている場合のみ実行される条件。
- `goto`: 特定のチャプター.シーンへジャンプするためのナビゲーション。
- `image`: 画面中央に挿入される静止画。
- `effect`: 画面全体の輝度・コントラスト制御（light/dark）。

## 5. 特筆すべきロジック
- **リップシンク**: `AudioAnalyzer` が音声から母音（a, e, i, o, u）の重みを抽出し、VRMの `expressionManager` を介してリアルタイムに口を動かす。
- **アニメーションリターゲティング**: MixamoのFBXアニメーションをVRMの Normalized Bone 向けに変換して適用するロジックを `Avatar.tsx` 内に保持。
- **カメラワーク**: gsap を使用し、話者や `attension` 指定されたキャラクターへスムーズにカメラを移動・回転させる。
