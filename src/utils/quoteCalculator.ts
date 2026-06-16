import { InspectionRecord, InspectionStatus, QuoteEstimate, QuoteTier, QuoteItem } from '../types';

const BASE_PRICES = {
  cleaning: 150,
  deepCleaning: 300,
  flexCable: 80,
  flexCableScreen: 120,
  flexCableInterface: 100,
  flexCableMotherboard: 150,
  screenRisk: 200,
  motherboardRepair: 300,
  motherboardAdvanced: 800,
  dataRecovery: 500,
  batteryReplacement: 150,
  connectorReplacement: 120,
  cameraReplacement: 200,
  speakerReplacement: 100,
  inspectionFee: 50,
  pendingRiskReserve: 150,
};

const SEVERITY_MULTIPLIER: Record<InspectionStatus, number> = {
  normal: 0,
  mild: 1,
  severe: 1.5,
  pending: 1.2
};

function countSeverity(record: InspectionRecord) {
  let mildCount = 0;
  let severeCount = 0;
  let pendingCount = 0;

  const pendingParts: string[] = [];
  const mildParts: string[] = [];
  const severeParts: string[] = [];

  const partNames: Record<string, string> = {
    appearance: '外观',
    screen: '屏幕',
    motherboard: '主板',
    interface: '接口',
    battery: '电池',
    camera: '摄像头',
    speaker: '扬声器'
  };

  Object.entries(record).forEach(([key, item]) => {
    const status = (item as { status: InspectionStatus }).status;
    const partName = partNames[key] || key;
    if (status === 'mild') {
      mildCount++;
      mildParts.push(partName);
    }
    if (status === 'severe') {
      severeCount++;
      severeParts.push(partName);
    }
    if (status === 'pending') {
      pendingCount++;
      pendingParts.push(partName);
    }
  });

  return { mildCount, severeCount, pendingCount, pendingParts, mildParts, severeParts };
}

function addFlexCableItems(items: QuoteItem[], record: InspectionRecord, tier: 'low' | 'mid' | 'high') {
  if (record.screen.status !== 'normal') {
    const price = tier === 'low' ? BASE_PRICES.flexCable :
                  tier === 'mid' ? BASE_PRICES.flexCableScreen :
                  BASE_PRICES.flexCableScreen + 50;
    items.push({
      name: '屏幕排线检测/更换',
      description: '显示排线、触摸排线腐蚀清洁或更换',
      price,
      included: true
    });
  }

  if (record.interface.status !== 'normal') {
    const price = tier === 'low' ? BASE_PRICES.flexCable :
                  tier === 'mid' ? BASE_PRICES.flexCableInterface :
                  BASE_PRICES.flexCableInterface + 30;
    items.push({
      name: '尾插排线检修',
      description: '充电排线、数据接口排线清洁或更换',
      price,
      included: true
    });
  }

  if (record.motherboard.status !== 'normal') {
    const price = tier === 'low' ? 0 :
                  tier === 'mid' ? BASE_PRICES.flexCableMotherboard :
                  BASE_PRICES.flexCableMotherboard + 50;
    if (price > 0) {
      items.push({
        name: '主板连接排线',
        description: '主板与各部件连接排线检测修复',
        price,
        included: true
      });
    }
  }

  if (record.camera.status !== 'normal' && tier !== 'low') {
    items.push({
      name: '摄像头排线清洁',
      description: '前后摄像头排线接口腐蚀处理',
      price: BASE_PRICES.flexCable,
      included: true
    });
  }

  if (record.speaker.status !== 'normal' && tier !== 'low') {
    items.push({
      name: '音频排线检修',
      description: '扬声器、听筒排线清洁修复',
      price: BASE_PRICES.flexCable,
      included: true
    });
  }
}

function addPendingRiskItem(items: QuoteItem[], pendingParts: string[], tier: 'low' | 'mid' | 'high') {
  if (pendingParts.length === 0) return;

  const multiplier = tier === 'low' ? 0.5 : tier === 'mid' ? 1 : 1.5;
  const price = Math.round(BASE_PRICES.pendingRiskReserve * pendingParts.length * multiplier);

  if (price > 0) {
    items.push({
      name: '待拆检风险备用金',
      description: `${pendingParts.join('、')}需进一步拆检，此为预估风险备用金，多退少补`,
      price,
      included: true
    });
  }
}

function generateLowTier(record: InspectionRecord): QuoteTier {
  const { pendingParts } = countSeverity(record);
  const items: QuoteItem[] = [];

  items.push({
    name: '基础清洗烘干',
    description: '整机超声波清洗 + 48小时低温烘干',
    price: BASE_PRICES.cleaning,
    included: true
  });

  addFlexCableItems(items, record, 'low');

  if (record.interface.status !== 'normal') {
    items.push({
      name: '接口清洁处理',
      description: '充电口/耳机口腐蚀清洁',
      price: 50,
      included: true
    });
  }

  addPendingRiskItem(items, pendingParts, 'low');

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    name: '经济档',
    description: '基础清洗方案，适合进水时间短、腐蚀轻微的情况。先做全面清洗，观察能否恢复正常。',
    items,
    totalMin: total,
    totalMax: total + 100
  };
}

function generateMidTier(record: InspectionRecord): QuoteTier {
  const { mildCount, severeCount, pendingCount, pendingParts, mildParts } = countSeverity(record);
  const items: QuoteItem[] = [];

  items.push({
    name: '深度清洗',
    description: '拆解后超声波深度清洗 + 72小时真空干燥',
    price: BASE_PRICES.deepCleaning,
    included: true
  });

  if (mildCount > 0 || pendingCount > 0) {
    const allParts = [...mildParts, ...pendingParts];
    items.push({
      name: '腐蚀部件处理',
      description: `对${allParts.join('、')}等${mildCount + pendingCount}处腐蚀部位进行精细处理`,
      price: mildCount * 80 + pendingCount * 100,
      included: true
    });
  }

  addFlexCableItems(items, record, 'mid');

  if (record.battery.status !== 'normal') {
    items.push({
      name: '电池检测/更换',
      description: '进水电池存在安全隐患，建议更换',
      price: BASE_PRICES.batteryReplacement,
      included: true
    });
  }

  if (record.interface.status !== 'normal') {
    items.push({
      name: '接口检修',
      description: '充电/数据接口修复或更换',
      price: BASE_PRICES.connectorReplacement,
      included: true
    });
  }

  items.push({
    name: '屏幕风险处理',
    description: '进水后屏幕可能出现水印、线条等问题，需要观察',
    price: BASE_PRICES.screenRisk,
    included: true
  });

  addPendingRiskItem(items, pendingParts, 'mid');

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    name: '标准档',
    description: '全面检修方案，包含深度清洗、易损件更换和主要故障修复。大部分进水机推荐此方案。',
    items,
    totalMin: total,
    totalMax: total + 300
  };
}

function generateHighTier(record: InspectionRecord): QuoteTier {
  const { mildCount, severeCount, pendingCount, pendingParts, severeParts } = countSeverity(record);
  const items: QuoteItem[] = [];

  items.push({
    name: '深度清洗+干燥',
    description: '全机拆解、超声波深度清洗 + 96小时真空干燥',
    price: BASE_PRICES.deepCleaning + 100,
    included: true
  });

  if (severeCount > 0 || pendingCount > 0) {
    const allParts = [...severeParts, ...pendingParts];
    items.push({
      name: '主板芯片级维修',
      description: `对${allParts.join('、')}等${severeCount + pendingCount}处严重腐蚀部位进行芯片级维修`,
      price: BASE_PRICES.motherboardAdvanced + severeCount * 200,
      included: true
    });
  }

  addFlexCableItems(items, record, 'high');

  if (record.screen.status !== 'normal') {
    items.push({
      name: '屏幕总成检测/更换',
      description: '屏幕显示异常修复或更换总成',
      price: 400,
      included: true
    });
  }

  if (record.camera.status !== 'normal') {
    items.push({
      name: '摄像头修复',
      description: '前后摄像头清理或更换',
      price: BASE_PRICES.cameraReplacement,
      included: true
    });
  }

  if (record.speaker.status !== 'normal') {
    items.push({
      name: '扬声器/听筒修复',
      description: '音频组件清理或更换',
      price: BASE_PRICES.speakerReplacement,
      included: true
    });
  }

  items.push({
    name: '资料抢救服务',
    description: '优先保障通讯录、照片等用户数据安全',
    price: BASE_PRICES.dataRecovery,
    included: true
  });

  items.push({
    name: '电池更换',
    description: '全新原装电池更换，消除安全隐患',
    price: BASE_PRICES.batteryReplacement,
    included: true
  });

  addPendingRiskItem(items, pendingParts, 'high');

  items.push({
    name: '90天质保',
    description: '维修部位享受90天质保服务',
    price: 200,
    included: true
  });

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    name: '全面档',
    description: '旗舰级维修方案，包含所有可能的故障修复、资料抢救和延长质保。适合高端机型或资料重要的情况。',
    items,
    totalMin: total,
    totalMax: total + 500
  };
}

function calculateInspectionFee(record: InspectionRecord): number {
  const { severeCount, pendingCount } = countSeverity(record);
  let fee = BASE_PRICES.inspectionFee;
  if (severeCount > 0) fee += 30;
  if (pendingCount > 0) fee += 20;
  return fee;
}

export function generateQuote(record: InspectionRecord): QuoteEstimate {
  const validDays = 3;
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + validDays);

  const { pendingCount } = countSeverity(record);

  return {
    lowTier: generateLowTier(record),
    midTier: generateMidTier(record),
    highTier: generateHighTier(record),
    inspectionFee: calculateInspectionFee(record),
    validDays,
    validUntil: validDate.toISOString().split('T')[0],
    hasPendingItems: pendingCount > 0
  };
}
