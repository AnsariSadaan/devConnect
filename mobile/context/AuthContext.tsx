import { createContext, useContext, useEffect, useState } from "react";
import {
  getAccessToken,
  getUserData,
  removeAccessToken,
  removeRefreshToken,
  removeUserData,
  saveAccessToken,
  saveRefreshToken,
  saveUserData,
} from "@/services/authStorage";
import { setAuthListener } from "@/services/authEvents";
import { decodeToken } from "@/services/jwt";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    userData?: User
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token && !!user;

  // Load authentication when app starts
  useEffect(() => {
    const loadAuthentication = async () => {
      try {
        const storedAccessToken = await getAccessToken();
        const storedUser = await getUserData();
        if (storedAccessToken && storedUser) {
          
          // Validate token is still valid
          const isValid = validateToken(storedAccessToken);

          if (isValid) {
            setToken(storedAccessToken);
            setUser(storedUser);
          } else {
            // Token expired or invalid
            await removeAccessToken();
            await removeRefreshToken();
            await removeUserData();
          }
        }
      } catch (error) {
        console.log("Failed to load authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthentication();
  }, []);

  // Listen for authentication expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      console.log("Authentication cleared");
      setToken(null);
      setUser(null);
    };

    setAuthListener(handleAuthExpired);

    return () => {
      setAuthListener(() => {});
    };
  }, []);

  // login
  const login = async (newAccessToken: string, newRefreshToken: string, userData?: User) => {
    // await saveAccessToken(newAccessToken);
    // await saveRefreshToken(newRefreshToken);
    // setToken(newAccessToken);
    try {
      // If userData not provided, decode from token
      let userInfo = userData;
      
      if (!userInfo) {
        userInfo = decodeToken(newAccessToken);
      }

      if (!userInfo) {
        throw new Error("Unable to decode user information from token");
      }

      // Save to storage
      await saveAccessToken(newAccessToken);
      await saveRefreshToken(newRefreshToken);
      await saveUserData(userInfo);

      // Update state
      setToken(newAccessToken);
      setUser(userInfo);
      
      console.log("User logged in:", userInfo.email);
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    }
  };

  // logout
  const logout = async () => {
    try {
      await removeAccessToken();
      await removeRefreshToken();
      await removeUserData();
      setToken(null);
      setUser(null);
      console.log("User logged out");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      console.log("No user logged in to update");
      return;
    }

    try {
      const updatedUser = { ...user, ...userData };
      await saveUserData(updatedUser);
      setUser(updatedUser);
      console.log("User data updated");
    } catch (error) {
      console.log("Update user error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

// Helper function to validate token
function validateToken(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    
    // Check if token has expired
    if (decoded?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    }
    
    return true;
  } catch (error) {
    console.log("Token validation error:", error);
    return false;
  }
}