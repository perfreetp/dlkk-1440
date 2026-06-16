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
  FUNCTION_TEST_ITEMS
} from '../types';
import { generateId } from '../utils/idGenerator';
import { generateQuote } from '../utils/quoteCalculator';

const createEmptyInspectionItem = (): InspectionItem => ({
  status: 'pending',
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
  completedAt: null
});

interface RepairStore {
  order: RepairOrder;
  waterDamageInfo: WaterDamageInfo;
  inspectionRecord: InspectionRecord;
  quoteEstimate: QuoteEstimate | null;
  customerConfirm: CustomerConfirm;
  followupRecord: FollowupRecord;

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

  setCurrentStep: (step: number) => void;
  setStatus: (status: RepairOrder['status']) => void;
  resetAll: () => void;
  createNewOrder: () => void;
}

const createNewOrder = (): RepairOrder => ({
  id: generateId(),
  createdAt: new Date().toISOString(),
  phoneModel: '',
  customerName: '',
  contact: '',
  status: 'registered',
  currentStep: 1
});

export const useRepairStore = create<RepairStore>()(
  persist(
    (set, get) => ({
      order: createNewOrder(),
      waterDamageInfo: createEmptyWaterDamageInfo(),
      inspectionRecord: createEmptyInspectionRecord(),
      quoteEstimate: null,
      customerConfirm: createEmptyCustomerConfirm(),
      followupRecord: createEmptyFollowupRecord(),

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

      completeFollowup: () => set((state) => ({
        followupRecord: {
          ...state.followupRecord,
          completedAt: new Date().toISOString()
        },
        order: {
          ...state.order,
          status: state.followupRecord.customerChoice === 'abandon' ? 'abandoned' : 'completed'
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
        state.resetAll();
      }
    }),
    {
      name: 'repair-store',
      partialize: (state) => ({
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
