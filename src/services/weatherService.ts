import { WeatherData } from "../types";

// WMO Weather interpretation codes
const getWeatherCondition = (code: number): string => {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Heavy Rain";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Clear";
};

// Get stored location from localStorage
const getStoredLocation = (): { lat: number; lon: number } | null => {
    try {
        const stored = localStorage.getItem('userLocation');
        if (stored) {
            const location = JSON.parse(stored);
            return { lat: location.lat, lon: location.lon };
        }
    } catch (error) {
        console.warn('Failed to read stored location:', error);
    }
    return null;
};

export const fetchWeather = async (
    lat?: number,
    lon?: number
): Promise<WeatherData | null> => {
    // Use provided coordinates, or stored location, or default fallback
    let finalLat = lat;
    let finalLon = lon;
    
    if (!finalLat || !finalLon) {
        const stored = getStoredLocation();
        if (stored) {
            finalLat = stored.lat;
            finalLon = stored.lon;
        } else {
            // Default fallback (only if no location is set)
            finalLat = 43.2560802;
            finalLon = -79.8728583;
        }
    }
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day`
        );

        if (!response.ok) {
            throw new Error('Weather fetch failed');
        }

        const data = await response.json();
        const current = data.current;

        return {
            temperature: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: Math.round(current.relative_humidity_2m),
            condition: getWeatherCondition(current.weather_code),
            isDay: current.is_day === 1,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.warn("Failed to fetch weather data:", error);
        return null;
    }
};
