import { SimilarCase } from '../types';

export const similarCases: SimilarCase[] = [
  {
    id: 'case-1',
    phoneModel: 'iPhone 13 Pro',
    waterDamage: '清水浸泡约2小时，送修时不开机',
    solution: '深度清洗 + 主板维修 + 电池更换',
    result: '清洗后主板尾插腐蚀，修复后正常开机，各项功能正常',
    cost: 1280,
    successRate: 85
  },
  {
    id: 'case-2',
    phoneModel: '华为 Mate 40 Pro',
    waterDamage: '奶茶洒在手机上，用吹风机吹过',
    solution: '超声波清洗 + 屏幕处理 + 扬声器更换',
    result: '屏幕有轻微水印残留，触摸功能正常，不影响使用',
    cost: 680,
    successRate: 90
  },
  {
    id: 'case-3',
    phoneModel: '小米 11',
    waterDamage: '海水浸泡超过12小时',
    solution: '深度清洗 + 主板芯片级维修',
    result: '主板严重腐蚀，维修后可开机但蓝牙和WIFI故障，客户选择使用',
    cost: 950,
    successRate: 60
  },
  {
    id: 'case-4',
    phoneModel: 'iPhone 12',
    waterDamage: '掉入马桶，立即捞出',
    solution: '及时清洗 + 电池更换',
    result: '处理及时，清洗后一切正常，资料完好导出',
    cost: 450,
    successRate: 95
  },
  {
    id: 'case-5',
    phoneModel: 'OPPO Reno 6',
    waterDamage: '雨水淋湿，放米缸3天后送修',
    solution: '清洗烘干 + 接口更换',
    result: '充电接口腐蚀，更换后正常使用',
    cost: 320,
    successRate: 88
  },
  {
    id: 'case-6',
    phoneModel: 'vivo X70 Pro',
    waterDamage: '可乐浸泡，客户自行拆机',
    solution: '深度清洗 + 主板维修 + 资料抢救',
    result: '主板短路，修复后资料成功导出，主板报废',
    cost: 1500,
    successRate: 50
  }
];
