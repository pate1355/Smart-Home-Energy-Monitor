import { Device, EnergyDataPoint } from './types';

export const PRICE_PER_KWH = 0.13; // Average US electricity price

// Initial device setup
export const createInitialDevices = (): Device[] => {
  return [
    {
      id: 'light-1',
      name: 'Living Room Lights',
      type: 'light',
      wattage: 60,
      status: 'on',
      usageHours: 6,
    },
    {
      id: 'light-2',
      name: 'Bedroom Lights',
      type: 'light',
      wattage: 40,
      status: 'off',
      usageHours: 8,
    },
    {
      id: 'hvac-1',
      name: 'Central Air Conditioning',
      type: 'hvac',
      wattage: 3500,
      status: 'on',
      usageHours: 12,
      healthStatus: 'warning',
    },
    {
      id: 'appliance-1',
      name: 'Refrigerator',
      type: 'appliance',
      wattage: 150,
      status: 'on',
      usageHours: 24,
      healthStatus: 'good',
    },
    {
      id: 'appliance-2',
      name: 'Dishwasher',
      type: 'appliance',
      wattage: 1800,
      status: 'off',
      usageHours: 1.5,
      healthStatus: 'good',
    },
    {
      id: 'appliance-3',
      name: 'Washing Machine',
      type: 'appliance',
      wattage: 500,
      status: 'off',
      usageHours: 1,
      healthStatus: 'critical',
    },
    {
      id: 'electronics-1',
      name: 'TV & Entertainment',
      type: 'electronics',
      wattage: 200,
      status: 'on',
      usageHours: 5,
      healthStatus: 'good',
    },
    {
      id: 'electronics-2',
      name: 'Home Office Equipment',
      type: 'electronics',
      wattage: 300,
      status: 'on',
      usageHours: 8,
      healthStatus: 'good',
    },
    {
      id: 'water-heater-1',
      name: 'Water Heater',
      type: 'water_heater',
      wattage: 4500,
      status: 'on',
      usageHours: 3,
      healthStatus: 'good',
    },
  ];
};

// Generate realistic consumption based on time of day
export const getTimeMultiplier = (hour: number): number => {
  // Peak hours: 4 PM - 9 PM
  if (hour >= 16 && hour < 21) {
    return 1.8; // Higher multiplier for peak
  }
  // Off-peak: 11 PM - 5 AM
  if (hour >= 23 || hour <= 5) {
    return 0.5;
  }
  // Normal hours
  return 1.0;
};

// Simulate device consumption with realistic patterns
export const calculateDeviceConsumption = (
  device: Device,
  hour: number
): number => {
  if (device.status === 'off') {
    // Some devices have standby power
    if (device.type === 'electronics' || device.type === 'appliance') {
      return (device.wattage * 0.01) / 1000; // 1% standby power in kWh
    }
    return 0;
  }

  const baseConsumption = device.wattage / 1000; // Convert to kW
  const timeMultiplier = getTimeMultiplier(hour);

  // Add device-specific patterns
  let adjustedConsumption = baseConsumption;

  switch (device.type) {
    case 'hvac':
      // HVAC varies more with time of day and randomness (weather)
      adjustedConsumption *= timeMultiplier * (0.8 + Math.random() * 0.4);
      break;
    case 'light':
      // Lights are used more during dark hours
      if (hour >= 18 || hour <= 6) {
        adjustedConsumption *= 1.5;
      } else {
        adjustedConsumption *= 0.2;
      }
      break;
    case 'appliance':
      // Appliances have sporadic usage
      if (device.name.includes('Refrigerator')) {
        // Refrigerator runs constantly but cycles
        adjustedConsumption *= 0.3 + Math.random() * 0.4;
      } else {
        adjustedConsumption *= timeMultiplier * (Math.random() > 0.7 ? 1 : 0);
      }
      break;
    case 'electronics':
      adjustedConsumption *= timeMultiplier * (0.9 + Math.random() * 0.2);
      break;
    case 'water_heater':
      // Water heater peaks during morning and evening
      if ((hour >= 6 && hour <= 8) || (hour >= 18 && hour <= 20)) {
        adjustedConsumption *= 1.8;
      } else {
        adjustedConsumption *= 0.3;
      }
      break;
  }

  return adjustedConsumption;
};

// Generate historical energy data
export const generateHistoricalData = (
  devices: Device[],
  hours: number = 24
): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = [];
  const now = new Date();

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();

    const deviceBreakdown = devices.map(device => ({
      deviceId: device.id,
      consumption: calculateDeviceConsumption(device, hour),
    }));

    const totalConsumption = deviceBreakdown.reduce(
      (sum, d) => sum + d.consumption,
      0
    );

    data.push({
      timestamp,
      consumption: totalConsumption,
      cost: totalConsumption * PRICE_PER_KWH,
      deviceBreakdown,
    });
  }

  return data;
};

// Generate current real-time data point
export const generateCurrentDataPoint = (devices: Device[]): EnergyDataPoint => {
  const timestamp = new Date();
  const hour = timestamp.getHours();


  const deviceBreakdown = devices.map(device => ({
    deviceId: device.id,
    consumption: calculateDeviceConsumption(device, hour),
  }));

  const totalConsumption = deviceBreakdown.reduce(
    (sum, d) => sum + d.consumption,
    0
  );

  return {
    timestamp,
    consumption: totalConsumption,
    cost: totalConsumption * PRICE_PER_KWH,
    deviceBreakdown,
  };
};

// Calculate device statistics
export const calculateDeviceStats = (
  devices: Device[],
  energyData: EnergyDataPoint[]
) => {
  const deviceMap = new Map(devices.map(d => [d.id, d]));
  const deviceTotals = new Map<string, number>();

  energyData.forEach(dataPoint => {
    dataPoint.deviceBreakdown.forEach(({ deviceId, consumption }) => {
      const current = deviceTotals.get(deviceId) || 0;
      deviceTotals.set(deviceId, current + consumption);
    });
  });

  const total = Array.from(deviceTotals.values()).reduce((sum, v) => sum + v, 0);

  return Array.from(deviceTotals.entries()).map(([deviceId, consumption]) => {
    const device = deviceMap.get(deviceId);
    return {
      id: deviceId,
      name: device?.name || 'Unknown',
      type: device?.type || 'appliance',
      consumption,
      percentage: (consumption / total) * 100,
    };
  }).sort((a, b) => b.consumption - a.consumption);
};

// Predict peak usage times based on historical data
export const predictPeakUsage = (energyData: EnergyDataPoint[]) => {
  const hourlyAverages = new Array(24).fill(0);
  const hourlyCounts = new Array(24).fill(0);

  energyData.forEach(dataPoint => {
    const hour = dataPoint.timestamp.getHours();
    hourlyAverages[hour] += dataPoint.consumption;
    hourlyCounts[hour]++;
  });

  const averages = hourlyAverages.map((sum, hour) => ({
    hour,
    average: hourlyCounts[hour] > 0 ? sum / hourlyCounts[hour] : 0,
  }));

  const sorted = [...averages].sort((a, b) => b.average - a.average);

  return {
    peakHours: sorted.slice(0, 3).map(h => h.hour),
    peakAverage: sorted[0].average,
    offPeakHours: sorted.slice(-3).map(h => h.hour),
  };
};

// Calculate potential savings
export const calculatePotentialSavings = (
  devices: Device[],
  energyData: EnergyDataPoint[]
) => {
  const stats = calculateDeviceStats(devices, energyData);

  // Calculate savings opportunities
  const hvacSavings = stats
    .filter(s => s.type === 'hvac')
    .reduce((sum, s) => sum + s.consumption * 0.2, 0) * PRICE_PER_KWH * 30; // 20% reduction

  const lightingSavings = stats
    .filter(s => s.type === 'light')
    .filter(s => s.type === 'light')
    .reduce((sum, s) => sum + s.consumption * 0.3, 0) * PRICE_PER_KWH * 30; // 30% reduction

  const peakShiftSavings = energyData
    .filter(d => {
      const hour = d.timestamp.getHours();
      return hour >= 17 && hour <= 22;
    })
    .reduce((sum, d) => sum + d.consumption, 0) * 0.15 * PRICE_PER_KWH * 30; // 15% peak reduction

  return {
    hvac: hvacSavings,
    lighting: lightingSavings,
    peakShift: peakShiftSavings,
    total: hvacSavings + lightingSavings + peakShiftSavings,
  };
};

// Export data to CSV
export const exportToCSV = (energyData: EnergyDataPoint[], devices: Device[]) => {
  let csv = 'Timestamp,Total Consumption (kWh),Total Cost ($)';
  devices.forEach(d => {
    csv += `,${d.name} (kWh)`;
  });
  csv += '\n';

  energyData.forEach(dataPoint => {
    const row = [
      dataPoint.timestamp.toISOString(),
      dataPoint.consumption.toFixed(3),
      dataPoint.cost.toFixed(2),
    ];

    devices.forEach(device => {
      const deviceData = dataPoint.deviceBreakdown.find(d => d.deviceId === device.id);
      row.push((deviceData?.consumption || 0).toFixed(3));
    });

    csv += row.join(',') + '\n';
  });

  return csv;
};

// Download CSV file
export const downloadCSV = (csv: string, filename: string = 'energy-data.csv') => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Calculate Bill Forecast
export const calculateBillForecast = (energyData: EnergyDataPoint[]): number => {
  if (energyData.length === 0) return 0;

  // Get date range
  const dates = energyData.map(d => new Date(d.timestamp).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));

  const totalCost = energyData.reduce((sum, d) => sum + d.cost, 0);
  const dailyAvg = totalCost / daysDiff;

  // Simple projection: 30 days * daily avg
  return dailyAvg * 30;
};
