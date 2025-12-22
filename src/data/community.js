import rainImg from '../assets/community-rain.jpg';
import nightImg from '../assets/community-night.jpg';
import campusImg from '../assets/community-campus.jpg';

export const topics = [
  {
    id: 'topic-rain',
    title: '雨声档案',
    desc: '收集不同城市的雨天声音。',
    image: rainImg,
    tags: ['自然', '情绪', '城市记忆'],
    stats: { members: 328, today: 12, sounds: 86 },
    guideline: '建议记录雨量、天气与环境材质（石板/屋檐/窗框）。',
    updates: [
      { title: '新增：武汉·珞珈山雨声', author: '阿渡', time: '2 小时前' },
      { title: '声音路线：江南雨巷', author: '姜禾', time: '昨天' }
    ],
    discussions: [
      { name: '白露', time: '1 小时前', text: '苏州的石板路雨声很治愈，建议加上雨量信息。' }
    ]
  },
  {
    id: 'topic-night',
    title: '夜市人声',
    desc: '探索夜市的热闹与生活气息。',
    image: nightImg,
    tags: ['人声', '生活', '夜间'],
    stats: { members: 410, today: 19, sounds: 120 },
    guideline: '优先收集摊主叫卖、人群互动与烹饪声。',
    updates: [
      { title: '长沙·坡子街新增片段', author: 'Kiko', time: '4 小时前' },
      { title: '夜市声浪线更新', author: 'Leon', time: '2 天前' }
    ],
    discussions: [
      { name: '阿梁', time: '30 分钟前', text: '摊主的叫卖音调很有辨识度，适合做素材。' }
    ]
  },
  {
    id: 'topic-campus',
    title: '校园广播',
    desc: '每一所学校都有独特的广播声。',
    image: campusImg,
    tags: ['人声', '校园', '广播'],
    stats: { members: 265, today: 8, sounds: 54 },
    guideline: '可记录广播内容、背景环境声与时间段。',
    updates: [
      { title: '新增：下午校园广播', author: '小枫', time: '6 小时前' },
      { title: '广播语料整理', author: 'Sora', time: '3 天前' }
    ],
    discussions: [
      { name: '豆豆', time: '昨天', text: '广播里配乐会影响采集质量，建议挑空段录。' }
    ]
  }
];

export const events = [
  { date: '03/08', title: '城市声音周 · 深圳站' },
  { date: '03/21', title: '雨声采集挑战' },
  { date: '04/02', title: '声音路线共创夜' }
];

export const gallery = [
  {
    title: '雨夜街角',
    meta: '苏州 · 石板路',
    image: rainImg
  },
  {
    title: '摊位灯光',
    meta: '长沙 · 夜市',
    image: nightImg
  },
  {
    title: '广播时刻',
    meta: '武汉 · 校园',
    image: campusImg
  }
];
