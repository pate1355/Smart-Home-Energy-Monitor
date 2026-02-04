// Device types and interfaces
export type DeviceType = 'light' | 'hvac' | 'appliance' | 'electronics' | 'water_heater';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  wattage: number;
  status: 'on' | 'off';
  usageHours: number;
  healthStatus?: 'good' | 'warning' | 'critical';
}

// Energy data interfaces
export interface EnergyDataPoint {
  timestamp: Date;
  consumption: number; // kWh
  cost: number; // dollars
  deviceBreakdown: {
    deviceId: string;
    consumption: number;
  }[];
}

export interface DailyEnergyData {
  date: string;
  totalConsumption: number;
  totalCost: number;
  peakHour: number;
  peakConsumption: number;
}

// AI Recommendation interfaces
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number; // dollars per month
  priority: 'high' | 'medium' | 'low';
  category: 'device' | 'timing' | 'behavior' | 'upgrade';
  implemented: boolean;
  timestamp: Date;
}

// Chart data interfaces
export interface ChartDataPoint {
  time: string;
  consumption: number;
  cost?: number;
  predicted?: number;
}

export interface DeviceConsumptionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// User goals and achievements
export interface EnergyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // kWh
  current: number;
  startDate: Date;
  endDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
  requirement: string;
}

// Time period for data views
export type TimePeriod = 'today' | 'week' | 'month';

// Notification types
export interface Notification {
  id: string;
  type: 'spike' | 'goal' | 'recommendation' | 'achievement' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Chatbot interfaces
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// App state interface
export interface AppState {
  devices: Device[];
  energyData: EnergyDataPoint[];
  recommendations: Recommendation[];
  goals: EnergyGoal[];
  achievements: Achievement[];
  notifications: Notification[];
  currentPeriod: TimePeriod;
  darkMode: boolean;
  isLoading: boolean;
}

// Weather Data Interface
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string; // 'Sunny', 'Cloudy', 'Rain', etc.
  humidity: number;
  isDay: boolean;
  timestamp: string;
}

// Device Schedule Interface
export interface DeviceSchedule {
  id: string;
  deviceId: string;
  time: string; // "HH:MM" 24h format
  action: 'on' | 'off';
  days: number[]; // 0-6 (Sun-Sat)
  active: boolean;
}

// Device Health Interface
export interface DeviceHealth {
  deviceId: string;
  status: 'good' | 'warning' | 'critical';
  efficiency: number; // 0-100%
  issues: string[]; // "Compressor running too long", "High standby power"
  lastCheck: Date;
}
