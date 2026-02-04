// Geocoding service to convert location names to coordinates
// Using Open-Meteo's geocoding API (free, no API key required)

export interface LocationCoordinates {
  lat: number;
  lon: number;
  name: string;
}

export const geocodeLocation = async (
  locationName: string
): Promise<LocationCoordinates | null> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        locationName
      )}&count=1&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];

    return {
      lat: result.latitude,
      lon: result.longitude,
      name: result.name || locationName,
    };
  } catch (error) {
    console.warn('Failed to geocode location:', error);
    return null;
  }
};


