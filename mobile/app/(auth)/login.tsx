import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!emailId || !password) {
      Alert.alert("Login", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        emailId,
        password,
      });

      console.log("Login response:", response.data);

      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;
      await login(accessToken, refreshToken);
      console.log("Login Successfull");
    } catch (error) {
      console.log("Login error:", error);

      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DevConnect</Text>

      <Text style={styles.subtitle}>Login to discover developers</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={emailId}
        onChangeText={setEmailId}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
    color: "#6b7280",
  },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
