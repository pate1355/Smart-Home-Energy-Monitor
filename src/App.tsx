import { useState, useEffect, useCallback } from "react";
import {
  Zap,
  TrendingDown,
  Target,
  Award,
  Download,
  Moon,
  Sun,
  Settings,
  Bell,
  Sparkles,
  MessageCircle,
  Menu,
  X,
  Loader,
} from "lucide-react";
import {
  Device,
  EnergyDataPoint,
  Recommendation,
  EnergyGoal,
  Achievement,
  Notification,
  TimePeriod,
  WeatherData,
  DeviceSchedule,
} from "./types";
import {
  createInitialDevices,
  generateHistoricalData,
  generateCurrentDataPoint,
  calculateDeviceStats,
  calculatePotentialSavings,
  exportToCSV,
  downloadCSV,
  calculateBillForecast,
} from "./utils";
import { generateRecommendations } from "./aiService";
import { fetchWeather } from "./services/weatherService";
import Dashboard from "./components/Dashboard";
import DeviceList from "./components/DeviceList";
import RecommendationsPanel from "./components/RecommendationsPanel";
import GoalsPanel from "./components/GoalsPanel";
import AchievementsPanel from "./components/AchievementsPanel";
import Chatbot from "./components/Chatbot";
import WeatherWidget from "./components/WeatherWidget";
import TOUIndicator from "./components/TOUIndicator";
import ScheduleModal from "./components/ScheduleModal";
import LocationModal from "./components/LocationModal";
import SettingsModal from "./components/SettingsModal";
import SchedulesPanel from "./components/SchedulesPanel";
import api from "./services/api";

function App() {
  // State management
  const [devices, setDevices] = useState<Device[]>([]);
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [goals, setGoals] = useState<EnergyGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>("today");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  
  // Scheduling State
  const [schedules, setSchedules] = useState<DeviceSchedule[]>([]);
  const [schedulingDevice, setSchedulingDevice] = useState<Device | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Backend Health Check State
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [healthCheckAttempts, setHealthCheckAttempts] = useState(0);

  // Check Backend Health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.health.check();
        setIsBackendReady(true);
      } catch (err) {
        console.log("Backend not ready yet, retrying...");
        setHealthCheckAttempts(prev => prev + 1);
        setTimeout(checkHealth, 2000); // Retry every 2 seconds
      }
    };
    checkHealth();
  }, []);

  // Initialize data from MongoDB (only after backend is ready)
  useEffect(() => {
    if (!isBackendReady) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch devices first
        let fetchedDevices = await api.device.getAll() as Device[];
        
        // If no devices, seed the database
        if (fetchedDevices.length === 0) {
          console.log("Seeding initial devices...");
          const initialDevices = createInitialDevices();
          fetchedDevices = await api.device.bulkUpdate(initialDevices) as Device[];
        }
        setDevices(fetchedDevices);

        // Fetch other data in parallel
        const [
          fetchedEnergy,
          fetchedGoals,
          fetchedAchievements,
          fetchedNotifications,
          fetchedSchedules
        ] = await Promise.all([
          api.energy.getAll({ limit: 1000 }) as Promise<EnergyDataPoint[]>,
          api.goal.getAll() as Promise<EnergyGoal[]>,
          api.achievement.getAll() as Promise<Achievement[]>,
          api.notification.getAll({ limit: 20 }) as Promise<Notification[]>,
          api.schedule.getAll() as Promise<DeviceSchedule[]>
        ]);

        // Seed energy data if empty
        if (fetchedEnergy.length === 0) {
          const hours = currentPeriod === "today" ? 24 : currentPeriod === "week" ? 168 : 720;
          const historicalData = generateHistoricalData(fetchedDevices, hours);
          await api.energy.bulkCreate(historicalData);
          setEnergyData(historicalData);
        } else {
          // Convert string dates back to Date objects
          setEnergyData(fetchedEnergy.map(d => ({
            ...d,
            timestamp: new Date(d.timestamp)
          })));
        }

        // Seed goals if empty
        if (fetchedGoals.length === 0) {
          const today = new Date();
          const dailyGoal: EnergyGoal = {
            id: "goal-1",
            type: "daily",
            target: 50,
            current: 0, // Will be updated by effect
            startDate: new Date(today.setHours(0, 0, 0, 0)),
            endDate: new Date(today.setHours(23, 59, 59, 999)),
          };
          await api.goal.create(dailyGoal);
          setGoals([dailyGoal]);
        } else {
          setGoals(fetchedGoals.map(g => ({
            ...g,
            startDate: new Date(g.startDate),
            endDate: new Date(g.endDate)
          })));
        }

        // Seed achievements if empty
        if (fetchedAchievements.length === 0) {
          const initialAchievements: Achievement[] = [
            {
              id: "ach-1",
              title: "First Steps",
              description: "Started monitoring your energy usage",
              icon: "🌱",
              unlocked: true,
              unlockedDate: new Date(),
              requirement: "Install the energy monitor",
            },
            {
              id: "ach-2",
              title: "Energy Saver",
              description: "Reduced daily consumption by 10%",
              icon: "⚡",
              unlocked: false,
              requirement: "Reduce consumption by 10%",
            },
            {
              id: "ach-3",
              title: "Goal Crusher",
              description: "Met your daily energy goal 7 days in a row",
              icon: "🎯",
              unlocked: false,
              requirement: "Meet daily goal for 7 consecutive days",
            },
            {
              id: "ach-4",
              title: "Peak Shifter",
              description: "Successfully shifted 80% of peak usage to off-peak hours",
              icon: "🔄",
              unlocked: false,
              requirement: "Shift 80% of peak usage",
            },
            {
              id: "ach-5",
              title: "Eco Champion",
              description: "Saved over $100 in energy costs this month",
              icon: "🏆",
              unlocked: false,
              requirement: "Save $100+ per month",
            },
          ];
          await api.achievement.bulkCreate(initialAchievements);
          setAchievements(initialAchievements);
        } else {
          setAchievements(fetchedAchievements.map(a => ({
            ...a,
            unlockedDate: a.unlockedDate ? new Date(a.unlockedDate) : undefined
          })));
        }

        setNotifications(fetchedNotifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
        
        setSchedules(fetchedSchedules);

      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setError("Could not connect to the database. Please make sure the backend server is running.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [currentPeriod, isBackendReady]);

  // Check for stored location on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const location = JSON.parse(stored);
        setUserLocationName(location.name);
      } else {
        // Show location modal if no location is set
        setShowLocationModal(true);
      }
    } catch (error) {
      console.warn('Failed to read stored location:', error);
      setShowLocationModal(true);
    }
  }, []);

  // Fetch Weather
  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeather();
      setWeather(data);
    };
    loadWeather();
    const interval = setInterval(loadWeather, 30 * 60 * 1000); // Every 30 mins
    return () => clearInterval(interval);
  }, [userLocationName]); // Reload weather when location changes

  // Schedule Checking Effect
  useEffect(() => {
    const checkSchedules = async () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const activeSchedules = schedules.filter(s => 
        s.active && 
        s.days.includes(currentDay) && 
        s.time === currentTime
      );

      for (const schedule of activeSchedules) {
        const device = devices.find(d => d.id === schedule.deviceId);
        if (device) {
          if ((schedule.action === 'on' && device.status === 'off') || 
              (schedule.action === 'off' && device.status === 'on')) {
            
            try {
              // Update backend
              await api.device.updateStatus(device.id, schedule.action);
              
              // Update local state
              setDevices(prev => prev.map(d => 
                d.id === device.id ? { ...d, status: schedule.action } : d
              ));

              // Create notification
              const notification: Notification = {
                id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'info',
                title: 'Scheduled Action',
                message: `Turned ${schedule.action.toUpperCase()} ${device.name} based on schedule`,
                timestamp: new Date(),
                read: false
              };
              await api.notification.create(notification);
              setNotifications(pre => [notification, ...pre]);
            } catch (err) {
              console.error("Failed to execute schedule action:", err);
            }
          }
        }
      }
    };

    const interval = setInterval(checkSchedules, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [schedules, devices]);

  // Handlers for Schedule Modal
  const handleSaveSchedule = async (schedule: DeviceSchedule) => {
    try {
      await api.schedule.create(schedule);
      setSchedules(prev => [...prev, schedule]);
      setSchedulingDevice(null);
      
      const notification: Notification = {
        id: `new-sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "Schedule Set",
        message: `Device scheduled for ${schedule.time}`,
        type: "success",
        timestamp: new Date(),
        read: false
      };
      await api.notification.create(notification);
      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      console.error("Failed to save schedule:", err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.schedule.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const newDataPoint = generateCurrentDataPoint(devices);
      
      try {
        // Save to MongoDB
        await api.energy.create(newDataPoint);
        
        setEnergyData((prev) => {
          const updated = [...prev, newDataPoint];
          const timeWindow = 
            currentPeriod === "today" ? 24 * 60 * 60 * 1000 : // 24 hours
            currentPeriod === "week" ? 7 * 24 * 60 * 60 * 1000 : // 7 days
            30 * 24 * 60 * 60 * 1000; // 30 days
            
          const cutoff = new Date(Date.now() - timeWindow);
          return updated.filter(d => new Date(d.timestamp) > cutoff);
        });

        // Update current goal progress
        setGoals((prevGoals) =>
          prevGoals.map((goal) => {
            if (goal.type === "daily") {
              const startOfDay = new Date();
              startOfDay.setHours(0, 0, 0, 0);
              
              const todaysConsumption = energyData
                .filter(d => new Date(d.timestamp).getTime() >= startOfDay.getTime())
                .reduce((sum, d) => sum + d.consumption, 0);

              // Update in backend too (throttled/periodic ideally, but here for consistency)
              api.goal.updateProgress(goal.id, todaysConsumption).catch(console.error);

              return {
                ...goal,
                current: todaysConsumption,
              };
            }
            return goal;
          })
        );

        // Check for usage spikes
        const recentAvg =
          energyData.slice(-5).reduce((sum, d) => sum + d.consumption, 0) / 5;
        if (newDataPoint.consumption > recentAvg * 1.5) {
          const spikeNotif: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "spike",
            title: "High Usage Detected",
            message: `Current consumption is ${(
              (newDataPoint.consumption / recentAvg - 1) *
              100
            ).toFixed(0)}% above average`,
            timestamp: new Date(),
            read: false,
          };
          addNotification(spikeNotif);
        }
      } catch (err) {
        console.error("Failed to save real-time data:", err);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [devices, energyData, currentPeriod]);

  // Generate AI recommendations
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const recs = await generateRecommendations(
        devices,
        energyData,
        goals.find((g) => g.type === "daily")?.target
      );
      
      // Save to MongoDB
      await api.recommendation.bulkCreate(recs);
      
      setRecommendations(recs);

      if (recs.length > 0) {
        const notif: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "recommendation",
          title: "New Recommendations Available",
          message: `${recs.length} new energy-saving tips generated`,
          timestamp: new Date(),
          read: false,
        };
        await api.notification.create(notif);
        addNotification(notif);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [devices, energyData, goals]);

  useEffect(() => {
    if (devices.length > 0 && energyData.length > 0 && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [devices.length, energyData.length]);

  // Toggle device status
  const toggleDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newStatus = device.status === "on" ? "off" : "on";

    try {
      // Update backend
      await api.device.updateStatus(deviceId, newStatus);

      // Update local state
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d))
      );

      // TOU Optimization Warning
      const currentHour = new Date().getHours();
      const isPeak = currentHour >= 16 && currentHour < 21;
      if (newStatus === 'on' && isPeak && device.wattage > 500) {
        addNotification({
          id: `tou-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'recommendation',
          title: 'Peak Hour Warning',
          message: `${device.name} uses high power. Running it after 9 PM could save you ~40% on cost.`,
          timestamp: new Date(),
          read: false
        });
      }
    } catch (err) {
      console.error("Failed to toggle device:", err);
    }
  };

  // Implement recommendation
  const implementRecommendation = async (recId: string) => {
    try {
      await api.recommendation.markImplemented(recId, true);
      
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recId ? { ...rec, implemented: true } : rec
        )
      );

      addNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "recommendation",
        title: "Recommendation Implemented",
        message: "Great job! Track your savings over the next few days.",
        timestamp: new Date(),
        read: false,
      });
    } catch (err) {
      console.error("Failed to implement recommendation:", err);
    }
  };

  // Check Achievements mechanism
  useEffect(() => {
    if (goals.length === 0 || energyData.length === 0) return;

    const dailyGoal = goals.find(g => g.type === 'daily');
    const potentialSavings = calculatePotentialSavings(devices, energyData);
    
    // Calculate off-peak usage (11 PM - 5 AM)
    const offPeakConsumption = energyData
      .filter(d => {
        const hour = new Date(d.timestamp).getHours();
        return hour >= 23 || hour <= 5;
      })
      .reduce((sum, d) => sum + d.consumption, 0);
      
    const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
    const offPeakRatio = totalConsumption > 0 ? (offPeakConsumption / totalConsumption) : 0;

    const checkAchievements = async () => {
      let updatedAchievements = [...achievements];
      let hasUpdates = false;

      const unlock = async (id: string) => {
        const index = updatedAchievements.findIndex(a => a.id === id);
        if (index !== -1 && !updatedAchievements[index].unlocked) {
          try {
            await api.achievement.unlock(id);
            updatedAchievements[index] = { 
              ...updatedAchievements[index], 
              unlocked: true, 
              unlockedDate: new Date() 
            };
            hasUpdates = true;
            
            const achNotif: Notification = {
              id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: "achievement",
              title: "Achievement Unlocked!",
              message: `You earned: ${updatedAchievements[index].title}`,
              timestamp: new Date(),
              read: false,
            };
            addNotification(achNotif);
          } catch (err) {
            console.error("Failed to unlock achievement:", err);
          }
        }
      };

      // Check "Energy Saver" (ach-2): Reduced daily consumption (simulated by being 10% under goal)
      if (dailyGoal && dailyGoal.current < dailyGoal.target * 0.9) {
        await unlock('ach-2');
      }

      // Check "Goal Crusher" (ach-3): Goal met (simplified: current < target)
      if (dailyGoal && dailyGoal.current <= dailyGoal.target) {
        await unlock('ach-3');
      }

      // Check "Peak Shifter" (ach-4): > 30% usage in off-peak
      if (offPeakRatio > 0.3) {
        await unlock('ach-4');
      }

      // Check "Eco Champion" (ach-5): Savings > $100
      if (potentialSavings.total > 100) {
        await unlock('ach-5');
      }

      if (hasUpdates) {
        setAchievements(updatedAchievements);
      }
    };

    checkAchievements();
  }, [energyData, goals, devices, achievements]);

  // Add notification
  const addNotification = async (notification: Notification) => {
    try {
      await api.notification.create(notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    } catch (err) {
      console.error("Failed to save notification:", err);
      // Still show in UI even if DB fails
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    }
  };

  // Export data
  const handleExport = () => {
    const csv = exportToCSV(energyData, devices);
    downloadCSV(csv, `energy-data-${currentPeriod}-${Date.now()}.csv`);

    addNotification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "goal",
      title: "Data Exported",
      message: "Your energy data has been downloaded successfully",
      timestamp: new Date(),
      read: false,
    });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Handle location set
  const handleLocationSet = (lat: number, lon: number, name: string) => {
    setUserLocationName(name);
    // Reload weather with new location
    const loadWeather = async () => {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
    };
    loadWeather();
    
    addNotification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "success",
      title: "Location Updated",
      message: `Weather data for ${name} is now active`,
      timestamp: new Date(),
      read: false,
    });
  };

  // Add new goal
  const handleAddGoal = async (target: number, type: 'daily' | 'weekly' | 'monthly') => {
    const today = new Date();
    const newGoal: EnergyGoal = {
      id: `goal-${Date.now()}`,
      type,
      target,
      current: 0,
      startDate: new Date(today.setHours(0, 0, 0, 0)),
      endDate: new Date(today.setHours(23, 59, 59, 999)),
    };
    
    try {
      await api.goal.create(newGoal);
      
      setGoals(prev => {
        const filtered = prev.filter(g => g.type !== type);
        return [...filtered, newGoal];
      });

      addNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "goal",
        title: "New Goal Set",
        message: `Target set to ${target} kWh ${type}`,
        timestamp: new Date(),
        read: false,
      });
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Calculate stats
  const deviceStats = calculateDeviceStats(devices, energyData);
  const potentialSavings = calculatePotentialSavings(devices, energyData);
  const totalConsumption = energyData.reduce(
    (sum, d) => sum + d.consumption,
    0
  );
  const totalCost = energyData.reduce((sum, d) => sum + d.cost, 0);

  const billForecast = calculateBillForecast(energyData);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      {/* Backend Wake-up Loader */}
      {!isBackendReady && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <Zap className="w-12 h-12 text-primary-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Waking up the server...
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8 leading-relaxed">
            Since this is a free instance, it may take up to 50 seconds to spin up. 
            Thank you for your patience! 🚀
          </p>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
            <Loader className="w-4 h-4 text-primary-500 animate-spin" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Attempt {healthCheckAttempts + 1}...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        {/* Premium Navigation Bar */}
        <header className="glass-strong sticky top-0 z-50 transition-all duration-300 border-b border-gray-200/60 dark:border-gray-700/60 backdrop-blur-xl shadow-soft">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between">
              {/* Logo & Brand Section */}
              <div className="flex items-center space-x-3 group">
                <div className="relative p-2.5 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                  <Zap className="w-7 h-7 text-white drop-shadow-lg animate-pulse-slow" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 bg-clip-text text-transparent tracking-tight">
                    Smart Energy
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary-500" />
                    AI-Powered Dashboard
                  </p>
                </div>
              </div>

              {/* Weather & TOU Widget */}
              <div className="hidden lg:flex items-center gap-4">
                <TOUIndicator />
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="transition-transform hover:scale-105 active:scale-95"
                  title={userLocationName ? `Change location (${userLocationName})` : "Set location"}
                >
                  <WeatherWidget weather={weather} loading={!weather} />
                </button>
              </div>

              {/* Desktop Navigation Actions */}
              <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                {/* Modern Period Selector */}
                <div className="relative group">
                  <select
                    value={currentPeriod}
                    onChange={(e) =>
                      setCurrentPeriod(e.target.value as TimePeriod)
                    }
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    aria-label="Select time period"
                  >
                    <option value="today">📅 Today</option>
                    <option value="week">📊 Week</option>
                    <option value="month">📈 Month</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Notifications with Badge */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl transition-all duration-200 hover-lift active:scale-95 ${
                    showNotifications
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                  }`}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell
                    className={`w-5 h-5 ${
                      showNotifications ? "animate-wiggle" : ""
                    }`}
                  />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-2xs font-black rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 animate-bounce">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Premium Export Button */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover-lift active:scale-95"
                  title="Export data to CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden lg:inline">Export</span>
                </button>

                {/* Settings with Indicator */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2.5 rounded-xl transition-all duration-200 hover-lift active:scale-95 ${
                    showSettings
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                  }`}
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings
                    className={`w-5 h-5 ${
                      showSettings ? "animate-spin-slow" : ""
                    }`}
                  />
                </button>

                {/* Enhanced Dark Mode Toggle with Animation */}
                <button
                  onClick={toggleDarkMode}
                  className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover-lift active:scale-95 overflow-hidden group"
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                  title={darkMode ? "Light mode" : "Dark mode"}
                >
                  <div className="relative z-10">
                    {darkMode ? (
                      <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* AI Chatbot Button */}
                <button
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="relative p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover-lift active:scale-95 ml-1"
                  title="AI Assistant"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                </button>
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all hover-lift active:scale-95 text-gray-600 dark:text-gray-300"
                aria-label="Menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-60" />
        </header>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-x-0 top-[73px] z-40 animate-slide-down">
            <div className="glass-strong border-b border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="max-w-8xl mx-auto px-4 py-4 space-y-3">
                {/* Period Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Time Period
                  </label>
                  <select
                    value={currentPeriod}
                    onChange={(e) => {
                      setCurrentPeriod(e.target.value as TimePeriod);
                      setShowMobileMenu(false);
                    }}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="today">📅 Today</option>
                    <option value="week">📊 This Week</option>
                    <option value="month">📈 This Month</option>
                  </select>
                </div>

                {/* Menu Items */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {/* Notifications */}
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span className="font-semibold">Notifications</span>
                    </span>
                    {unreadNotifications > 0 && (
                      <span className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-black rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Export */}
                  <button
                    onClick={() => {
                      handleExport();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all text-gray-700 dark:text-gray-300"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Export Data</span>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all text-gray-700 dark:text-gray-300"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Settings</span>
                  </button>

                  {/* Dark Mode */}
                  <button
                    onClick={() => {
                      toggleDarkMode();
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex items-center gap-3">
                      {darkMode ? (
                        <>
                          <Sun className="w-5 h-5 text-amber-400" />
                          <span className="font-semibold">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5" />
                          <span className="font-semibold">Dark Mode</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* AI Chatbot */}
                  <button
                    onClick={() => {
                      setShowChatbot(!showChatbot);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all font-semibold shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setShowNotifications(false)}
            />
            <div className="fixed right-4 top-20 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-[70] max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={async () => {
                    try {
                      await api.notification.deleteAll();
                      setNotifications([]);
                    } catch (err) {
                      console.error("Failed to clear notifications:", err);
                    }
                  }}
                  className="text-sm text-eco-600 hover:text-eco-700 font-bold"
                >
                  Clear All
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No notifications
                </p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={async () => {
                        if (!notif.read) {
                          try {
                            await api.notification.markRead(notif.id, true);
                            setNotifications(prev => prev.map(n => 
                              n.id === notif.id ? { ...n, read: true } : n
                            ));
                          } catch (err) {
                            console.error("Failed to mark notification as read:", err);
                          }
                        }
                      }}
                      className={`p-3 rounded-lg transition-colors cursor-pointer ${
                        notif.read
                          ? "bg-gray-50 dark:bg-gray-700"
                          : "bg-eco-50 dark:bg-eco-900/20 hover:bg-eco-100 dark:hover:bg-eco-900/40"
                      }`}
                    >
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            userLocationName={userLocationName}
            onOpenLocationModal={() => {
              setShowSettings(false);
              setShowLocationModal(true);
            }}
            onExportData={handleExport}
            onClearData={async () => {
              try {
                // Clear all data collections
                await Promise.all([
                  api.notification.deleteAll(),
                  api.energy.cleanup(0), // Delete all energy data
                  // Ideally we'd have a full reset endpoint, but this works for now
                ]);
                localStorage.removeItem('userLocation');
                window.location.reload();
              } catch (err) {
                console.error("Failed to clear data:", err);
                setError("Failed to clear data. Please try again.");
              }
            }}
          />
        )}

        {/* Main Content */}
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Consumption Card */}
            <div className="card card-hover group animate-slide-up">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Consumption
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold number-display bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
                        {totalConsumption.toFixed(1)}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        kWh
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <TrendingDown className="w-3 h-3" />
                    5% vs last period
                  </span>
                </div>
              </div>
            </div>

            {/* Total Cost Card */}
            <div
              className="card card-hover group animate-slide-up"
              style={{ animationDelay: "50ms" }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Cost
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold number-display bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        ${totalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-800/30 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    @ $0.13/kWh avg rate
                  </span>
                  {billForecast > 0 && (
                     <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold ml-auto">
                      Projection: ${billForecast.toFixed(0)}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Potential Savings Card */}
            <div
              className="card card-hover group animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Potential Savings
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold number-display bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                        ${potentialSavings.total.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                      per month
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl group-hover:scale-110 transition-transform hover-glow">
                    <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI Calculated
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div
              className="card card-hover group animate-slide-up"
              style={{ animationDelay: "150ms" }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Achievements
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold number-display bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {achievements.filter((a) => a.unlocked).length}
                      </p>
                      <span className="text-xl text-gray-400 dark:text-gray-500">
                        /
                      </span>
                      <span className="text-xl text-gray-500 dark:text-gray-400">
                        {achievements.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 rounded-xl group-hover:scale-110 transition-transform group-hover:rotate-12">
                    <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (achievements.filter((a) => a.unlocked).length /
                          achievements.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Charts */}
          <Dashboard
            energyData={energyData}
            deviceStats={deviceStats}
            currentPeriod={currentPeriod}
            billForecast={billForecast}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column - Devices and Goals */}
            <div className="lg:col-span-2 space-y-8 sticky top-24 h-fit">
              <DeviceList 
                devices={devices} 
                schedules={schedules}
                onToggleDevice={toggleDevice} 
                onScheduleClick={(device) => setSchedulingDevice(device)}
              />
              <GoalsPanel 
                goals={goals}  
                energyData={energyData} 
                onAddGoal={handleAddGoal}
              />
            </div>

            {/* Right Column - Recommendations and Achievements */}
            <div className="space-y-8">
              <RecommendationsPanel
                recommendations={recommendations}
                onImplement={implementRecommendation}
                isLoading={isLoading}
              />
              <SchedulesPanel 
                schedules={schedules} 
                devices={devices} 
                onDeleteSchedule={handleDeleteSchedule} 
                onAddScheduleClick={(device) => setSchedulingDevice(device)}
              />
              <AchievementsPanel achievements={achievements} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Smart Home Energy Monitor - Powered by AI &amp; IoT Technology
            </p>
          </div>
        </footer>

        {/* Chatbot Component */}
        {showChatbot && (
          <Chatbot
            devices={devices}
            energyData={energyData}
            onClose={() => setShowChatbot(false)}
          />
        )}

        {/* Schedule Modal */}
        {schedulingDevice && (
          <ScheduleModal
            device={schedulingDevice}
            schedules={schedules}
            onClose={() => setSchedulingDevice(null)}
            onSave={handleSaveSchedule}
            onDelete={handleDeleteSchedule}
          />
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <LocationModal
            onClose={() => {
              // Only allow closing if location is already set
              const stored = localStorage.getItem('userLocation');
              if (stored) {
                setShowLocationModal(false);
              }
            }}
            onLocationSet={handleLocationSet}
          />
        )}
      </div>
    </div>
  );
}

export default App;
