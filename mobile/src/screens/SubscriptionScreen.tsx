import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { subscriptionsApi } from '../api/client';

const PLAN_FEATURES = {
  free: [
    '50 swipes per day',
    '1 super like per day',
    'Basic filters',
    'Unlimited messages with matches',
  ],
  premium: [
    'Unlimited swipes',
    '5 super likes per day',
    'See who liked you',
    'No ads',
    'Read receipts',
    'Incognito mode',
    'Travel mode',
    '1 boost per month',
  ],
  premium_plus: [
    'Unlimited super likes',
    'Unlimited photos in inbox',
    'Verified badge',
    'Priority discovery',
    'Unlimited boosts',
    'Profile spotlight weekly',
    'All Premium features',
  ],
};

export default function SubscriptionScreen(navigation: any): any {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        subscriptionsApi.getPlans(),
        subscriptionsApi.getMySubscription(),
      ]);
      setPlans(plansRes.data.plans || []);
      setCurrentSub(subRes.data);
    } catch {}
    setLoading(false);
  };

  const handleSubscribe = async (plan) => {
    Alert.alert(
      'Coming Soon',
      'Payment gateway integration is in progress. This will connect to Razorpay, Paytm, or PayPal shortly.'
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brown700} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Current plan */}
        {currentSub && (
          <View style={styles.currentPlan}>
            <Text style={styles.currentLabel}>Current Plan</Text>
            <Text style={styles.currentName}>
              {currentSub.plan_type === 'free' ? 'Free' : currentSub.plan_type}
            </Text>
          </View>
        )}

        {/* Plan cards */}
        {plans
          .filter((p) => p.price_paise > 0)
          .map((plan) => {
            const key = plan.name.toLowerCase().includes('plus')
              ? 'premium_plus'
              : 'premium';
            const features = PLAN_FEATURES[key] || PLAN_FEATURES.premium;
            const priceInr = (plan.price_paise / 100).toFixed(0);
            const perDay = Math.round(plan.price_paise / 100 / plan.duration_days);

            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => handleSubscribe(plan)}
                activeOpacity={0.85}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    ₹{priceInr}{' '}
                    <Text style={styles.planDuration}>
                      /{plan.duration_days}d
                    </Text>
                  </Text>
                  <Text style={styles.perDay}>₹{perDay}/day</Text>
                </View>
                <View style={styles.features}>
                  {features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Text style={styles.featureCheck}>✓</Text>
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.subscribeBtn}
                  onPress={() => handleSubscribe(plan)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.subscribeBtnText}>
                    Get {plan.name}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

        <View style={styles.freePlan}>
          <Text style={styles.freePlanTitle}>Free</Text>
          <Text style={styles.freePlanPrice}>₹0</Text>
          <View style={styles.features}>
            {PLAN_FEATURES.free.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={[styles.featureCheck, { color: colors.textMuted }]}>·</Text>
                <Text style={[styles.featureText, { color: colors.textMuted }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown200,
  },
  backBtn: { fontSize: 16, fontWeight: '600', color: colors.brown700 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  currentPlan: {
    backgroundColor: colors.brown100,
    padding: 16,
    borderRadius: radii.card,
    alignItems: 'center',
  },
  currentLabel: { fontSize: 12, color: colors.brown500, textTransform: 'uppercase', fontWeight: '600' },
  currentName: { fontSize: 18, fontWeight: '700', color: colors.brown800, marginTop: 4 },

  planCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.brown200,
    ...shadows.cardLg,
  },
  planHeader: { alignItems: 'center', marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 32, fontWeight: '800', color: colors.brown700, marginTop: 4 },
  planDuration: { fontSize: 14, fontWeight: '400', color: colors.textMuted },
  perDay: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  features: { gap: 10, marginBottom: 16 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  featureCheck: { fontSize: 16, color: colors.success, fontWeight: '700', width: 20 },
  featureText: { fontSize: 14, color: colors.text, flex: 1 },

  subscribeBtn: {
    backgroundColor: colors.brown700,
    paddingVertical: 14,
    borderRadius: radii.full,
    alignItems: 'center',
    ...shadows.button,
  },
  subscribeBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },

  freePlan: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.brown200,
    opacity: 0.7,
  },
  freePlanTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  freePlanPrice: { fontSize: 24, fontWeight: '700', color: colors.textMuted, textAlign: 'center', marginVertical: 8 },
});
