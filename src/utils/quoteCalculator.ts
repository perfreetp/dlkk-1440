import { InspectionRecord, InspectionStatus, QuoteEstimate, QuoteTier, QuoteItem } from '../types';

const BASE_PRICES = {
  cleaning: 150,
  deepCleaning: 300,
  flexCable: 80,
  screenRisk: 200,
  motherboardRepair: 300,
  motherboardAdvanced: 800,
  dataRecovery: 500,
  batteryReplacement: 150,
  connectorReplacement: 120,
  cameraReplacement: 200,
  speakerReplacement: 100,
  inspectionFee: 50,
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

  (Object.values(record) as { status: InspectionStatus }[]).forEach(item => {
    if (item.status === 'mild') mildCount++;
    if (item.status === 'severe') severeCount++;
    if (item.status === 'pending') pendingCount++;
  });

  return { mildCount, severeCount, pendingCount };
}

function generateLowTier(record: InspectionRecord): QuoteTier {
  const items: QuoteItem[] = [];

  items.push({
    name: '基础清洗烘干',
    description: '整机超声波清洗 + 48小时低温烘干',
    price: BASE_PRICES.cleaning,
    included: true
  });

  if (record.interface.status !== 'normal') {
    items.push({
      name: '接口清洁处理',
      description: '充电口/耳机口腐蚀清洁',
      price: 50,
      included: true
    });
  }

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
  const { mildCount, severeCount, pendingCount } = countSeverity(record);
  const items: QuoteItem[] = [];

  items.push({
    name: '深度清洗',
    description: '拆解后超声波深度清洗 + 72小时真空干燥',
    price: BASE_PRICES.deepCleaning,
    included: true
  });

  if (mildCount > 0 || pendingCount > 0) {
    items.push({
      name: '腐蚀部件处理',
      description: `对${mildCount + pendingCount}处轻微腐蚀部位进行精细处理`,
      price: mildCount * 80 + pendingCount * 100,
      included: true
    });
  }

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
  const { mildCount, severeCount, pendingCount } = countSeverity(record);
  const items: QuoteItem[] = [];

  items.push({
    name: '深度清洗+干燥',
    description: '全机拆解、超声波深度清洗 + 96小时真空干燥',
    price: BASE_PRICES.deepCleaning + 100,
    included: true
  });

  if (severeCount > 0 || pendingCount > 0) {
    items.push({
      name: '主板芯片级维修',
      description: `对${severeCount + pendingCount}处严重腐蚀部位进行芯片级维修`,
      price: BASE_PRICES.motherboardAdvanced + severeCount * 200,
      included: true
    });
  }

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

  return {
    lowTier: generateLowTier(record),
    midTier: generateMidTier(record),
    highTier: generateHighTier(record),
    inspectionFee: calculateInspectionFee(record),
    validDays,
    validUntil: validDate.toISOString().split('T')[0]
  };
}
