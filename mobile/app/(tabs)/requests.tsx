import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
} from "react-native";

interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  about?: string;
  skills?: string[];
  age?: number | null;
  gender?: string;
  location?: string;
  currentCompany?: string | null;
  experience?: number;
}

interface ConnectionRequest {
  _id: string;
  fromUserId: BackendUser;
  toUserId: string;
  status: "interested";
  createdAt: string;
}

export default function RequestScreen() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  // Request accept
  const handleAccept = async (requestId: string) => {
    try {
      console.log("Accepting Request:", requestId);
      const response = await api.post(`/request/review/accepted/${requestId}`);
      console.log("Accepted response:", response.data);
      Alert.alert("Success", "Connection request accepted");

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error: any) {
      console.log("Accept request error:", error);

      const message =
        error?.response?.data?.message || "Failed to accept request.";

      Alert.alert("Error", message);
    }
  };

  // reject request
  const handleReject = async (requestId: string) => {
    try {
      console.log("Rejecting request:", requestId);

      const response = await api.post(`/request/review/rejected/${requestId}`);

      console.log("Reject response:", response.data);

      Alert.alert("Success", "Connection request rejected.");

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error: any) {
      console.log("Reject request error:", error);

      const message =
        error?.response?.data?.message || "Failed to reject request.";

      Alert.alert("Error", message);
    }
  };

  // Fetched received request
  useEffect(()=> {
    if(authLoading || !isAuthenticated){
      return;
    }

    let mounted = true;

    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching received connection request...");

        const response = await api.get("/request/received");
        console.log("Received request response", response.data);

        if(!mounted){
          return;
        }
        setRequests(response.data.data || []);
      } catch (error: any) {
        console.log("received request error:", error);

        if(!mounted){
          return;
        }

        const message = error?.response?.data?.message || "Failed to load connection request.";
        setError(message);
      } finally {
        if(mounted){
          setLoading(false)
        }
      }
    };


    fetchRequest();
    return () => {
      mounted = false;
    }
  }, [isAuthenticated, authLoading]);

  // Auth Loading
  if(authLoading){
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Checking authentication...
        </Text>
      </View>
    )
  }

  // request loading
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // empty state 
  if (requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No connection requests</Text>

        <Text style={styles.emptyText}>
          You don't have any pending connection requests.
        </Text>
      </View>
    );
  }

  // main ui 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Connection Requests</Text>

        <Text style={styles.count}>{requests.length} pending</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      />
    </View>
  );
}

//request card
interface RequestCardProps {
  request: ConnectionRequest;
  onAccept: (requestId: string) => void; // Add this
  onReject: (requestId: string) => void; // Add this
}

function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  const user = request.fromUserId;

  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <Image
          source={{
            uri: user.photoUrl,
          }}
          style={styles.avatar}
        />

        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>

          {user.about ? (
            <Text style={styles.about} numberOfLines={2}>
              {user.about}
            </Text>
          ) : null}

          {user.skills?.length ? (
            <Text style={styles.skills} numberOfLines={2}>
              {user.skills.join(" • ")}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.rejectButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onReject(request._id)}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.acceptButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onAccept(request._id)}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}




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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
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

  about: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  skills: {
    marginTop: 5,
    fontSize: 12,
    color: "#9ca3af",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  button: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  rejectButton: {
    backgroundColor: "#f3f4f6",
  },

  acceptButton: {
    backgroundColor: "#111827",
  },

  rejectText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  acceptText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.7,
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