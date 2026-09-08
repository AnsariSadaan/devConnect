import DeveloperCard from "@/components/developer-card";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface BackendDeveloper {
  _id: string;
  firstName: string;
  lastName: string;
  about?: string;
  age?: number | null;
  currentCompany?: string | null;
  experience?: number;
  gender?: string;
  location?: string;
  photoUrl: string;
  skills: string[];
}

interface Developer {
  id: string;
  name: string;
  role: string;
  skills: string;
  image: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  // SEND INTERESTED REQUEST
  const handleInterested = async (developerId: string) => {
    try {
      console.log("Sending interested request:", developerId);

      const response = await api.post(
        `/request/send/interested/${developerId}`
      );

      console.log("Interested response:", response.data);

      // Remove user from feed
      setDevelopers((prev) =>
        prev.filter((developer) => developer.id !== developerId)
      );

      Alert.alert(
        "Success",
        "Connection request sent successfully."
      );
    } catch (error: any) {
      console.log("Interested request error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to send connection request.";

      Alert.alert("Request Failed", message);

      throw error;
    }
  };

  // SEND IGNORE REQUEST
  const handleIgnored = async (developerId: string) => {
    try {
      console.log("Sending ignore request:", developerId);

      const response = await api.post(
        `/request/send/ignored/${developerId}`
      );

      console.log("Ignore response:", response.data);

      // Remove user from feed
      setDevelopers((prev) =>
        prev.filter((developer) => developer.id !== developerId)
      );
    } catch (error: any) {
      console.log("Ignore request error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to ignore this developer.";

      Alert.alert("Request Failed", message);

      throw error;
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await logout();

      console.log("User logout successfully");
    }
  };

  // FETCH FEED
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let mounted = true;

    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/feed");

        if (!mounted) {
          return;
        }

        const formattedDevelopers = response.data.data.map(
          (user: BackendDeveloper): Developer => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.currentCompany
              ? `Developer at ${user.currentCompany}`
              : "Software Developer",
            skills: user.skills.join(" • "),
            image: user.photoUrl,
          })
        );

        setDevelopers(formattedDevelopers);
      } catch (error) {
        console.log("Feed error:", error);

        if (mounted) {
          setError("Failed to load developers");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDevelopers();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authLoading]);

  // AUTH LOADING
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  // FEED LOADING
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Developers....</Text>
      </View>
    );
  }

  // ERROR
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  // EMPTY FEED
  if (developers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyTitle}>
          No developers available
        </Text>

        <Text style={styles.emptyText}>
          Check back later for new developers.
        </Text>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  // MAIN UI
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Discover Developers
          </Text>

          <Text style={styles.count}>
            Developers: {developers.length}
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={developers}
        renderItem={({ item }) => (
          <DeveloperCard
            developer={item}
            onInterested={handleInterested}
            onIgnore={handleIgnored}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },

  count: {
    fontSize: 14,
    color: "#6b7280",
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  list: {
    gap: 12,
    paddingBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
});
