import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity,
  StyleSheet, FlatList, Alert,
} from "react-native";
import api from "../api/client";

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await api("/subscriptions/plans");
        setPlans(p.plans);
        const me = await api("/subscriptions/me");
        setCurrent(me);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function handleUpgrade(plan) {
    if (plan.price === 0) return;
    setLoading(true);
    try {
      const order = await api(`/subscriptions/order?plan_id=${plan.id}`, { method: "POST" });
      // In production: open Razorpay checkout with order details
      // For dev: simulate payment verification
      const verifyRes = await api("/subscriptions/verify", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.order_id,
          payment_id: `pay_dev_${Date.now()}`,
          signature: "dev",
          plan_id: parseInt(plan.id),
        }),
      });
      const me = await api("/subscriptions/me");
      setCurrent(me);
      Alert.alert("Success", verifyRes.message);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    try {
      await api("/subscriptions/cancel", { method: "POST" });
      const me = await api("/subscriptions/me");
      setCurrent(me);
      Alert.alert("Cancelled", "Subscription cancelled");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <View style={s.container}>
      {current && current.plan_type !== "free" ? (
        <View style={s.currentPlan}>
          <Text style={s.currentLabel}>Current Plan</Text>
          <Text style={s.currentName}>{current.plan_type}</Text>
          <Text style={s.currentExpiry}>Expires {new Date(current.ends_at).toLocaleDateString()}</Text>
          <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
            <Text style={s.cancelText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={s.free}>You're on the Free plan</Text>
      )}

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={[s.card, current?.plan_type === item.name && s.cardActive]}>
            <Text style={s.planName}>{item.name}</Text>
            <Text style={s.planPrice}>
              {item.price === 0 ? "Free" : `₹${(item.price / 100).toFixed(0)}`}
              {item.duration_days > 0 ? ` / ${item.duration_days} days` : ""}
            </Text>
            {item.price > 0 && current?.plan_type !== item.name && (
              <TouchableOpacity style={[s.upgradeBtn, loading && s.disabled]} onPress={() => handleUpgrade(item)} disabled={loading}>
                <Text style={s.upgradeText}>{loading ? "Processing..." : "Upgrade"}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={s.list}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  list: { padding: 16, gap: 12 },
  free: { fontSize: 16, color: "#8b7a6e", textAlign: "center", marginTop: 40, marginBottom: 20, fontWeight: "600" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: "#ebd9c8",
  },
  cardActive: { borderColor: "#d4a358", borderWidth: 2 },
  planName: { fontSize: 18, fontWeight: "700", color: "#2d1810" },
  planPrice: { fontSize: 22, fontWeight: "800", color: "#6b3f2e", marginTop: 4 },
  upgradeBtn: {
    marginTop: 12, backgroundColor: "#6b3f2e", borderRadius: 60,
    paddingVertical: 12, alignItems: "center",
  },
  upgradeText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.5 },
  currentPlan: {
    margin: 16, padding: 20, backgroundColor: "#f0d6a8", borderRadius: 16,
    alignItems: "center",
  },
  currentLabel: { fontSize: 12, fontWeight: "600", color: "#8b5a3c", textTransform: "uppercase", letterSpacing: 1 },
  currentName: { fontSize: 20, fontWeight: "800", color: "#2d1810", marginTop: 4 },
  currentExpiry: { fontSize: 13, color: "#6b3f2e", marginTop: 4 },
  cancelBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 60, borderWidth: 1, borderColor: "#e8736a" },
  cancelText: { color: "#e8736a", fontWeight: "600", fontSize: 13 },
});
