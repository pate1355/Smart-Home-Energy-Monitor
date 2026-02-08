import { Device, EnergyDataPoint, ChatMessage } from './types';
import { API_BASE_URL } from './services/api';

// Helper to build the system context prompt
const buildSystemContext = (
  userMessage: string,
  devices: Device[],
  energyData: EnergyDataPoint[],
  chatHistory: ChatMessage[]
): string => {
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

  const recentHistory = chatHistory.slice(-4).map(msg =>
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n');

  return `You are an intelligent energy advisor assistant for a smart home energy monitoring system. You help users understand their energy consumption, answer questions about their devices, and provide actionable advice.

Current Energy Data:
- Total consumption: ${totalConsumption.toFixed(2)} kWh
- Total cost: $${totalCost.toFixed(2)}
- Average hourly consumption: ${avgConsumption.toFixed(3)} kWh
- Number of monitored hours: ${energyData.length}

Connected Devices:
${JSON.stringify(deviceSummary, null, 2)}

Recent Conversation:
${recentHistory || 'No previous conversation'}

Guidelines:
- Be friendly, helpful, and conversational
- Provide specific, actionable advice based on the user's actual data
- Use emojis sparingly to make responses engaging
- Keep responses concise (2-4 sentences) unless more detail is requested
- If asked about specific devices, reference their actual wattage and status
- Provide energy-saving tips when relevant
- Be encouraging about energy conservation efforts

User Question: ${userMessage}

Provide a helpful response:`;
};

// Generate chatbot response (consumes full stream)
export const generateChatResponse = async (
  userMessage: string,
  devices: Device[],
  energyData: EnergyDataPoint[],
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    const systemContext = buildSystemContext(userMessage, devices, energyData, chatHistory);

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemContext }]
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    if (!reader) return "Error reading response stream";

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) result += data.text;
          } catch (e) {
            console.warn('Error parsing SSE data:', e);
          }
        }
      }
    }
    return result;

  } catch (error) {
    console.error('Error generating chat response:', error);
    return "I encountered an error while processing your question via the backend service.";
  }
};

// Generate streaming chat response
export const generateStreamingChatResponse = async function* (
  userMessage: string,
  devices: Device[],
  energyData: EnergyDataPoint[],
  chatHistory: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  try {
    const systemContext = buildSystemContext(userMessage, devices, energyData, chatHistory);

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemContext }]
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) yield data.text;
          } catch (e) {
            // Ignore transient parsing errors
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating streaming chat response:', error);
    yield "I encountered an error while processing your question. Please try asking something else.";
  }
};
