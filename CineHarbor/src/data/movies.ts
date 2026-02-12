export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  description: string;
  poster: string;
  backdrop: string;
  url: string;
}

export interface SharedWebsite {
  id: number;
  title: string;
  tag: string;
  description: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: "movie", name: "电影", icon: "Clapperboard", count: 1280 },
  { id: "tv", name: "电视剧", icon: "Tv", count: 864 },
  { id: "anime", name: "动漫", icon: "Cat", count: 532 },
  { id: "documentary", name: "纪录片", icon: "Globe", count: 376 },
  { id: "variety", name: "综艺", icon: "PartyPopper", count: 248 },
  { id: "short", name: "短片", icon: "Film", count: 195 },
];

export const featuredMovies: Movie[] = [
  {
    id: 1,
    title: "星际穿越",
    year: 2014,
    rating: 9.4,
    genre: "科幻",
    description:
      "在不远的未来，地球环境急剧恶化，一队宇航员穿越虫洞寻找人类新家园。",
    poster: "/images/posters/interstellar.jpg",
    backdrop: "/images/backdrops/interstellar-bg.jpg",
    url: "https://movie.douban.com/subject/1889243/",
  },
  {
    id: 2,
    title: "千与千寻",
    year: 2001,
    rating: 9.4,
    genre: "动画",
    description:
      "少女千寻误入神灵世界，为拯救变成猪的父母，在汤屋展开奇幻冒险。",
    poster: "/images/posters/spirited-away.png",
    backdrop: "/images/backdrops/spirited-away-bg.jpg",
    url: "https://movie.douban.com/subject/1291561/",
  },
  {
    id: 3,
    title: "肖申克的救赎",
    year: 1994,
    rating: 9.7,
    genre: "剧情",
    description:
      "银行家安迪被冤入狱，在肖申克监狱中用智慧和毅力书写了一段传奇。",
    poster: "/images/posters/shawshank.jpg",
    backdrop: "/images/backdrops/shawshank-bg.jpg",
    url: "https://movie.douban.com/subject/1292052/",
  },
  {
    id: 4,
    title: "盗梦空间",
    year: 2010,
    rating: 9.3,
    genre: "科幻",
    description:
      "造梦师柯布带领团队深入目标的梦境，执行一项看似不可能的植入任务。",
    poster: "/images/posters/inception.jpg",
    backdrop: "/images/backdrops/inception-bg.jpg",
    url: "https://movie.douban.com/subject/3541415/",
  },
];

export const popularMovies: Movie[] = [
  {
    id: 5,
    title: "霸王别姬",
    year: 1993,
    rating: 9.6,
    genre: "剧情",
    poster: "/images/posters/farewell-my-concubine.jpg",
    backdrop: "",
    description: "两个京剧伶人半个世纪的悲欢离合，映射出时代的沧桑巨变。",
    url: "https://movie.douban.com/subject/1291546/",
  },
  {
    id: 6,
    title: "这个杀手不太冷",
    year: 1994,
    rating: 9.4,
    genre: "动作",
    poster: "/images/posters/leon.jpg",
    backdrop: "",
    description: "职业杀手莱昂与小女孩玛蒂尔达之间一段跨越年龄的温情故事。",
    url: "https://movie.douban.com/subject/1295644/",
  },
  {
    id: 7,
    title: "泰坦尼克号",
    year: 1997,
    rating: 9.5,
    genre: "爱情",
    poster: "/images/posters/titanic.png",
    backdrop: "",
    description: "豪华邮轮上一段跨越阶级的爱情，在冰海沉船中成为永恒。",
    url: "https://movie.douban.com/subject/1292722/",
  },
  {
    id: 8,
    title: "机器人总动员",
    year: 2008,
    rating: 9.3,
    genre: "动画",
    poster: "/images/posters/wall-e.jpg",
    backdrop: "",
    description: "孤独的垃圾清理机器人瓦力，在荒芜地球上邂逅了探测机器人伊娃。",
    url: "https://movie.douban.com/subject/2131459/",
  },
  {
    id: 9,
    title: "楚门的世界",
    year: 1998,
    rating: 9.3,
    genre: "剧情",
    poster: "/images/posters/truman-show.jpg",
    backdrop: "",
    description: "楚门从出生起就生活在一个巨大的摄影棚中，他的一切都是被安排的。",
    url: "https://movie.douban.com/subject/1292064/",
  },
  {
    id: 10,
    title: "疯狂动物城",
    year: 2016,
    rating: 9.2,
    genre: "动画",
    poster: "/images/posters/zootopia.jpg",
    backdrop: "",
    description: "兔子朱迪成为动物城第一位兔子警官，与狐狸尼克搭档破案。",
    url: "https://movie.douban.com/subject/25662329/",
  },
  {
    id: 11,
    title: "放牛班的春天",
    year: 2004,
    rating: 9.3,
    genre: "剧情",
    poster: "/images/posters/les-choristes.jpg",
    backdrop: "",
    description: "失意的音乐家来到问题少年寄宿学校，用音乐改变了孩子们的命运。",
    url: "https://movie.douban.com/subject/1291549/",
  },
  {
    id: 12,
    title: "龙猫",
    year: 1988,
    rating: 9.2,
    genre: "动画",
    poster: "/images/posters/totoro.jpg",
    backdrop: "",
    description: "姐妹俩随父亲搬到乡下，在那里遇见了森林守护者龙猫。",
    url: "https://movie.douban.com/subject/1291560/",
  },
  {
    id: 13,
    title: "无间道",
    year: 2002,
    rating: 9.3,
    genre: "犯罪",
    poster: "/images/posters/infernal-affairs.jpg",
    backdrop: "",
    description: "警方卧底与黑帮内鬼的双重身份博弈，谁才是真正的无间道？",
    url: "https://movie.douban.com/subject/1307914/",
  },
  {
    id: 14,
    title: "寻梦环游记",
    year: 2017,
    rating: 9.1,
    genre: "动画",
    poster: "/images/posters/coco.jpg",
    backdrop: "",
    description: "热爱音乐的小男孩米格误入亡灵世界，踏上寻找曾祖父的旅程。",
    url: "https://movie.douban.com/subject/20495023/",
  },
];

export const recommendedMovies: Movie[] = [
  {
    id: 101,
    title: "海上钢琴师",
    year: 1998,
    rating: 9.3,
    genre: "剧情",
    poster: "/images/posters/legend-of-1900.jpg",
    backdrop: "",
    description: "天才钢琴师1900在邮轮上度过一生，奏响自由与孤独的命运乐章。",
    url: "https://movie.douban.com",
  },
  {
    id: 102,
    title: "怦然心动",
    year: 2010,
    rating: 9.1,
    genre: "爱情",
    poster: "/images/posters/flipped.jpg",
    backdrop: "",
    description: "两个少年在成长中互相看见彼此，关于心动与自我认同的温柔故事。",
    url: "https://movie.douban.com",
  },
  {
    id: 103,
    title: "让子弹飞",
    year: 2010,
    rating: 9.0,
    genre: "喜剧",
    poster: "/images/posters/let-the-bullets-fly.jpg",
    backdrop: "",
    description: "土匪、县长与豪绅三方角力，在荒诞和热血中展开智慧博弈。",
    url: "https://movie.douban.com",
  },
  {
    id: 104,
    title: "黑镜",
    year: 2011,
    rating: 9.0,
    genre: "科幻",
    poster: "/images/posters/black-mirror.jpg",
    backdrop: "",
    description: "以独立故事映照科技与人性，揭示近未来社会的悖论与代价。",
    url: "https://movie.douban.com",
  },
  {
    id: 105,
    title: "请回答1988",
    year: 2015,
    rating: 9.7,
    genre: "家庭",
    poster: "/images/posters/reply-1988.jpg",
    backdrop: "",
    description: "首尔双门洞邻里日常，笑与泪交织的青春与亲情群像。",
    url: "https://movie.douban.com",
  },
  {
    id: 106,
    title: "地球脉动",
    year: 2006,
    rating: 9.8,
    genre: "纪录片",
    poster: "/images/posters/planet-earth.jpg",
    backdrop: "",
    description: "镜头跨越冰川、海洋与雨林，呈现自然世界的壮阔生命力。",
    url: "https://movie.douban.com",
  },
];

export const sharedWebsites: SharedWebsite[] = [
  {
    id: 1,
    title: "豆瓣电影",
    tag: "评分参考",
    description: "查评分、短评和影单，快速判断一部片值不值得看。",
    url: "https://movie.douban.com",
  },
  {
    id: 2,
    title: "IMDb",
    tag: "评分参考",
    description: "海外影视资料库，适合看演员表、奖项和全球评分。",
    url: "https://www.imdb.com",
  },
  {
    id: 3,
    title: "TMDB",
    tag: "资料检索",
    description: "影视元数据很全，海报、剧照和基础信息更新快。",
    url: "https://www.themoviedb.org",
  },
  {
    id: 4,
    title: "烂番茄",
    tag: "评分参考",
    description: "查看影评人新鲜度和观众爆米花指数，辅助做选择。",
    url: "https://www.rottentomatoes.com",
  },
  {
    id: 5,
    title: "MUBI Notebook",
    tag: "影评解析",
    description: "偏作者电影和电影文化内容，适合深度阅读。",
    url: "https://mubi.com/notebook",
  },
  {
    id: 6,
    title: "Letterboxd",
    tag: "影单社区",
    description: "记录观影、看他人推荐影单，整理自己的观影轨迹。",
    url: "https://letterboxd.com",
  },
  {
    id: 7,
    title: "Libvio",
    tag: "影视",
    description: "电影和剧集资源丰富，适合追新剧和热门院线影片。",
    url: "https://www.libvio.site",
  },
  {
    id: 8,
    title: "奈飞工厂",
    tag: "影视",
    description: "综合影视平台，覆盖电影、电视剧、综艺与纪录片。",
    url: "https://www.netflixgc.com",
  },
  {
    id: 9,
    title: "AGE动漫",
    tag: "动漫",
    description: "番剧更新快，社区讨论活跃，适合追番和看动画相关内容。",
    url: "https://www.agedm.io",
  },
  {
    id: 10,
    title: "爱动漫",
    tag: "动漫",
    description: "bilibili风格，弹幕丰富",
    url: "https://bgm.girigirilove.com",
  },
  {
    id: 11,
    title: "兄弟盘",
    tag: "网盘",
    description: "网盘资源检索平台，适合寻找影视资源的下载链接。",
    url: "https://xiongdipan.com",
  },
  {
    id: 12,
    title: "学霸盘",
    tag: "网盘",
    description: "网盘资源检索平台，适合寻找影视资源的下载链接。",
    url: "https://www.xuebapan.com",
  },
];
