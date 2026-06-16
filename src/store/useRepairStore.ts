import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  RepairOrder,
  WaterDamageInfo,
  InspectionRecord,
  InspectionItem,
  InspectionStatus,
  QuoteEstimate,
  CustomerConfirm,
  FollowupRecord,
  CustomerChoice,
  FunctionTestItem,
  CommunicationLog,
  RepairOrderSnapshot,
  FUNCTION_TEST_ITEMS,
  AbandonRecord,
  StoreConfig,
  QuoteVersion,
  AbandonHistoryItem
} from '../types';
import { generateId } from '../utils/idGenerator';
import { generateQuote } from '../utils/quoteCalculator';

const createEmptyInspectionItem = (): InspectionItem => ({
  status: 'unchecked',
  photos: [],
  remark: ''
});

const createEmptyInspectionRecord = (): InspectionRecord => ({
  appearance: createEmptyInspectionItem(),
  screen: createEmptyInspectionItem(),
  motherboard: createEmptyInspectionItem(),
  interface: createEmptyInspectionItem(),
  battery: createEmptyInspectionItem(),
  camera: createEmptyInspectionItem(),
  speaker: createEmptyInspectionItem()
});

const createEmptyWaterDamageInfo = (): WaterDamageInfo => ({
  waterTime: '',
  liquidType: '',
  poweredOn: null,
  charged: null,
  customerTreatment: [],
  symptoms: [],
  otherSymptom: ''
});

const createEmptyCustomerConfirm = (): CustomerConfirm => ({
  understood: false,
  selectedTier: null,
  customerSignature: '',
  confirmedAt: null,
  notes: ''
});

const createEmptyFunctionTestItems = (): FunctionTestItem[] =>
  FUNCTION_TEST_ITEMS.map(name => ({
    name,
    status: 'pending',
    remark: ''
  }));

const createEmptyFollowupRecord = (): FollowupRecord => ({
  cleaningResult: {
    method: '',
    duration: '',
    result: '',
    remark: ''
  },
  secondInspection: {
    currentReading: '',
    motherboardStatus: '',
    shortCircuit: null,
    corrosionImproved: null,
    remark: ''
  },
  functionTest: createEmptyFunctionTestItems(),
  customerChoice: 'pending',
  finalStatus: '',
  completedAt: null,
  abandonRecord: null,
  abandonHistory: [],
  communicationLogs: [],
  quoteVersions: []
});

const createDefaultStoreConfig = (): StoreConfig => ({
  storeName: '速修手机维修中心',
  contactPerson: '张师傅',
  contactPhone: '138-XXXX-XXXX',
  warrantyTerms: '本维修部位享受30天质保，人为损坏、进水复损不在质保范围内。质保期内如出现相同故障免费返修。'
});

const createNewOrder = (): RepairOrder => ({
  id: generateId(),
  createdAt: new Date().toISOString(),
  phoneModel: '',
  customerName: '',
  contact: '',
  status: 'registered',
  currentStep: 1
});

interface RepairStore {
  currentOrderId: string | null;
  orders: Record<string, RepairOrderSnapshot>;
  storeConfig: StoreConfig;

  order: RepairOrder;
  waterDamageInfo: WaterDamageInfo;
  inspectionRecord: InspectionRecord;
  quoteEstimate: QuoteEstimate | null;
  customerConfirm: CustomerConfirm;
  followupRecord: FollowupRecord;

  saveCurrentOrder: () => void;
  loadOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  getOrderList: () => RepairOrderSnapshot[];
  getFilteredOrderList: (filter: RepairOrder['status'] | 'all' | 'today' | 'overdue') => RepairOrderSnapshot[];
  getStatistics: () => Record<string, number>;
  createAndSwitchOrder: () => string;
  restoreFromAbandon: (orderId: string, targetStep: 'quote' | 'followup') => void;

  setOrderInfo: (info: Partial<RepairOrder>) => void;
  setWaterDamageInfo: (info: Partial<WaterDamageInfo>) => void;
  toggleTreatment: (treatment: string) => void;
  toggleSymptom: (symptom: string) => void;

  setInspectionStatus: (part: keyof InspectionRecord, status: InspectionStatus) => void;
  setInspectionRemark: (part: keyof InspectionRecord, remark: string) => void;
  addPhoto: (part: keyof InspectionRecord, photoUrl: string) => void;
  removePhoto: (part: keyof InspectionRecord, index: number) => void;

  generateQuoteEstimate: () => void;
  setQuoteInspectionFee: (fee: number) => void;
  saveQuoteVersion: (storeConfig: StoreConfig, notes: string) => QuoteVersion | null;

  setCustomerConfirm: (info: Partial<CustomerConfirm>) => void;
  confirmCustomer: () => void;

  setCleaningResult: (info: Partial<FollowupRecord['cleaningResult']>) => void;
  setSecondInspection: (info: Partial<FollowupRecord['secondInspection']>) => void;
  setFunctionTestStatus: (index: number, status: FunctionTestItem['status']) => void;
  setFunctionTestRemark: (index: number, remark: string) => void;
  setCustomerChoice: (choice: CustomerChoice) => void;
  setFinalStatus: (status: string) => void;
  completeFollowup: () => void;
  setAbandonRecord: (record: Omit<AbandonRecord, 'abandonedAt'>) => void;

  addCommunicationLog: (log: Omit<CommunicationLog, 'id'>) => void;
  updateCommunicationLog: (logId: string, updates: Partial<CommunicationLog>) => void;
  removeCommunicationLog: (logId: string) => void;
  checkOverdueFollowUps: () => string[];

  setStoreConfig: (config: Partial<StoreConfig>) => void;

  setCurrentStep: (step: number) => void;
  setStatus: (status: RepairOrder['status']) => void;
  resetAll: () => void;
  createNewOrder: () => void;
}

export const useRepairStore = create<RepairStore>()(
  persist(
    (set, get) => ({
      currentOrderId: null,
      orders: {},
      storeConfig: createDefaultStoreConfig(),

      order: createNewOrder(),
      waterDamageInfo: createEmptyWaterDamageInfo(),
      inspectionRecord: createEmptyInspectionRecord(),
      quoteEstimate: null,
      customerConfirm: createEmptyCustomerConfirm(),
      followupRecord: createEmptyFollowupRecord(),

      saveCurrentOrder: () => {
        const state = get();
        if (!state.order.id) return;
        const snapshot: RepairOrderSnapshot = {
          order: { ...state.order, hasOverdueFollowUp: state.checkOverdueFollowUps().length > 0 },
          waterDamageInfo: state.waterDamageInfo,
          inspectionRecord: state.inspectionRecord,
          quoteEstimate: state.quoteEstimate,
          customerConfirm: state.customerConfirm,
          followupRecord: state.followupRecord
        };
        set({
          orders: { ...state.orders, [state.order.id]: snapshot },
          currentOrderId: state.order.id
        });
      },

      loadOrder: (orderId: string) => {
        const state = get();
        if (state.order.id && state.order.id !== orderId) {
          const currentSnapshot: RepairOrderSnapshot = {
            order: { ...state.order, hasOverdueFollowUp: state.checkOverdueFollowUps().length > 0 },
            waterDamageInfo: state.waterDamageInfo,
            inspectionRecord: state.inspectionRecord,
            quoteEstimate: state.quoteEstimate,
            customerConfirm: state.customerConfirm,
            followupRecord: state.followupRecord
          };
          const updatedOrders = {
            ...state.orders,
            [state.order.id]: currentSnapshot
          };
          const targetSnapshot = updatedOrders[orderId];
          if (targetSnapshot) {
            set({
              currentOrderId: orderId,
              orders: updatedOrders,
              order: targetSnapshot.order,
              waterDamageInfo: targetSnapshot.waterDamageInfo,
              inspectionRecord: targetSnapshot.inspectionRecord,
              quoteEstimate: targetSnapshot.quoteEstimate,
              customerConfirm: targetSnapshot.customerConfirm,
              followupRecord: targetSnapshot.followupRecord
            });
          }
        } else {
          const snapshot = state.orders[orderId];
          if (snapshot) {
            set({
              currentOrderId: orderId,
              order: snapshot.order,
              waterDamageInfo: snapshot.waterDamageInfo,
              inspectionRecord: snapshot.inspectionRecord,
              quoteEstimate: snapshot.quoteEstimate,
              customerConfirm: snapshot.customerConfirm,
              followupRecord: snapshot.followupRecord
            });
          }
        }
      },

      deleteOrder: (orderId: string) => {
        const state = get();
        const { [orderId]: _, ...rest } = state.orders;
        if (state.currentOrderId === orderId) {
          set({ orders: rest, currentOrderId: null });
        } else {
          set({ orders: rest });
        }
      },

      getOrderList: () => {
        const state = get();
        return Object.values(state.orders).sort((a, b) =>
          new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()
        );
      },

      getFilteredOrderList: (filter) => {
        const state = get();
        let list = state.getOrderList();
        const today = new Date().toISOString().split('T')[0];
        
        if (filter === 'all') return list;
        if (filter === 'today') {
          return list.filter(s => s.order.createdAt.startsWith(today));
        }
        if (filter === 'overdue') {
          const overdueIds = state.checkOverdueFollowUps();
          return list.filter(s => overdueIds.includes(s.order.id));
        }
        return list.filter(s => s.order.status === filter);
      },

      getStatistics: () => {
        const state = get();
        const list = state.getOrderList();
        const today = new Date().toISOString().split('T')[0];
        const overdueIds = state.checkOverdueFollowUps();
        
        return {
          total: list.length,
          today: list.filter(s => s.order.createdAt.startsWith(today)).length,
          quoted: list.filter(s => s.order.status === 'quoted').length,
          confirmed: list.filter(s => s.order.status === 'confirmed').length,
          abandoned: list.filter(s => s.order.status === 'abandoned').length,
          completed: list.filter(s => s.order.status === 'completed').length,
          overdue: overdueIds.length
        };
      },

      createAndSwitchOrder: () => {
        const state = get();
        if (state.order.id) {
          const currentSnapshot: RepairOrderSnapshot = {
            order: { ...state.order, hasOverdueFollowUp: state.checkOverdueFollowUps().length > 0 },
            waterDamageInfo: state.waterDamageInfo,
            inspectionRecord: state.inspectionRecord,
            quoteEstimate: state.quoteEstimate,
            customerConfirm: state.customerConfirm,
            followupRecord: state.followupRecord
          };
          const newOrder = createNewOrder();
          set({
            orders: { ...state.orders, [state.order.id]: currentSnapshot },
            currentOrderId: newOrder.id,
            order: newOrder,
            waterDamageInfo: createEmptyWaterDamageInfo(),
            inspectionRecord: createEmptyInspectionRecord(),
            quoteEstimate: null,
            customerConfirm: createEmptyCustomerConfirm(),
            followupRecord: createEmptyFollowupRecord()
          });
          return newOrder.id;
        }
        const newOrder = createNewOrder();
        set({
          currentOrderId: newOrder.id,
          order: newOrder,
          waterDamageInfo: createEmptyWaterDamageInfo(),
          inspectionRecord: createEmptyInspectionRecord(),
          quoteEstimate: null,
          customerConfirm: createEmptyCustomerConfirm(),
          followupRecord: createEmptyFollowupRecord()
        });
        return newOrder.id;
      },

      restoreFromAbandon: (orderId: string, targetStep: 'quote' | 'followup') => {
        const state = get();
        const snapshot = state.orders[orderId];
        if (!snapshot || snapshot.order.status !== 'abandoned') return;

        const abandonRecord = snapshot.followupRecord.abandonRecord;
        if (!abandonRecord) return;

        const abandonHistoryItem: AbandonHistoryItem = {
          reason: abandonRecord.reason,
          abandonedAt: abandonRecord.abandonedAt,
          abandonSource: abandonRecord.abandonSource,
          inspectionFee: abandonRecord.inspectionFee
        };

        const restoredSnapshot: RepairOrderSnapshot = {
          ...snapshot,
          order: {
            ...snapshot.order,
            status: targetStep === 'quote' ? 'quoted' : 'confirmed',
            currentStep: targetStep === 'quote' ? 3 : 5,
            previousAbandonReason: abandonRecord.reason,
            previousAbandonAt: abandonRecord.abandonedAt
          },
          followupRecord: {
            ...snapshot.followupRecord,
            abandonRecord: null,
            abandonHistory: [...snapshot.followupRecord.abandonHistory, abandonHistoryItem],
            completedAt: null,
            customerChoice: 'pending'
          }
        };

        const updatedOrders = { ...state.orders, [orderId]: restoredSnapshot };

        set({
          orders: updatedOrders,
          currentOrderId: orderId,
          order: restoredSnapshot.order,
          waterDamageInfo: restoredSnapshot.waterDamageInfo,
          inspectionRecord: restoredSnapshot.inspectionRecord,
          quoteEstimate: restoredSnapshot.quoteEstimate,
          customerConfirm: restoredSnapshot.customerConfirm,
          followupRecord: restoredSnapshot.followupRecord
        });
      },

      setOrderInfo: (info) => set((state) => ({
        order: { ...state.order, ...info }
      })),

      setWaterDamageInfo: (info) => set((state) => ({
        waterDamageInfo: { ...state.waterDamageInfo, ...info }
      })),

      toggleTreatment: (treatment) => set((state) => {
        const treatments = state.waterDamageInfo.customerTreatment;
        const newTreatments = treatments.includes(treatment)
          ? treatments.filter(t => t !== treatment)
          : [...treatments, treatment];
        return {
          waterDamageInfo: { ...state.waterDamageInfo, customerTreatment: newTreatments }
        };
      }),

      toggleSymptom: (symptom) => set((state) => {
        const symptoms = state.waterDamageInfo.symptoms;
        const newSymptoms = symptoms.includes(symptom)
          ? symptoms.filter(s => s !== symptom)
          : [...symptoms, symptom];
        return {
          waterDamageInfo: { ...state.waterDamageInfo, symptoms: newSymptoms }
        };
      }),

      setInspectionStatus: (part, status) => set((state) => ({
        inspectionRecord: {
          ...state.inspectionRecord,
          [part]: { ...state.inspectionRecord[part], status }
        }
      })),

      setInspectionRemark: (part, remark) => set((state) => ({
        inspectionRecord: {
          ...state.inspectionRecord,
          [part]: { ...state.inspectionRecord[part], remark }
        }
      })),

      addPhoto: (part, photoUrl) => set((state) => ({
        inspectionRecord: {
          ...state.inspectionRecord,
          [part]: {
            ...state.inspectionRecord[part],
            photos: [...state.inspectionRecord[part].photos, photoUrl]
          }
        }
      })),

      removePhoto: (part, index) => set((state) => ({
        inspectionRecord: {
          ...state.inspectionRecord,
          [part]: {
            ...state.inspectionRecord[part],
            photos: state.inspectionRecord[part].photos.filter((_, i) => i !== index)
          }
        }
      })),

      generateQuoteEstimate: () => set((state) => {
        const quote = generateQuote(state.inspectionRecord);
        const newState = {
          quoteEstimate: quote,
          order: { ...state.order, status: 'quoted' as const }
        };
        setTimeout(() => get().saveCurrentOrder(), 0);
        return newState;
      }),

      setQuoteInspectionFee: (fee) => set((state) => ({
        quoteEstimate: state.quoteEstimate
          ? { ...state.quoteEstimate, inspectionFee: fee }
          : null
      })),

      saveQuoteVersion: (storeConfig, notes) => {
        const state = get();
        if (!state.quoteEstimate) return null;
        
        const version: QuoteVersion = {
          id: generateId(),
          version: state.followupRecord.quoteVersions.length + 1,
          createdAt: new Date().toISOString(),
          quoteEstimate: JSON.parse(JSON.stringify(state.quoteEstimate)),
          storeConfig: { ...storeConfig },
          customerSignature: state.customerConfirm.customerSignature,
          notes
        };

        set((state) => ({
          followupRecord: {
            ...state.followupRecord,
            quoteVersions: [...state.followupRecord.quoteVersions, version]
          }
        }));

        setTimeout(() => get().saveCurrentOrder(), 0);
        return version;
      },

      setCustomerConfirm: (info) => set((state) => ({
        customerConfirm: { ...state.customerConfirm, ...info }
      })),

      confirmCustomer: () => set((state) => {
        const newState = {
          customerConfirm: {
            ...state.customerConfirm,
            confirmedAt: new Date().toISOString()
          },
          order: { ...state.order, status: 'confirmed' as const }
        };
        setTimeout(() => get().saveCurrentOrder(), 0);
        return newState;
      }),

      setCleaningResult: (info) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          cleaningResult: { ...state.followupRecord.cleaningResult, ...info }
        }
      })),

      setSecondInspection: (info) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          secondInspection: { ...state.followupRecord.secondInspection, ...info }
        }
      })),

      setFunctionTestStatus: (index, status) => set((state) => {
        const newFunctionTest = [...state.followupRecord.functionTest];
        newFunctionTest[index] = { ...newFunctionTest[index], status };
        return {
          followupRecord: { ...state.followupRecord, functionTest: newFunctionTest }
        };
      }),

      setFunctionTestRemark: (index, remark) => set((state) => {
        const newFunctionTest = [...state.followupRecord.functionTest];
        newFunctionTest[index] = { ...newFunctionTest[index], remark };
        return {
          followupRecord: { ...state.followupRecord, functionTest: newFunctionTest }
        };
      }),

      setCustomerChoice: (choice) => set((state) => ({
        followupRecord: { ...state.followupRecord, customerChoice: choice }
      })),

      setFinalStatus: (status) => set((state) => ({
        followupRecord: { ...state.followupRecord, finalStatus: status }
      })),

      completeFollowup: () => set((state) => {
        const isAbandoned = state.followupRecord.customerChoice === 'abandon';
        const newFollowupRecord = {
          ...state.followupRecord,
          completedAt: new Date().toISOString()
        };

        if (isAbandoned && !newFollowupRecord.abandonRecord && state.quoteEstimate) {
          newFollowupRecord.abandonRecord = {
            reason: state.followupRecord.finalStatus || '客户选择放弃维修',
            inspectionFee: state.quoteEstimate.inspectionFee,
            abandonedAt: new Date().toISOString(),
            abandonSource: 'followup' as const
          };
        }

        const status: 'abandoned' | 'completed' = isAbandoned ? 'abandoned' : 'completed';
        const newState = {
          followupRecord: newFollowupRecord,
          order: {
            ...state.order,
            status
          }
        };
        setTimeout(() => get().saveCurrentOrder(), 0);
        return newState;
      }),

      setAbandonRecord: (record) => set((state) => {
        const newState = {
          followupRecord: {
            ...state.followupRecord,
            abandonRecord: {
              ...record,
              abandonedAt: new Date().toISOString()
            }
          },
          order: {
            ...state.order,
            status: 'abandoned' as const
          }
        };
        setTimeout(() => get().saveCurrentOrder(), 0);
        return newState;
      }),

      addCommunicationLog: (log) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          communicationLogs: [
            ...state.followupRecord.communicationLogs,
            { ...log, id: generateId() }
          ]
        }
      })),

      updateCommunicationLog: (logId, updates) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          communicationLogs: state.followupRecord.communicationLogs.map(log =>
            log.id === logId ? { ...log, ...updates } : log
          )
        }
      })),

      removeCommunicationLog: (logId) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          communicationLogs: state.followupRecord.communicationLogs.filter(l => l.id !== logId)
        }
      })),

      checkOverdueFollowUps: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const overdueIds: string[] = [];

        Object.values(state.orders).forEach(snapshot => {
          const hasOverdue = snapshot.followupRecord.communicationLogs.some(log => {
            if (!log.nextFollowUpDate) return false;
            return log.nextFollowUpDate <= today;
          });
          if (hasOverdue) {
            overdueIds.push(snapshot.order.id);
          }
        });

        if (state.followupRecord.communicationLogs.some(log => {
          if (!log.nextFollowUpDate) return false;
          return log.nextFollowUpDate <= today;
        })) {
          if (!overdueIds.includes(state.order.id)) {
            overdueIds.push(state.order.id);
          }
        }

        return overdueIds;
      },

      setStoreConfig: (config) => set((state) => ({
        storeConfig: { ...state.storeConfig, ...config }
      })),

      setCurrentStep: (step) => set((state) => ({
        order: { ...state.order, currentStep: step }
      })),

      setStatus: (status) => set((state) => ({
        order: { ...state.order, status }
      })),

      resetAll: () => set({
        order: createNewOrder(),
        waterDamageInfo: createEmptyWaterDamageInfo(),
        inspectionRecord: createEmptyInspectionRecord(),
        quoteEstimate: null,
        customerConfirm: createEmptyCustomerConfirm(),
        followupRecord: createEmptyFollowupRecord()
      }),

      createNewOrder: () => {
        const state = get();
        state.createAndSwitchOrder();
      }
    }),
    {
      name: 'repair-store',
      partialize: (state) => ({
      currentOrderId: state.currentOrderId,
      orders: state.orders,
      storeConfig: state.storeConfig,
      order: state.order,
      waterDamageInfo: state.waterDamageInfo,
      inspectionRecord: state.inspectionRecord,
      quoteEstimate: state.quoteEstimate,
      customerConfirm: state.customerConfirm,
      followupRecord: state.followupRecord
    })
  }
  )
);
