import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { getMusicianProfile } from "../../utils/musician";

export default function MusicianHomepage() {
  const [balance, setBalance] = useState(0.0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Load balance from database
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // TODO: Fetch balance from musicians table or tips table
        // For now, using default value
        const { profile } = await getMusicianProfile();
        // If balance is stored in profile, set it here
        // setBalance(profile?.balance || 0.0);
      }
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };

  const handleGoLive = () => {
    // TODO: Implement go live functionality
    // This should:
    // 1. Get user's current location
    // 2. Set musician status to "live"
    // 3. Alert supporters in local area
    setIsLive(!isLive);
    console.log("Go Live pressed - Status:", !isLive ? "LIVE" : "OFFLINE");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Go Live Section */}
        <View style={styles.goLiveSection}>
          <View style={styles.locationPinContainer}>
            <Ionicons name="location" size={80} color="#FF6B35" style={styles.locationPin} />
          </View>
          <TouchableOpacity
            style={[styles.goLiveButton, isLive && styles.goLiveButtonActive]}
            onPress={handleGoLive}
            activeOpacity={0.8}
          >
            <Text style={styles.goLiveButtonText}>GO LIVE!</Text>
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
    marginBottom: 40,
    position: "relative",
  },
  locationPin: {
    textShadowColor: "rgba(255, 107, 53, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  goLiveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goLiveButtonActive: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  goLiveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
