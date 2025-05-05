import Meyda from "meyda";

export class AudioAnalyzer {
  audioAnalyzeCallback: (phoneme: string | undefined) => void;
  audioContext: AudioContext;
  private analyzer: any;
  private lastPhoneme?: string;

  constructor(audioAnalyzeCallback: (phoneme: string | undefined) => void) {
    this.audioAnalyzeCallback = audioAnalyzeCallback;
    this.audioContext = new window.AudioContext();
  }

  /**
   * 簡易的MFCCベースの音素推測ロジック
   * mfcc[1]（第2係数）を使って閾値判定
   */
  private guessPhonemeMfcc(mfcc: number[]): string | undefined {
    const c1 = mfcc[1];
    if (Math.abs(c1) < 10) {
      return "nn";
    }
    if (c1 < -60) {
      return "aa"; // 低域母音
    } else if (c1 < -40) {
      return "ee"; // 中低域母音
    } else if (c1 < -20) {
      return "ih"; // 中域母音
    } else if (c1 < 20) {
      return "oh"; // 中高域母音
    } else if (c1 < 40) {
      return "ou"; // 高域母音
    } else {
      return "nn"; // 鼻音／閉鎖音
    }
  }

  /**
   * MediaStream からリアルタイムに音声を解析し、音素をコールバック
   */
  setAudioAnalyzerForMediaStream(mediaStream: MediaStream) {
    const source = this.audioContext.createMediaStreamSource(mediaStream);

    this.analyzer = Meyda.createMeydaAnalyzer({
      audioContext: this.audioContext,
      source,
      bufferSize: 512, // リアルタイム寄りに軽量
      featureExtractors: ["mfcc"], // MFCCを抽出
      callback: (features: { mfcc: number[] }) => {
        const { mfcc } = features;

        const phoneme = this.guessPhonemeMfcc(mfcc);
        // 前回結果と変わったらコール
        if (this.lastPhoneme !== phoneme) {
          this.audioAnalyzeCallback(phoneme);
          this.lastPhoneme = phoneme;
        }
      },
    });

    this.analyzer.start();
  }

  /** 解析を停止 */
  stop() {
    this.analyzer?.stop();
    this.lastPhoneme = undefined;
  }
}

export default AudioAnalyzer;
