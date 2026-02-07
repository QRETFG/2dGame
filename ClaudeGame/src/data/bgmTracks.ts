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
    key: 'bgm-track-moon-halo',
    url: 'assets/audio/Moon Halo-崩坏3《薪炎永燃》动画短片印象曲-茶理理理子&TetraCalyx&hanser&HOYO-MiX.flac',
  },
  {
    key: 'bgm-track-sign',
    url: 'assets/audio/Sign-FLOW.mp3',
  },
  {
    key: 'bgm-track-nandemonaiya',
    url: 'assets/audio/なんでもないや-《你的名字。》动画电影片尾曲-RADWIMPS.flac',
  },
  {
    key: 'bgm-track-silhouette',
    url: 'assets/audio/シルエット (剪影)-KANA-BOON.mp3',
  },
  {
    key: 'bgm-track-mitsuha-theme',
    url: 'assets/audio/三葉のテーマ-RADWIMPS.flac',
  },
  {
    key: 'bgm-track-never-left',
    url: 'assets/audio/你从未离去-白挺&熊出没.flac',
  },
  {
    key: 'bgm-track-zenzenzense',
    url: 'assets/audio/前前前世-《你的名字。》动画电影主题曲-RADWIMPS.flac',
  },
  {
    key: 'bgm-track-yumetourou',
    url: 'assets/audio/夢灯籠-《你的名字。》动画电影片头曲-RADWIMPS.flac',
  },
  {
    key: 'bgm-track-not-forgotten',
    url: 'assets/audio/我不曾忘记-《原神》游戏2023新春会同人曲-花玲&张安琪&沐霏.flac',
  },
  {
    key: 'bgm-track-i-remember',
    url: 'assets/audio/我记得-赵雷.flac',
  },
  {
    key: 'bgm-track-last-journey',
    url: 'assets/audio/最后的旅行-记《龙族》绘梨衣-Rainton桐.mp3',
  },
];

export const CUSTOM_BGM_TRACK_KEYS: readonly string[] = CUSTOM_BGM_TRACKS.map((track) => track.key);
