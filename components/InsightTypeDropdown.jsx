import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const INSIGHT_TYPES = ["Tips", "Ratings", "Review", "Followers"];

export default function InsightTypeDropdown({ selected, onSelect }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Insight Type</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selected}</Text>
          <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Insight Type</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INSIGHT_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selected === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setShowModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selected === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selected === item && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  dropdownText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalItemSelected: {
    backgroundColor: "#374151",
  },
  modalItemText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
