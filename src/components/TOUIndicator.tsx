import React from 'react';
import { Clock, Zap } from 'lucide-react';

const TOUIndicator: React.FC = () => {
  const currentHour = new Date().getHours();
  // Peak hours: 4 PM - 9 PM (16 - 21)
  const isPeak = currentHour >= 16 && currentHour < 21;
  
  return (
    <div className={`
      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
      ${isPeak 
        ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse' 
        : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      }
    `}>
      {isPeak ? (
        <>
          <Zap className="w-3 h-3" />
          <span>PEAK RATES</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>OFF-PEAK</span>
        </>
      )}
    </div>
  );
};

export default TOUIndicator;
