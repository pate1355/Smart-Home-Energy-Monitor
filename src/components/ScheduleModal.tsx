import React, { useState } from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { Device, DeviceSchedule } from '../types';

interface ScheduleModalProps {
  device: Device;
  schedules: DeviceSchedule[];
  onClose: () => void;
  onSave: (schedule: DeviceSchedule) => void;
  onDelete: (scheduleId: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ device, schedules, onClose, onSave, onDelete }) => {
  const [time, setTime] = useState('');
  const [action, setAction] = useState<'on' | 'off'>('on');

  const filteredSchedules = schedules.filter(s => s.deviceId === device.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    onSave({
      id: `sch-${Date.now()}`,
      deviceId: device.id,
      time,
      action,
      days: [0, 1, 2, 3, 4, 5, 6], // Default to every day
      active: true
    });
    setTime('');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-slide-up">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Schedule Device
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Existing Schedules */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Schedules</h4>
          {filteredSchedules.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">No schedules set</p>
          )}
          {filteredSchedules.map(schedule => (
            <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                  {schedule.time}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                  schedule.action === 'on' 
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-200 text-gray-700 border border-gray-300'
                }`}>
                  TURN {schedule.action}
                </span>
              </div>
              <button onClick={() => onDelete(schedule.id)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New */}
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Add New Schedule</h4>
          <div className="flex gap-3 mb-3">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-bold"
            />
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'on' | 'off')}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-bold"
            >
              <option value="on" className="text-gray-900 dark:text-white">Turn ON</option>
              <option value="off" className="text-gray-900 dark:text-white">Turn OFF</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Set Schedule
          </button>
        </form>

      </div>
    </div>
  );
};

export default ScheduleModal;
