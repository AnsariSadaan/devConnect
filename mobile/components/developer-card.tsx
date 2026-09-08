import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from 'react';

interface Developer {
  id: string;
  name: string;
  role: string;
  skills: string;
  image: string;
}

interface DeveloperCardProps {
  developer: Developer;
  onInterested: (developerId: string) => Promise<void>;
  onIgnore: (developerId: string) => Promise<void>;
}

export default function DeveloperCard({ developer, onInterested, onIgnore }: DeveloperCardProps) {
  
  const [loading, setLoading] = useState<"interested" | "ignored" | null>(null);

  const handleInterested = async () => {
    if (loading) return;
    try {
      setLoading("interested");
      await onInterested(developer.id);
    } catch (error) {
      console.log("Interested request failed:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleIgnore = async () => {
    if (loading) return;
    try {
      setLoading("ignored");
      await onIgnore(developer.id);
    } catch (error) {
      console.log("Ignore request failed:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={{
            uri: developer.image,
          }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={styles.name}>{developer.name}</Text>
          <Text style={styles.role}>{developer.role}</Text>
          <Text style={styles.skills}>{developer.skills}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {/* Ignore */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.ignoreButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleIgnore}
          disabled={loading !== null}
        >
          <Text style={styles.buttonText}>
            {loading === "ignored" ? "Ignoring..." : "Ignore"}
          </Text>
        </Pressable>

        {/* Interested */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.interestedButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleInterested}
          disabled={loading !== null}
        >
          <Text style={styles.buttonText}>
            {loading === "interested" ? "Sending..." : "Interested"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },

  info: {
    marginLeft: 14,
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  role: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  skills: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedButton: {
    backgroundColor: "#16a34a",
  },

  ignoreButton: {
    backgroundColor: "#111827",
  },

  interestedButton: {
    backgroundColor: "#111827",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
