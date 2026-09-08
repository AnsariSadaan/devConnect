import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

export const saveAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.log("Failed to save access token:", error);
  }
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.log("Failed to get access token:", error);
    return null;
  }
};

export const removeAccessToken = async () => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.log("Failed to remove access token:", error);
  }
};


export const saveRefreshToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.log("Failed to save refresh token:", error);
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.log("Failed to get refresh token:", error);
    return null;
  }
};

export const removeRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.log("Failed to remove refresh token:", error);
  }
};

// User Data
export const saveUserData = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.log("Failed to save user data:", error);
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Failed to get user data:", error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.log("Failed to remove user data:", error);
  }
};

// Clear all
export const clearAllAuthData = async () => {
  try {
    await removeAccessToken();
    await removeRefreshToken();
    await removeUserData();
  } catch (error) {
    console.log("Failed to clear auth data:", error);
  }
};