import React from "react";
import { StyleSheet, View } from "react-native";

export default function Logo() {
  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        {/* Musical Note Body - Using multiple views to simulate gradient */}
        <View style={styles.noteBody}>
          <View style={styles.noteHeadTop} />
          <View style={styles.noteHeadBottom} />
        </View>
        
        {/* Note stem with checkmark */}
        <View style={styles.noteStem}>
          {/* Checkmark integrated into stem */}
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkLine1} />
            <View style={styles.checkmarkLine2} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  noteContainer: {
    width: 60,
    height: 70,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  noteBody: {
    width: 36,
    height: 28,
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
  },
  noteHeadTop: {
    width: 36,
    height: 14,
    backgroundColor: "#FCD34D", // Golden yellow
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  noteHeadBottom: {
    width: 36,
    height: 14,
    backgroundColor: "#10B981", // Dark green
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: -1,
  },
  noteStem: {
    width: 5,
    height: 40,
    backgroundColor: "#10B981",
    marginTop: 8,
    marginLeft: 28,
    position: "relative",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 15,
    left: -4,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkLine1: {
    width: 2,
    height: 5,
    backgroundColor: "#10B981",
    position: "absolute",
    top: 2,
    left: 3,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkLine2: {
    width: 2,
    height: 7,
    backgroundColor: "#10B981",
    position: "absolute",
    top: 5,
    left: 6,
    transform: [{ rotate: "-45deg" }],
  },
});
