export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: 'free' | 'premium' | 'enterprise';
  healthProfile?: HealthProfile;
}

export interface HealthProfile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: Medication[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string[];
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  type: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  type?: 'text' | 'audio' | 'video';
}

export interface APIConfig {
  tavusApiKey?: string;
  elevenLabsApiKey?: string;
  revenueCatApiKey?: string;
}