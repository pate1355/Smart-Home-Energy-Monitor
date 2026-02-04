import React, { useState } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { geocodeLocation } from "../services/geocodingService";

interface LocationModalProps {
  onClose: () => void;
  onLocationSet: (lat: number, lon: number, name: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  onClose,
  onLocationSet,
}) => {
  const [locationInput, setLocationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const coordinates = await geocodeLocation(locationInput.trim());

      if (!coordinates) {
        setError(
          'Location not found. Please try a different location name (e.g., "New York", "London", "Tokyo").'
        );
        setIsLoading(false);
        return;
      }

      // Store location in localStorage
      localStorage.setItem(
        "userLocation",
        JSON.stringify({
          lat: coordinates.lat,
          lon: coordinates.lon,
          name: coordinates.name,
        })
      );

      onLocationSet(coordinates.lat, coordinates.lon, coordinates.name);
      onClose();
    } catch (err) {
      setError("Failed to find location. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Set Your Location
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your city or location for weather updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setError(null);
              }}
              placeholder="e.g., New York, London, Tokyo"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
              disabled={isLoading}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter a city name, or location (e.g., "San Francisco, CA")
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !locationInput.trim()}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finding...
                </>
              ) : (
                "Set Location"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
