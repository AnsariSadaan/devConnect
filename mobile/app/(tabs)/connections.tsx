import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

interface BackendConnection {
  _id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  about?: string;
  skills?: string[];
  location?: string;
  currentCompany?: string | null;
  experience?: number;
  isOnline?: boolean;
  lastSeen?: string;
  chatId: string;
  connectedAt: string;
}

export default function ConnectionsScreen() {
  const [connections, setConnections] = useState<BackendConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { isAuthenticated, loading: authLoading } = useAuth();

  // FETCH CONNECTIONS

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let mounted = true;

    const fetchConnections = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching connections...");

        const response = await api.get("/connections");

        console.log("Connections response:", response.data);

        if (!mounted) {
          return;
        }

        setConnections(response.data.data || []);
      } catch (error: any) {
        console.log("Connections error:", error);

        if (!mounted) {
          return;
        }

        const message =
          error?.response?.data?.message || "Failed to load connections.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchConnections();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authLoading]);

  // AUTH LOADING

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // CONNECTION LOADING

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading connections...</Text>
      </View>
    );
  }

  // ERROR

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // EMPTY STATE

  if (connections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No connections yet</Text>

        <Text style={styles.emptyText}>
          Accept connection requests to start building your network.
        </Text>
      </View>
    );
  }

  // MAIN UI

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Connections</Text>

        <Text style={styles.count}>
          {connections.length}{" "}
          {connections.length === 1 ? "connection" : "connections"}
        </Text>
      </View>

      <FlatList
        data={connections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/chat/[chatId]",
                params: {
                  chatId: item.chatId,
                },
              })
            }
          >
            <ConnectionCard connection={item} />
          </Pressable>
        )}
      />
    </View>
  );
}

// CONNECTION CARD

interface ConnectionCardProps {
  connection: BackendConnection;
}

function ConnectionCard({ connection }: ConnectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        {/* Profile Image */}
        <View>
          <Image
            source={{
              uri: connection.photoUrl,
            }}
            style={styles.avatar}
          />

          {/* Online Indicator */}
          {connection.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* User Information */}
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {connection.firstName} {connection.lastName}
          </Text>

          {connection.currentCompany ? (
            <Text style={styles.company}>{connection.currentCompany}</Text>
          ) : (
            <Text style={styles.company}>Software Developer</Text>
          )}

          {connection.about ? (
            <Text style={styles.about} numberOfLines={2}>
              {connection.about}
            </Text>
          ) : null}

          {connection.skills && connection.skills.length > 0 ? (
            <Text style={styles.skills} numberOfLines={2}>
              {connection.skills.join(" • ")}
            </Text>
          ) : null}

          {/* Online / Last Seen */}
          {connection.isOnline ? (
            <Text style={styles.onlineText}>Online</Text>
          ) : connection.lastSeen ? (
            <Text style={styles.lastSeen}>
              Last seen {formatLastSeen(connection.lastSeen)}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// LAST SEEN FORMATTER

function formatLastSeen(lastSeen: string) {
  const date = new Date(lastSeen);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

// STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f5f5f5",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  header: {
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  count: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  list: {
    gap: 12,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e5e7eb",
  },

  onlineIndicator: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    right: 0,
    bottom: 2,
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  userInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  company: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  about: {
    marginTop: 5,
    fontSize: 13,
    color: "#6b7280",
  },

  skills: {
    marginTop: 5,
    fontSize: 12,
    color: "#9ca3af",
  },

  onlineText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },

  lastSeen: {
    marginTop: 6,
    fontSize: 12,
    color: "#9ca3af",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
