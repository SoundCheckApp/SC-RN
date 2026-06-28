import * as Location from "expo-location";

/**
 * Request foreground location permission and read the current position.
 * @returns {Promise<{ latitude: number, longitude: number } | null, error: { message: string, denied?: boolean } | null}>}
 */
export async function getCurrentCoordinates() {
  try {
    const { status: existing } = await Location.getForegroundPermissionsAsync();
    let status = existing;

    if (existing !== "granted") {
      const requested = await Location.requestForegroundPermissionsAsync();
      status = requested.status;
    }

    if (status !== "granted") {
      return {
        coords: null,
        error: {
          message: "Location permission is required to show nearby musicians.",
          denied: true,
        },
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      error: null,
    };
  } catch (error) {
    console.error("getCurrentCoordinates:", error);
    return {
      coords: null,
      error: { message: error.message ?? "Could not get your location." },
    };
  }
}
