import { Device, EnergyDataPoint, Recommendation } from './types';

// Generate energy recommendations using Groq AI via backend
export const generateRecommendations = async (
  devices: Device[],
  energyData: EnergyDataPoint[],
  currentGoal?: number
): Promise<Recommendation[]> => {
  try {
    // Prepare usage summary
    const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
    const totalCost = energyData.reduce((sum, d) => sum + d.cost, 0);
    const avgConsumption = energyData.length > 0 ? totalConsumption / energyData.length : 0;

    const deviceSummary = devices.map(d => ({
      name: d.name,
      type: d.type,
      wattage: d.wattage,
      status: d.status,
      estimatedDailyHours: d.usageHours,
    }));

    // Peak usage analysis
    const peakHours = energyData
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 3)
      .map(d => d.timestamp.getHours());

    const prompt = `You are an energy efficiency expert analyzing a smart home's energy consumption data. 

Current Energy Usage:
- Total consumption in last ${energyData.length} hours: ${totalConsumption.toFixed(2)} kWh
- Total cost: $${totalCost.toFixed(2)}
- Average hourly consumption: ${avgConsumption.toFixed(3)} kWh
- Peak usage hours: ${peakHours.join(', ')}
${currentGoal ? `- User's daily goal: ${currentGoal} kWh` : ''}

Connected Devices:
${JSON.stringify(deviceSummary, null, 2)}

Please provide exactly 5 specific, actionable energy-saving recommendations. For each recommendation, provide:
1. A short title (max 8 words)
2. A detailed description (2-3 sentences)
3. Estimated monthly savings in dollars
4. Priority level (high/medium/low)
5. Category (device/timing/behavior/upgrade)

Format your response as a JSON object with a single key "recommendations" containing an array of objects.
Example format:
{
  "recommendations": [
    { "title": "...", "description": "...", "potentialSavings": 10.5, "priority": "high", "category": "device" }
  ]
}`;

    // Call backend API
    const response = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error('Failed to fetch recommendations');

    const data = await response.json();
    const content = data.content;

    let recommendations = [];
    try {
      const parsed = JSON.parse(content);
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        recommendations = parsed.recommendations;
      } else if (Array.isArray(parsed)) {
        recommendations = parsed;
      }
    } catch (e) {
      console.warn("Failed to parse AI response, trying regex fallback", e);
      // Fallback regex for JSON array
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        recommendations = JSON.parse(match[0]);
      }
    }

    if (recommendations.length > 0) {
      return recommendations.map((rec: any, index: number) => ({
        id: `rec-${Date.now()}-${index}`,
        title: rec.title,
        description: rec.description,
        potentialSavings: typeof rec.potentialSavings === 'number' ? rec.potentialSavings : parseFloat(rec.potentialSavings) || 0,
        priority: rec.priority,
        category: rec.category,
        implemented: false,
        timestamp: new Date(),
      }));
    }

    return getMockRecommendations();
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getMockRecommendations();
  }
};

// Mock recommendations for demo/fallback
const getMockRecommendations = (): Recommendation[] => {
  return [
    {
      id: 'rec-1',
      title: 'Adjust AC Temperature',
      description: 'Your AC is running at high capacity. Increasing the temperature by 2°F can reduce consumption significantly without sacrificing comfort.',
      potentialSavings: 45.50,
      priority: 'high',
      category: 'device',
      implemented: false,
      timestamp: new Date(),
    },
    {
      id: 'rec-2',
      title: 'Shift Laundry to Off-Peak',
      description: 'Running your washing machine during off-peak hours (11 PM - 6 AM) can reduce costs. Use the delay start feature.',
      potentialSavings: 22.30,
      priority: 'high',
      category: 'timing',
      implemented: false,
      timestamp: new Date(),
    },
    {
      id: 'rec-3',
      title: 'Switch to LED Bulbs',
      description: 'Lighting accounts for a significant portion of energy. Replace incandescent bulbs with LEDs to save up to 75% on lighting costs.',
      potentialSavings: 15.80,
      priority: 'medium',
      category: 'upgrade',
      implemented: false,
      timestamp: new Date(),
    },
    {
      id: 'rec-4',
      title: 'Use Smart Power Strips',
      description: 'Eliminate phantom power draw from electronics by using smart power strips that cut power when devices are idle.',
      potentialSavings: 12.20,
      priority: 'medium',
      category: 'behavior',
      implemented: false,
      timestamp: new Date(),
    },
    {
      id: 'rec-5',
      title: 'Optimize Water Heater',
      description: 'Install a timer on your water heater to heat water only during morning and evening peak usage times.',
      potentialSavings: 35.60,
      priority: 'high',
      category: 'device',
      implemented: false,
      timestamp: new Date(),
    },
  ];
};
