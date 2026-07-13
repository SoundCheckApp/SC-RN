import { AppleMaps, GoogleMaps } from "expo-maps";
import React, { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

/** Rough zoom for mile radius (expo-maps camera zoom). */
function zoomForRadiusMiles(miles) {
  if (miles <= 1) return 14;
  if (miles <= 3) return 13;
  return 12;
}

function buildMarkers(musicians, selectedMusicianId) {
  return musicians
    .filter((m) => m.latitude != null && m.longitude != null)
    .map((m) => ({
      id: m.id,
      coordinates: {
        latitude: m.latitude,
        longitude: m.longitude,
      },
      title: m.name,
      ...(Platform.OS === "ios"
        ? {
            systemImage: "music.mic",
            tintColor: selectedMusicianId === m.id ? "#A855F7" : "#FF6B35",
          }
        : {
            snippet: m.genre || undefined,
          }),
    }));
}

export default function NearbyMusiciansMap({
  userLocation,
  musicians,
  radiusMiles,
  selectedMusicianId,
  onMarkerPress,
}) {
  const mapRef = useRef(null);

  const cameraPosition = useMemo(() => {
    if (!userLocation) return undefined;
    return {
      coordinates: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      zoom: zoomForRadiusMiles(radiusMiles),
    };
  }, [userLocation, radiusMiles]);

  const markers = useMemo(
    () => buildMarkers(musicians, selectedMusicianId),
    [musicians, selectedMusicianId]
  );

  useEffect(() => {
    if (!mapRef.current || !cameraPosition) return;
    mapRef.current.setCameraPosition(cameraPosition);
  }, [cameraPosition]);

  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Map is available on iOS and Android builds.
        </Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Enable location to view the map.</Text>
      </View>
    );
  }

  const mapStyle = styles.map;
  const mapProps = {
    ref: mapRef,
    style: mapStyle,
    cameraPosition,
    markers,
    properties: { isMyLocationEnabled: true },
    uiSettings: { myLocationButtonEnabled: true },
    onMarkerClick: (marker) => {
      if (marker?.id) {
        onMarkerPress?.({ id: marker.id });
      }
    },
  };

  if (Platform.OS === "ios") {
    return <AppleMaps.View {...mapProps} />;
  }

  return <GoogleMaps.View {...mapProps} />;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  fallback: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  fallbackText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
});
