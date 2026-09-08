import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    console.log("Navigation check:", {
      isAuthenticated,
      loading,
      segments,
      inAuthGroup,
    });

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}