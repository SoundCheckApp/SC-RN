import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { getCurrentCoordinates } from "../../utils/location";
import { getMusicianProfile, setMusicianLiveStatus } from "../../utils/musician";

export default function MusicianHomepage() {
  const [balance, setBalance] = useState(0.0);
  const [isLive, setIsLive] = useState(false);
  const [isTogglingLive, setIsTogglingLive] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await getMusicianProfile();
      }
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  }, []);

  const loadLiveStatus = useCallback(async () => {
    const { profile, error } = await getMusicianProfile();
    if (error) {
      console.error("Error loading live status:", error);
      return;
    }
    setIsLive(Boolean(profile?.is_live));
  }, []);

  useEffect(() => {
    loadBalance();
    loadLiveStatus();
  }, [loadBalance, loadLiveStatus]);

  const handleGoLive = async () => {
    if (isTogglingLive) return;

    const goingLive = !isLive;
    setIsTogglingLive(true);

    try {
      if (goingLive) {
        const { coords, error: locError } = await getCurrentCoordinates();
        if (locError || !coords) {
          Alert.alert(
            "Location required",
            locError?.message ??
              "Enable location access to go live and appear on the map."
          );
          return;
        }

        const { error } = await setMusicianLiveStatus(
          true,
          coords.latitude,
          coords.longitude
        );

        if (error) {
          const msg = error.message ?? "Could not go live.";
          if (
            msg.includes("latitude") ||
            msg.includes("is_live") ||
            error.code === "42703"
          ) {
            Alert.alert(
              "Database setup needed",
              "Run supabase_musicians_live_location.sql in your Supabase SQL editor, then try again."
            );
          } else {
            Alert.alert("Go live failed", msg);
          }
          return;
        }

        setIsLive(true);
      } else {
        const { error } = await setMusicianLiveStatus(false);
        if (error) {
          Alert.alert("Could not go offline", error.message ?? "Try again.");
          return;
        }
        setIsLive(false);
      }
    } finally {
      setIsTogglingLive(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.goLiveSection}>
          <View style={styles.locationPinContainer}>
            <Ionicons
              name="location"
              size={80}
              color={isLive ? "#10B981" : "#FF6B35"}
              style={styles.locationPin}
            />
          </View>
          {isLive && (
            <Text style={styles.liveStatusText}>
              You are live on the map for nearby fans.
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.goLiveButton,
              isLive && styles.goLiveButtonActive,
              isTogglingLive && styles.goLiveButtonDisabled,
            ]}
            onPress={handleGoLive}
            activeOpacity={0.8}
            disabled={isTogglingLive}
          >
            {isTogglingLive ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.goLiveButtonText}>
                {isLive ? "GO OFFLINE" : "GO LIVE!"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  balanceCard: {
    width: 200,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#6B7280",
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  goLiveSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationPinContainer: {
    marginBottom: 24,
    position: "relative",
  },
  locationPin: {
    textShadowColor: "rgba(255, 107, 53, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  liveStatusText: {
    color: "#10B981",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  goLiveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goLiveButtonActive: {
    backgroundColor: "#374151",
    shadowColor: "#374151",
  },
  goLiveButtonDisabled: {
    opacity: 0.7,
  },
  goLiveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
