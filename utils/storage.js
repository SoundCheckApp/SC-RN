// Storage utility for saving and loading user credentials
// Note: Install @react-native-async-storage/async-storage for this to work
// npm install @react-native-async-storage/async-storage

let AsyncStorage = null;

// Dynamically import AsyncStorage if available
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  console.warn("AsyncStorage not installed. Install with: npm install @react-native-async-storage/async-storage");
}

const STORAGE_KEYS = {
  REMEMBERED_EMAIL: "@sc_app:remembered_email",
  REMEMBERED_PASSWORD: "@sc_app:remembered_password",
  REMEMBER_ME: "@sc_app:remember_me",
};

export const saveCredentials = async (email, password) => {
  if (!AsyncStorage) {
    console.warn("AsyncStorage not available");
    return;
  }
  
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.REMEMBERED_EMAIL, email],
      [STORAGE_KEYS.REMEMBERED_PASSWORD, password],
      [STORAGE_KEYS.REMEMBER_ME, "true"],
    ]);
  } catch (error) {
    console.error("Error saving credentials:", error);
  }
};

export const loadCredentials = async () => {
  if (!AsyncStorage) {
    return { email: "", password: "", rememberMe: false };
  }
  
  try {
    const values = await AsyncStorage.multiGet([
      STORAGE_KEYS.REMEMBERED_EMAIL,
      STORAGE_KEYS.REMEMBERED_PASSWORD,
      STORAGE_KEYS.REMEMBER_ME,
    ]);
    
    const email = values[0][1] || "";
    const password = values[1][1] || "";
    const rememberMe = values[2][1] === "true";
    
    return { email, password, rememberMe };
  } catch (error) {
    console.error("Error loading credentials:", error);
    return { email: "", password: "", rememberMe: false };
  }
};

export const clearCredentials = async () => {
  if (!AsyncStorage) {
    return;
  }
  
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.REMEMBERED_EMAIL,
      STORAGE_KEYS.REMEMBERED_PASSWORD,
      STORAGE_KEYS.REMEMBER_ME,
    ]);
  } catch (error) {
    console.error("Error clearing credentials:", error);
  }
};
