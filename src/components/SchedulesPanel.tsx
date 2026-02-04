import React from 'react';
import { Clock, Trash2, Calendar, Zap, AlertCircle } from 'lucide-react';
import { Device, DeviceSchedule } from '../types';

interface SchedulesPanelProps {
  schedules: DeviceSchedule[];
  devices: Device[];
  onDeleteSchedule: (id: string) => void;
  onAddScheduleClick: (device: Device) => void;
}

const SchedulesPanel: React.FC<SchedulesPanelProps> = ({ schedules, devices, onDeleteSchedule, onAddScheduleClick }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  
  const getDeviceName = (deviceId: string) => {
    return devices.find(d => d.id === deviceId)?.name || 'Unknown Device';
  };

  const getDayLabel = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <div className="card card-hover group animate-slide-up">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg ring-4 ring-primary-500/10 transition-transform group-hover:scale-110">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Active Schedules
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {schedules.length} automation rules active
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Add</span>
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-primary-200 dark:border-primary-700 animate-slide-up shadow-inner">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Select a device:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {devices.map(device => (
                <button
                  key={device.id}
                  onClick={() => {
                    onAddScheduleClick(device);
                    setIsAdding(false);
                  }}
                  className="px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-500 transition-colors truncate shadow-sm"
                >
                  {device.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No schedules yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set schedules per device to automate your home's energy usage
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="group/item relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-black font-mono text-primary-600 dark:text-primary-400">
                        {schedule.time}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                        schedule.action === 'on' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        TURN {schedule.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-secondary-500" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {getDeviceName(schedule.deviceId)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {schedule.days.map((day) => (
                        <span
                          key={day}
                          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded"
                        >
                          {getDayLabel(day)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteSchedule(schedule.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <span className="font-bold">Optimization Tip:</span> Schedule heavy appliances for off-peak hours (11 PM - 5 AM) to reduce your bill by up to 40%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchedulesPanel;
