export interface BgmTrackDefinition {
  key: string;
  url: string;
}

export const CUSTOM_BGM_TRACKS: readonly BgmTrackDefinition[] = [
  {
    key: 'bgm-track-stay-house',
    url: 'assets/audio/I Really Want to Stay at Your House-Samuel Kim, Lorien.mp3',
  },
  {
    key: 'bgm-track-brave-shine',
    url: 'assets/audio/Brave Shine (勇气之光)-Aimer.mp3',
  },
  {
    key: 'bgm-track-last-stardust',
    url: 'assets/audio/LAST STARDUST-Aimer.mp3',
  },
  {
    key: 'bgm-track-silhouette',
    url: 'assets/audio/シルエット (剪影)-KANA-BOON.mp3',
  },
  {
    key: 'bgm-track-last-journey',
    url: 'assets/audio/最后的旅行-记《龙族》绘梨衣-Rainton桐.mp3',
  },
];

export const CUSTOM_BGM_TRACK_KEYS: readonly string[] = CUSTOM_BGM_TRACKS.map((track) => track.key);
