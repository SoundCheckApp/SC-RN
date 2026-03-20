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
import { EVENT_TIME_FRAME_OPTIONS } from "../utils/events";

export default function EventTimeFrameDropdown({ selected, onSelect }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View style={styles.container}>
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
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Time Frame</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={EVENT_TIME_FRAME_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selected === item;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      onSelect(item);
                      setShowModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalItemSelected: {
    backgroundColor: "#374151",
  },
  modalItemText: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  modalItemTextSelected: {
    fontWeight: "600",
  },
});
