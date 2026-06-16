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
  AbandonRecord
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
  communicationLogs: []
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
  removeCommunicationLog: (logId: string) => void;

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
          order: state.order,
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
            order: state.order,
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

      createAndSwitchOrder: () => {
        const state = get();
        if (state.order.id) {
          const currentSnapshot: RepairOrderSnapshot = {
            order: state.order,
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

        const abandonReason = snapshot.followupRecord.abandonRecord?.reason || '';

        const restoredSnapshot: RepairOrderSnapshot = {
          ...snapshot,
          order: {
            ...snapshot.order,
            status: targetStep === 'quote' ? 'quoted' : 'confirmed',
            currentStep: targetStep === 'quote' ? 3 : 5,
            previousAbandonReason: abandonReason
          },
          followupRecord: {
            ...snapshot.followupRecord,
            abandonRecord: null,
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
        return {
          quoteEstimate: quote,
          order: { ...state.order, status: 'quoted' }
        };
      }),

      setQuoteInspectionFee: (fee) => set((state) => ({
        quoteEstimate: state.quoteEstimate
          ? { ...state.quoteEstimate, inspectionFee: fee }
          : null
      })),

      setCustomerConfirm: (info) => set((state) => ({
        customerConfirm: { ...state.customerConfirm, ...info }
      })),

      confirmCustomer: () => set((state) => ({
        customerConfirm: {
          ...state.customerConfirm,
          confirmedAt: new Date().toISOString()
        },
        order: { ...state.order, status: 'confirmed' }
      })),

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

        return {
          followupRecord: newFollowupRecord,
          order: {
            ...state.order,
            status: isAbandoned ? 'abandoned' : 'completed'
          }
        };
      }),

      setAbandonRecord: (record) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          abandonRecord: {
            ...record,
            abandonedAt: new Date().toISOString()
          }
        },
        order: {
          ...state.order,
          status: 'abandoned'
        }
      })),

      addCommunicationLog: (log) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          communicationLogs: [
            ...state.followupRecord.communicationLogs,
            { ...log, id: generateId() }
          ]
        }
      })),

      removeCommunicationLog: (logId) => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          communicationLogs: state.followupRecord.communicationLogs.filter(l => l.id !== logId)
        }
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
