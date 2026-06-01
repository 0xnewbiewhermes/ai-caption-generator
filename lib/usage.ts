const STORAGE_KEY = "aicaption_usage";
const DAILY_LIMIT = 5;

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getUsage(): UsageData {
  if (typeof window === "undefined") return { date: getToday(), count: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    const data: UsageData = JSON.parse(raw);
    // Reset if different day
    if (data.date !== getToday()) {
      return { date: getToday(), count: 0 };
    }
    return data;
  } catch {
    return { date: getToday(), count: 0 };
  }
}

export function incrementUsage(): UsageData {
  const usage = getUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function getRemainingGenerations(): number {
  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

export function canGenerate(): boolean {
  return getRemainingGenerations() > 0;
}

export function getDailyLimit(): number {
  return DAILY_LIMIT;
}
