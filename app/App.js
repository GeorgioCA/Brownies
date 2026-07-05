import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import Navigation from "./src/navigation";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={s.root}>
          <View style={s.box}>
            <Text style={s.title}>Something went wrong</Text>
            <Text style={s.msg}>{String(this.state.error)}</Text>
            <Text style={s.hint}>Check the browser console for details.</Text>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="dark" />
        <Navigation />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fcf8f3", justifyContent: "center", alignItems: "center", padding: 32 },
  box: { backgroundColor: "#fff", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#ebd9c8", maxWidth: 480 },
  title: { fontSize: 20, fontWeight: "700", color: "#c94d44", marginBottom: 12 },
  msg: { fontSize: 14, color: "#4a2c20", fontFamily: "monospace", marginBottom: 16 },
  hint: { fontSize: 13, color: "#8b7a6e" },
});
