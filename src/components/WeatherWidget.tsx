import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Moon, Droplets } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm animate-pulse">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-1">
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const getIcon = () => {
    // If it's night and clear, show moon
    if (!weather.isDay && weather.condition === 'Clear') return <Moon className="w-6 h-6 text-indigo-400" />;
    
    switch (weather.condition) {
      case 'Clear': return <Sun className="w-6 h-6 text-amber-500" />;
      case 'Partly Cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'Foggy': return <Cloud className="w-6 h-6 text-gray-400" />; // Reuse cloud for now
      case 'Rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'Heavy Rain': return <CloudRain className="w-6 h-6 text-blue-600" />;
      case 'Snowy': return <CloudSnow className="w-6 h-6 text-sky-200" />;
      case 'Thunderstorm': return <CloudLightning className="w-6 h-6 text-purple-500" />;
      default: return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 pr-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105">
      <div className="p-2 bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-full">
        {getIcon()}
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{weather.temperature}°C</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Feels {weather.feelsLike}°
            </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>{weather.condition}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
                <Droplets className="w-3 h-3" />
                {weather.humidity}%
            </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
