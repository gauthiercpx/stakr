import type {
  PortfolioResponse,
  PortfolioSummary,
  PositionResponse,
  PriceHistoryPoint,
} from '../api/portfolio';
import type { PortfolioPeriod } from '../pages/dashboard/components/PortfolioSummaryCard';

export const DASHBOARD_CACHE_KEY = 'dashboard_snapshot_v1';
const DASHBOARD_CACHE_VERSION = 1;
const DASHBOARD_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

export interface DashboardCachedUser {
  id: number;
  email: string;
  first_name: string;
  is_active: boolean;
}

export interface DashboardSnapshot {
  version: number;
  updatedAt: number;
  user: DashboardCachedUser | null;
  portfolioId: string | null;
  portfolios: PortfolioResponse[];
  summary: PortfolioSummary | null;
  positions: PositionResponse[];
  historiesByTicker: Record<string, PriceHistoryPoint[]>;
  selectedPeriod: PortfolioPeriod;
  periodPnl: {
    amount: number;
    percent: number;
  };
}

export function readDashboardCache(): DashboardSnapshot | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DashboardSnapshot;
    if (parsed.version !== DASHBOARD_CACHE_VERSION) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    if (Date.now() - parsed.updatedAt > DASHBOARD_CACHE_TTL_MS) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(DASHBOARD_CACHE_KEY);
    return null;
  }
}

export function writeDashboardCache(snapshot: Omit<DashboardSnapshot, 'version' | 'updatedAt'>) {
  try {
    const payload: DashboardSnapshot = {
      version: DASHBOARD_CACHE_VERSION,
      updatedAt: Date.now(),
      ...snapshot,
    };
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / serialization issues
  }
}

export function clearDashboardCache() {
  localStorage.removeItem(DASHBOARD_CACHE_KEY);
}

