import { create } from 'zustand';
import { Medication, Appointment, ChatMessage } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { HealthDataContract, healthDataEncryption } from '../lib/algorand';

interface HealthState {
  medications: Medication[];
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  algorandWallet: { address: string; privateKey: Uint8Array; mnemonic: string } | null;
  healthContract: HealthDataContract | null;

  // Medication actions
  loadMedications: (userId: string) => Promise<void>;
  addMedication: (userId: string, medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (medicationId: string, updates: Partial<Medication>) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;

  // Appointment actions
  loadAppointments: (userId: string) => Promise<void>;
  addAppointment: (userId: string, appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
  removeAppointment: (appointmentId: string) => Promise<void>;

  // Chat actions
  loadChatMessages: (userId: string) => Promise<void>;
  addChatMessage: (userId: string, message: Omit<ChatMessage, 'id'>) => Promise<void>;
  clearChat: (userId: string) => Promise<void>;

  // Algorand blockchain
  initializeAlgorandWallet: () => void;
  storeHealthDataOnBlockchain: (data: any, dataType: 'medication' | 'appointment' | 'health_record') => Promise<string | null>;
  setHealthContract: (appId: number) => void;

  // Demo sample data
  initializeSampleData: (userId: string) => Promise<void>;
}

// Example sample data
const sampleMedications = [
  {
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2024-01-15',
    instructions: 'Take with or without food. Monitor blood pressure regularly.'
  },
  {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2024-02-01',
    instructions: 'Take with meals to reduce stomach upset.'
  }
];

const sampleAppointments = [
  {
    title: 'Annual Physical Exam',
    date: '2025-02-15',
    time: '10:00',
    doctor: 'Dr. Sarah Johnson',
    type: 'checkup' as const,
    status: 'scheduled' as const,
    notes: 'Bring insurance card and list of current medications.'
  }
];

export const useHealthStore = create<HealthState>((set, get) => ({
  medications: [],
  appointments: [],
  chatMessages: [],
  isLoading: false,
  algorandWallet: null,
  healthContract: null,

  initializeSampleData: async (userId) => {
    try {
      console.log('Initializing sample data for user:', userId);
      const meds = await SupabaseService.getMedications(userId);
      const appts = await SupabaseService.getAppointments(userId);

      if (meds.length === 0) {
        console.log('Adding sample medications...');
        for (const med of sampleMedications) {
          await SupabaseService.addMedication(userId, med);
        }
      }
      if (appts.length === 0) {
        console.log('Adding sample appointments...');
        for (const apt of sampleAppointments) {
          await SupabaseService.addAppointment(userId, apt);
        }
      }
      
      // Reload data after adding samples
      await get().loadMedications(userId);
      await get().loadAppointments(userId);
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  },

  // Medications
  loadMedications: async (userId) => {
    set({ isLoading: true });
    try {
      console.log('Loading medications for user:', userId);
      const meds = await SupabaseService.getMedications(userId);
      console.log('Loaded medications:', meds);
      
      const formatted = meds.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.start_date,
        endDate: m.end_date,
        instructions: m.instructions
      }));
      
      set({ medications: formatted, isLoading: false });
      console.log('Medications set in store:', formatted);
    } catch (err) {
      console.error('Error loading medications:', err);
      set({ medications: [], isLoading: false });
    }
  },

  addMedication: async (userId, med) => {
    try {
      console.log('Adding medication:', med);
      const created = await SupabaseService.addMedication(userId, med);
      console.log('Medication created:', created);
      
      const formattedMed = {
        id: created.id,
        name: created.name,
        dosage: created.dosage,
        frequency: created.frequency,
        startDate: created.start_date,
        endDate: created.end_date,
        instructions: created.instructions
      };
      
      set((state) => ({
        medications: [...state.medications, formattedMed]
      }));
      
      // Store on blockchain
      const { storeHealthDataOnBlockchain } = get();
      await storeHealthDataOnBlockchain(created, 'medication');
      
      console.log('Medication added to store');
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },

  updateMedication: async (id, updates) => {
    try {
      console.log('Updating medication:', id, updates);
      const dbUpdates = {
        name: updates.name,
        dosage: updates.dosage,
        frequency: updates.frequency,
        start_date: updates.startDate,
        end_date: updates.endDate,
        instructions: updates.instructions
      };
      
      await SupabaseService.updateMedication(id, dbUpdates);
      
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? { ...m, ...updates } : m))
      }));
      
      console.log('Medication updated in store');
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  removeMedication: async (id) => {
    try {
      console.log('Removing medication:', id);
      await SupabaseService.deleteMedication(id);
      
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id)
      }));
      
      console.log('Medication removed from store');
    } catch (error) {
      console.error('Error removing medication:', error);
      throw error;
    }
  },

  // Appointments
  loadAppointments: async (userId) => {
    set({ isLoading: true });
    try {
      console.log('Loading appointments for user:', userId);
      const appts = await SupabaseService.getAppointments(userId);
      console.log('Loaded appointments:', appts);
      
      set({ appointments: appts, isLoading: false });
      console.log('Appointments set in store:', appts);
    } catch (err) {
      console.error('Error loading appointments:', err);
      set({ appointments: [], isLoading: false });
    }
  },

  addAppointment: async (userId, apt) => {
    try {
      console.log('Adding appointment:', apt);
      const created = await SupabaseService.addAppointment(userId, apt);
      console.log('Appointment created:', created);
      
      set((state) => ({
        appointments: [...state.appointments, created]
      }));
      
      // Store on blockchain
      const { storeHealthDataOnBlockchain } = get();
      await storeHealthDataOnBlockchain(created, 'appointment');
      
      console.log('Appointment added to store');
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      console.log('Updating appointment:', id, updates);
      await SupabaseService.updateAppointment(id, updates);
      
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a))
      }));
      
      console.log('Appointment updated in store');
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  removeAppointment: async (id) => {
    try {
      console.log('Removing appointment:', id);
      await SupabaseService.deleteAppointment(id);
      
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id)
      }));
      
      console.log('Appointment removed from store');
    } catch (error) {
      console.error('Error removing appointment:', error);
      throw error;
    }
  },

  // Chat
  loadChatMessages: async (userId) => {
    try {
      console.log('Loading chat messages for user:', userId);
      const msgs = await SupabaseService.getChatMessages(userId);
      console.log('Loaded chat messages:', msgs);
      
      set({
        chatMessages: msgs.map((m) => ({
          id: m.id,
          content: m.content,
          role: m.role,
          timestamp: m.created_at,
          type: m.type
        }))
      });
    } catch (err) {
      console.error('Error loading chat messages:', err);
      set({ chatMessages: [] });
    }
  },

  addChatMessage: async (userId, msg) => {
    try {
      console.log('Adding chat message:', msg);
      const created = await SupabaseService.addChatMessage(userId, msg);
      console.log('Chat message created:', created);
      
      set((state) => ({
        chatMessages: [...state.chatMessages, {
          id: created.id,
          content: created.content,
          role: created.role,
          timestamp: created.created_at,
          type: created.type
        }]
      }));
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  },

  clearChat: async (userId) => {
    try {
      await SupabaseService.clearChatMessages(userId);
      set({ chatMessages: [] });
    } catch (error) {
      console.error('Error clearing chat messages:', error);
      throw error;
    }
  },

  // Algorand
  initializeAlgorandWallet: () => {
    try {
      const wallet = HealthDataContract.generateWallet();
      set({ algorandWallet: wallet });
      console.log('Algorand wallet initialized:', wallet.address);
    } catch (error) {
      console.error('Error initializing Algorand wallet:', error);
    }
  },

  storeHealthDataOnBlockchain: async (data, type) => {
    const { algorandWallet, healthContract } = get();
    if (!algorandWallet || !healthContract) {
      console.log('Blockchain storage not available - wallet or contract missing');
      return null;
    }
    
    try {
      const encrypted = healthDataEncryption.encrypt(
        JSON.stringify(data),
        algorandWallet.address
      );
      
      const txId = await healthContract.storeHealthData(
        algorandWallet.address,
        algorandWallet.privateKey,
        encrypted,
        type
      );
      
      console.log('Data stored on blockchain:', txId);
      return txId;
    } catch (error) {
      console.error('Error storing data on blockchain:', error);
      return null;
    }
  },

  setHealthContract: (appId) => {
    try {
      const contract = new HealthDataContract(appId);
      set({ healthContract: contract });
      console.log('Health contract set:', appId);
    } catch (error) {
      console.error('Error setting health contract:', error);
    }
  }
}));