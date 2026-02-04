import React from "react";
import { Lightbulb, Wind, Tv, Droplet, Power, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Device, DeviceSchedule } from "../types";

interface DeviceListProps {
  devices: Device[];
  schedules: DeviceSchedule[];
  onToggleDevice: (deviceId: string) => void;
  onScheduleClick: (device: Device) => void;
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case "light":
      return Lightbulb;
    case "hvac":
      return Wind;
    case "electronics":
      return Tv;
    case "water_heater":
      return Droplet;
    default:
      return Power;
  }
};

const getDeviceColor = (type: string, status: string) => {
  const isOn = status === "on";
  switch (type) {
    case "light":
      return isOn
        ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30"
        : "text-gray-400 bg-gray-100 dark:bg-gray-700";
    case "hvac":
      return isOn
        ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
        : "text-gray-400 bg-gray-100 dark:bg-gray-700";
    case "electronics":
      return isOn
        ? "text-purple-500 bg-purple-100 dark:bg-purple-900/30"
        : "text-gray-400 bg-gray-100 dark:bg-gray-700";
    case "water_heater":
      return isOn
        ? "text-red-500 bg-red-100 dark:bg-red-900/30"
        : "text-gray-400 bg-gray-100 dark:bg-gray-700";
    default:
      return isOn
        ? "text-green-500 bg-green-100 dark:bg-green-900/30"
        : "text-gray-400 bg-gray-100 dark:bg-gray-700";
  }
};

const DeviceList: React.FC<DeviceListProps> = ({ devices, schedules, onToggleDevice, onScheduleClick }) => {
  return (
    <div className="card animate-slide-up p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Connected Devices
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {devices.filter((d) => d.status === "on").length} of {devices.length}{" "}
          devices active
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          const colorClass = getDeviceColor(device.type, device.status);
          const isOn = device.status === "on";
          const dailyCost =
            ((device.wattage * device.usageHours) / 1000) * 0.13;
            
          // Better efficiency simulation based on health
          let efficiency = 95;
          if (device.healthStatus === 'warning') efficiency = 75;
          if (device.healthStatus === 'critical') efficiency = 45;
          if (isOn) efficiency -= Math.floor(Math.random() * 5); // Jitter

          return (
            <div
              key={device.id}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                isOn
                  ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-primary-200 dark:border-primary-800 shadow-soft hover:shadow-soft-lg"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              } hover:-translate-y-1 cursor-pointer`}
            >
              {/* Health Badge */}
              {device.healthStatus && device.healthStatus !== 'good' && (
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10 ${
                    device.healthStatus === 'warning' 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {device.healthStatus === 'warning' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {device.healthStatus.toUpperCase()}
                </div>
              )}




              <div className="flex items-start justify-between mb-3 pt-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`relative p-3 rounded-xl ${colorClass} transition-transform group-hover:scale-110 shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                    {isOn && (
                      <div className="absolute -top-1 -right-1 w-3 h-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {device.wattage}W
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {device.usageHours}h/day
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onToggleDevice(device.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-inner ${
                    isOn
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Toggle ${device.name}`}
                  title={`Turn ${isOn ? "off" : "on"} ${device.name}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      isOn ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {isOn && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Efficiency
                    </span>
                    <span className={`font-bold ${
                        efficiency > 90 ? 'text-green-600' : efficiency > 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {efficiency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                          efficiency > 90 ? 'bg-green-500' : efficiency > 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${efficiency}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Daily cost
                    </span>
                    <span className="font-bold number-display text-gray-900 dark:text-white">
                      ${dailyCost.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* New Schedule Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onScheduleClick(device); }}
                    className="w-full py-2.5 px-3 flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-all active:scale-95 border border-primary-100 dark:border-primary-800 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {schedules.some(s => s.deviceId === device.id && s.active) ? "Manage Automation" : "Set Schedule"}
                    {schedules.some(s => s.deviceId === device.id && s.active) && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-secondary-500 animate-pulse ml-1" />
                    )}
                  </button>
                </div>
              )}

              {!isOn && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                    Device is offline
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onScheduleClick(device); }}
                    className="w-full py-2 px-3 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 rounded-lg font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceList;
