export type RepairStatus = 'registered' | 'inspecting' | 'quoted' | 'confirmed' | 'followup' | 'completed' | 'abandoned';

export type InspectionStatus = 'normal' | 'mild' | 'severe' | 'pending';

export type InspectionPart = 'appearance' | 'screen' | 'motherboard' | 'interface' | 'battery' | 'camera' | 'speaker';

export type CustomerChoice = 'repair' | 'abandon' | 'data_export' | 'pending';

export interface RepairOrder {
  id: string;
  createdAt: string;
  phoneModel: string;
  customerName: string;
  contact: string;
  status: RepairStatus;
  currentStep: number;
}

export interface WaterDamageInfo {
  waterTime: string;
  liquidType: string;
  poweredOn: boolean | null;
  charged: boolean | null;
  customerTreatment: string[];
  symptoms: string[];
  otherSymptom?: string;
}

export interface InspectionItem {
  status: InspectionStatus;
  photos: string[];
  remark: string;
}

export interface InspectionRecord {
  appearance: InspectionItem;
  screen: InspectionItem;
  motherboard: InspectionItem;
  interface: InspectionItem;
  battery: InspectionItem;
  camera: InspectionItem;
  speaker: InspectionItem;
}

export interface QuoteItem {
  name: string;
  description: string;
  price: number;
  included: boolean;
}

export interface QuoteTier {
  name: string;
  description: string;
  items: QuoteItem[];
  totalMin: number;
  totalMax: number;
}

export interface QuoteEstimate {
  lowTier: QuoteTier;
  midTier: QuoteTier;
  highTier: QuoteTier;
  inspectionFee: number;
  validDays: number;
  validUntil: string;
}

export interface CustomerConfirm {
  understood: boolean;
  selectedTier: 'low' | 'mid' | 'high' | null;
  customerSignature: string;
  confirmedAt: string | null;
  notes: string;
}

export interface CleaningRecord {
  method: string;
  duration: string;
  result: string;
  remark: string;
}

export interface SecondInspection {
  currentReading: string;
  motherboardStatus: string;
  shortCircuit: boolean | null;
  corrosionImproved: boolean | null;
  remark: string;
}

export interface FunctionTestItem {
  name: string;
  status: 'pass' | 'fail' | 'partial' | 'pending';
  remark: string;
}

export interface FollowupRecord {
  cleaningResult: CleaningRecord;
  secondInspection: SecondInspection;
  functionTest: FunctionTestItem[];
  customerChoice: CustomerChoice;
  finalStatus: string;
  completedAt: string | null;
}

export interface SpeechTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface SimilarCase {
  id: string;
  phoneModel: string;
  waterDamage: string;
  solution: string;
  result: string;
  cost: number;
  successRate: number;
}

export const PART_NAMES: Record<InspectionPart, string> = {
  appearance: '外观',
  screen: '屏幕',
  motherboard: '主板',
  interface: '接口',
  battery: '电池',
  camera: '摄像头',
  speaker: '扬声器'
};

export const STATUS_LABELS: Record<InspectionStatus, string> = {
  normal: '正常',
  mild: '轻微腐蚀',
  severe: '严重腐蚀',
  pending: '待拆检'
};

export const WATER_TIME_OPTIONS = [
  '1小时内',
  '1-6小时',
  '6-24小时',
  '超过24小时',
  '超过3天'
];

export const LIQUID_TYPE_OPTIONS = [
  '清水',
  '茶水',
  '咖啡',
  '可乐/碳酸饮料',
  '海水/盐水',
  '雨水',
  '其他液体'
];

export const TREATMENT_OPTIONS = [
  '擦干表面',
  '用力甩水',
  '吹风机吹干',
  '放入大米中',
  '放入干燥剂',
  '阳光下暴晒',
  '自行拆机',
  '未做处理'
];

export const SYMPTOM_OPTIONS = [
  '完全不开机',
  '开机屏幕异常',
  '触摸失灵',
  '无声音/扬声器坏',
  '不充电',
  '摄像头故障',
  '震动异常',
  '自动重启',
  '发热严重',
  '其他症状'
];

export const CLEANING_METHODS = [
  '超声波清洗',
  '酒精浸泡清洗',
  '热风枪烘干',
  '真空干燥',
  '综合清洗'
];

export const FUNCTION_TEST_ITEMS = [
  '开机测试',
  '屏幕显示',
  '触摸功能',
  '充电功能',
  '前后摄像头',
  '扬声器/听筒',
  '震动马达',
  'WiFi/蓝牙',
  '通话功能',
  '指纹/面容'
];
