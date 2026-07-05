/**
 * Calculate age from YYYY-MM-DD date string
 */
export function calculateAge(dobStr: string): number {
  try {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format relative time (e.g. "2h ago", "yesterday")
 */
export function timeAgo(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Validate OTP (6 digits)
 */
export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Get intent label
 */
export function getIntentLabel(intent: string): string {
  const labels: Record<string, string> = {
    lets_see: "Let's See",
    serious_relationship: 'Serious',
    casual: 'Casual',
    friendship: 'Friendship',
    marriage: 'Marriage',
  };
  return labels[intent] || intent;
}

/**
 * Get intent badge colors
 */
export function getIntentColors(intent: string): { bg: string; fg: string } {
  const map: Record<string, { bg: string; fg: string }> = {
    casual: { bg: '#FEF2F2', fg: '#DC2626' },
    serious_relationship: { bg: '#F5EBE1', fg: '#6B3F2E' },
    friendship: { bg: '#F0FDF4', fg: '#16A34A' },
    marriage: { bg: '#F5EBE1', fg: '#6B3F2E' },
    lets_see: { bg: '#F5EBE1', fg: '#A8774F' },
  };
  return map[intent] || { bg: '#F5EBE1', fg: '#A8774F' };
}

/**
 * Format distance
 */
export function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return '';
  if (km < 1) return '<1 km';
  return `${Math.round(km)} km`;
}
