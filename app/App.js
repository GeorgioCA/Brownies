import React from "react";
import { View, Text } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fcf8f3" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#4a2c20" }}>Brownies</Text>
      <Text style={{ fontSize: 14, color: "#8b7a6e", marginTop: 8 }}>App loaded successfully</Text>
    </View>
  );
}
