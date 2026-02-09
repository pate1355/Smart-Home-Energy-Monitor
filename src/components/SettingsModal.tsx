import React from 'react';
import { X, MapPin, Download, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  userLocationName: string | null;
  onOpenLocationModal: () => void;
  onExportData: () => void;
  onClearData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  userLocationName,
  onOpenLocationModal,
  onExportData,
  onClearData
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          


          {/* Location Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Location & Weather
            </h3>
            <div 
              onClick={onOpenLocationModal}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userLocationName || "Set Location"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Used for local weather data
                  </p>
                </div>
              </div>
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                Edit
              </span>
            </div>
          </section>

          {/* Data Management Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Data Management
            </h3>
            <div className="space-y-2">
              <button
                onClick={onExportData}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Download your energy history as CSV</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                    onClearData();
                  }
                }}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Clear All Data</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reset app to detailed state</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

           {/* About Section */}
           <section className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-2">
               <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                Powered by
               </span>
               <span className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Groq AI
               </span>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
              Version 1.2.0 • Smart Home Energy Monitor
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
