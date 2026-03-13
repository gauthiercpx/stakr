import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  getAssetHistory,
  getPortfolioPositions,
  getPortfolioSummary,
  listPortfolios,
  type PriceHistoryPoint,
  type PositionResponse,
  type PortfolioResponse,
  type PortfolioSummary,
} from '../api/portfolio';
import { useI18n } from '../i18n/useI18n';
import FadeIn from '../components/animations/FadeIn';
import DashboardHero from './dashboard/components/DashboardHero';
import PortfolioSummaryCard, {
  type PortfolioPeriod,
} from './dashboard/components/PortfolioSummaryCard';
import AccountActionsCard from './dashboard/components/AccountActionsCard';
import ChartsPlaceholderCard from './dashboard/components/ChartsPlaceholderCard';
import PortfolioChartCard from './dashboard/components/PortfolioChartCard';
import DashboardActionModal from './dashboard/components/DashboardActionModal';
import './dashboard/dashboard.css';

interface User {
  id: number;
  email: string;
  first_name: string;
  is_active: boolean;
}

interface DashboardProps {
  onSessionInvalid: () => void;
}

const DASHBOARD_PORTFOLIO_KEY = 'dashboard_portfolio_id';
const PERIODS: readonly PortfolioPeriod[] = ['1D', '1W', '1M', '1Y', 'ALL'];
type DashboardAction = 'transaction' | 'asset' | 'portfolio' | null;

export default function Dashboard({ onSessionInvalid }: DashboardProps) {
  const navigate = useNavigate();
  const { locale, t } = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<string | null>(() =>
    localStorage.getItem(DASHBOARD_PORTFOLIO_KEY),
  );
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioResponse[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historiesByTicker, setHistoriesByTicker] = useState<Record<string, PriceHistoryPoint[]>>(
    {},
  );
  const [summaryError, setSummaryError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PortfolioPeriod>('1M');
  const [periodPnl, setPeriodPnl] = useState<{ amount: number; percent: number }>({
    amount: 0,
    percent: 0,
  });
  const [lastPnlIsPositive, setLastPnlIsPositive] = useState(true);
  const [periodPnlLoading, setPeriodPnlLoading] = useState(false);
  const [shouldMountChart, setShouldMountChart] = useState(false);
  const [activeAction, setActiveAction] = useState<DashboardAction>(null);

  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const hasPortfolio = !!portfolioId;

  const asNumber = useCallback((value?: string) => {
    if (!value) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }, []);

  const formatCurrency = useCallback(
    (value?: string) =>
      new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(asNumber(value)),
    [asNumber, numberLocale],
  );

  const formatPercent = useCallback(
    (value?: string) =>
      `${new Intl.NumberFormat(numberLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(asNumber(value))}%`,
    [asNumber, numberLocale],
  );

  const getPeriodStartDate = useCallback((period: PortfolioPeriod): Date | null => {
    const now = new Date();
    const start = new Date(now);
    switch (period) {
      case '1D':
        start.setDate(now.getDate() - 1);
        return start;
      case '1W':
        start.setDate(now.getDate() - 7);
        return start;
      case '1M':
        start.setDate(now.getDate() - 30);
        return start;
      case '1Y':
        start.setDate(now.getDate() - 365);
        return start;
      case 'ALL':
      default:
        return null;
    }
  }, []);

  const getPriceAtPeriodStart = useCallback((
    history: Array<{ timestamp: string; price: string }>,
    periodStart: Date,
    fallbackPrice: number,
  ) => {
    if (history.length === 0) return fallbackPrice;
    const periodStartMs = periodStart.getTime();
    let candidate = Number(history[0].price);

    for (const point of history) {
      const pointMs = new Date(point.timestamp).getTime();
      if (pointMs <= periodStartMs) {
        candidate = Number(point.price);
      } else {
        break;
      }
    }

    return Number.isFinite(candidate) ? candidate : fallbackPrice;
  }, []);

  const loadSummary = useCallback(
    async (id: string) => {
      setSummaryLoading(true);
      setSummaryError('');
      try {
        const data = await getPortfolioSummary(id);
        setSummary(data);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          onSessionInvalid();
          return;
        }
        if (status === 404) {
          localStorage.removeItem(DASHBOARD_PORTFOLIO_KEY);
          setPortfolioId(null);
          setSummary(null);
          return;
        }
        if (import.meta.env.DEV) {
          console.error('Portfolio summary error:', error);
        }
        setSummaryError(t('dashboard.portfolio.error'));
      } finally {
        setSummaryLoading(false);
      }
    },
    [onSessionInvalid, t],
  );

  const loadPortfolios = useCallback(async () => {
    try {
      const data = await listPortfolios();
      setPortfolios(data);

      setPortfolioId((current) => {
        if (current && data.some((portfolio) => portfolio.id === current)) {
          return current;
        }
        if (data.length > 0) {
          localStorage.setItem(DASHBOARD_PORTFOLIO_KEY, data[0].id);
          return data[0].id;
        }
        localStorage.removeItem(DASHBOARD_PORTFOLIO_KEY);
        return null;
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        onSessionInvalid();
        return;
      }
      if (import.meta.env.DEV) {
        console.error('List portfolios error:', error);
      }
    }
  }, [onSessionInvalid]);

  useEffect(() => {
    api
      .get('auth/users/me')
      .then(async (response) => {
        setUser(response.data);
        await loadPortfolios();
        setLoading(false);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('Session error:', error);
        }
        onSessionInvalid();
      });
  }, [loadPortfolios, onSessionInvalid]);

  useEffect(() => {
    if (!portfolioId) {
      setSummary(null);
      setPositions([]);
      return;
    }
    loadSummary(portfolioId);
  }, [loadSummary, portfolioId]);

  useEffect(() => {
    if (!portfolioId) {
      setPositions([]);
      setHistoriesByTicker({});
      return;
    }

    let cancelled = false;

    const loadPositions = async () => {
      setPositionsLoading(true);
      try {
        const data = await getPortfolioPositions(portfolioId);
        if (!cancelled) {
          setPositions(data);
        }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if ((status === 401 || status === 403) && !cancelled) {
          onSessionInvalid();
          return;
        }
        if (!cancelled && import.meta.env.DEV) {
          console.error('Portfolio positions error:', error);
        }
      } finally {
        if (!cancelled) {
          setPositionsLoading(false);
        }
      }
    };

    loadPositions();

    return () => {
      cancelled = true;
    };
  }, [onSessionInvalid, portfolioId]);

  useEffect(() => {
    if (!portfolioId) {
      setHistoriesByTicker({});
      return;
    }

    const activePositions = positions.filter((position) => Number(position.quantity) > 0);
    if (activePositions.length === 0) {
      setHistoriesByTicker({});
      setHistoriesLoading(false);
      return;
    }

    let cancelled = false;

    const loadHistories = async () => {
      setHistoriesLoading(true);
      try {
        const entries = await Promise.all(
          activePositions.map(async (position) => {
            const response = await getAssetHistory(position.asset_ticker);
            return [position.asset_ticker, response.history] as const;
          }),
        );

        if (!cancelled) {
          setHistoriesByTicker(Object.fromEntries(entries));
        }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if ((status === 401 || status === 403) && !cancelled) {
          onSessionInvalid();
          return;
        }
        if (!cancelled && import.meta.env.DEV) {
          console.error('Portfolio histories error:', error);
        }
      } finally {
        if (!cancelled) {
          setHistoriesLoading(false);
        }
      }
    };

    loadHistories();

    return () => {
      cancelled = true;
    };
  }, [onSessionInvalid, portfolioId, positions]);

  useEffect(() => {
    if (loading) {
      setShouldMountChart(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldMountChart(true);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading]);

  useEffect(() => {
    if (!portfolioId || !summary) {
      setPeriodPnl({ amount: 0, percent: 0 });
      return;
    }

    if (selectedPeriod === 'ALL') {
      setPeriodPnl({
        amount: asNumber(summary.global_pnl),
        percent: asNumber(summary.global_pnl_percent),
      });
      return;
    }

    // On retarde le calcul historique (coûteux) pour laisser passer les animations d'entrée.
    if (!shouldMountChart) {
      return;
    }

    const periodStart = getPeriodStartDate(selectedPeriod);
    if (!periodStart) {
      setPeriodPnl({ amount: 0, percent: 0 });
      return;
    }

    if (historiesLoading) {
      return;
    }

    let cancelled = false;

    const computePeriodPnl = async () => {
      setPeriodPnlLoading(true);
      try {
        const activePositions = positions.filter((position) => Number(position.quantity) > 0);

        if (activePositions.length === 0) {
          if (!cancelled) {
            setPeriodPnl({ amount: 0, percent: 0 });
          }
          return;
        }

        let totalNow = 0;
        let totalAtStart = 0;

        for (const position of activePositions) {
          const quantity = Number(position.quantity);
          const currentPrice = Number(position.current_price);
          const safeCurrentPrice = Number.isFinite(currentPrice) ? currentPrice : 0;

          totalNow += quantity * safeCurrentPrice;

          const history = historiesByTicker[position.asset_ticker] ?? [];

          const startPrice = getPriceAtPeriodStart(
            history,
            periodStart,
            safeCurrentPrice,
          );
          totalAtStart += quantity * startPrice;
        }

        const rawAmount = totalNow - totalAtStart;
        const rawPercent = totalAtStart > 0 ? (rawAmount / totalAtStart) * 100 : 0;
        const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
        const percent = Number.isFinite(rawPercent) ? rawPercent : 0;

        if (!cancelled) {
          setPeriodPnl({ amount, percent });
        }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if ((status === 401 || status === 403) && !cancelled) {
          onSessionInvalid();
          return;
        }
        if (!cancelled && import.meta.env.DEV) {
          console.error('Period PnL error:', error);
        }
      } finally {
        if (!cancelled) {
          setPeriodPnlLoading(false);
        }
      }
    };

    computePeriodPnl();

    return () => {
      cancelled = true;
    };
  }, [
    asNumber,
    getPeriodStartDate,
    getPriceAtPeriodStart,
    historiesByTicker,
    historiesLoading,
    onSessionInvalid,
    portfolioId,
    positions,
    selectedPeriod,
    shouldMountChart,
    summary,
  ]);

  const handleCreatePortfolio = useCallback(() => {
    setActiveAction('portfolio');
  }, []);

  const displayName = user?.first_name || user?.email.split('@')[0] || 'User';
  const pnlValue = Number.isFinite(periodPnl.amount) ? periodPnl.amount : 0;

  useEffect(() => {
    if (periodPnlLoading) {
      return;
    }
    setLastPnlIsPositive(pnlValue >= 0);
  }, [periodPnlLoading, pnlValue]);

  const isPositivePnl = periodPnlLoading ? lastPnlIsPositive : pnlValue >= 0;
  const isPnlNeutral =
    !shouldMountChart ||
    summaryLoading ||
    positionsLoading ||
    historiesLoading ||
    periodPnlLoading;

  const summaryDisplay = useMemo(
    () => ({
      totalValue: formatCurrency(summary?.total_value),
      dividends: formatCurrency(summary?.total_dividends_received),
      pnlAmount: formatCurrency(String(pnlValue)),
      pnlPercent: formatPercent(String(Number.isFinite(periodPnl.percent) ? periodPnl.percent : 0)),
      kpis: [
        {
          title: t('dashboard.portfolio.kpi.totalInvested'),
          value: formatCurrency(summary?.total_invested),
        },
      ],
    }),
    [formatCurrency, formatPercent, periodPnl.percent, pnlValue, summary, t],
  );

  const handlePortfolioChange = useCallback((nextPortfolioId: string) => {
    setPortfolioId(nextPortfolioId);
    localStorage.setItem(DASHBOARD_PORTFOLIO_KEY, nextPortfolioId);
  }, []);

  const activeModalTitle =
    activeAction === 'transaction'
      ? t('dashboard.actions.addTransaction')
      : activeAction === 'asset'
        ? t('dashboard.actions.addAsset')
        : t('dashboard.actions.addPortfolio');

  return (
    <main className="dashboard">
      {loading ? (
        <FadeIn direction="none">
          <div className="dashboard__loading">{t('common.loading')}</div>
        </FadeIn>
      ) : (
        <>
          <FadeIn>
            <DashboardHero
              greeting={t('dashboard.greeting')}
              subtitle={t('dashboard.subtitle')}
              displayName={displayName}
              isActive={!!user?.is_active}
              activeLabel={t('dashboard.account.status.active')}
              inactiveLabel={t('dashboard.account.status.inactive')}
            />
          </FadeIn>

          <div className="dashboard__grid">
            <FadeIn delay={0.12} fullWidth className="dashboard__gridItem">
              <PortfolioSummaryCard
                title={t('dashboard.portfolio.title')}
                totalValueLabel={t('dashboard.portfolio.kpi.totalValue')}
                totalValue={summaryDisplay.totalValue}
                dividendsLabel={t('dashboard.portfolio.dividends')}
                dividendsValue={summaryDisplay.dividends}
                pnlValue={summaryDisplay.pnlAmount}
                pnlPercent={summaryDisplay.pnlPercent}
                isPositivePnl={isPositivePnl}
                isPnlNeutral={isPnlNeutral}
                hasPortfolio={hasPortfolio}
                isLoading={summaryLoading}
                isPeriodPnlLoading={periodPnlLoading || positionsLoading || historiesLoading}
                error={summaryError}
                emptyText={t('dashboard.portfolio.empty')}
                loadingText={t('dashboard.portfolio.loading')}
                portfolios={portfolios}
                selectedPortfolioId={portfolioId}
                onPortfolioChange={handlePortfolioChange}
                periodLabel={t('dashboard.portfolio.period')}
                selectedPeriod={selectedPeriod}
                periods={PERIODS}
                onPeriodChange={setSelectedPeriod}
                kpis={summaryDisplay.kpis}
                viewPortfolioLabel={t('dashboard.portfolio.open')}
                onViewPortfolio={() => {
                  if (portfolioId) {
                    navigate(`/portfolio/${portfolioId}`);
                  }
                }}
                createPortfolioLabel={t('dashboard.actions.addPortfolio')}
                onCreatePortfolio={handleCreatePortfolio}
              />
            </FadeIn>

            <FadeIn delay={0.18} fullWidth className="dashboard__gridItem">
              <AccountActionsCard
                title={t('dashboard.assets.title')}
                positions={positions}
                isLoading={positionsLoading}
                loadingText={t('dashboard.assets.loading')}
                emptyText={t('dashboard.assets.empty')}
                triggerLabel={t('dashboard.assets.trigger')}
                quantityLabel={t('portfolioPage.table.quantity')}
                valueLabel={t('portfolioPage.table.currentPrice')}
                addTransactionLabel={t('dashboard.actions.addTransaction')}
                addAssetLabel={t('dashboard.actions.addAsset')}
                onAddTransaction={() => setActiveAction('transaction')}
                onAddAsset={() => setActiveAction('asset')}
                locale={locale}
              />
            </FadeIn>
          </div>

          <FadeIn delay={0.24}>
            {shouldMountChart ? (
              <PortfolioChartCard
                title={t('dashboard.charts.title')}
                portfolioId={portfolioId}
                positions={positions}
                  historiesByTicker={historiesByTicker}
                  historiesLoading={historiesLoading}
                selectedPeriod={selectedPeriod}
                periodLabel={t('dashboard.portfolio.period')}
                periods={PERIODS}
                onPeriodChange={setSelectedPeriod}
                locale={locale}
                noDataText={t('dashboard.charts.noData')}
                emptyText={t('dashboard.portfolio.empty')}
                tooltipLabel={t('dashboard.charts.tooltipLabel')}
              />
            ) : (
              <ChartsPlaceholderCard
                title={t('dashboard.charts.title')}
                placeholder={t('common.loading')}
              />
            )}
          </FadeIn>

          <DashboardActionModal
            isOpen={activeAction !== null}
            title={activeModalTitle}
            description={t('dashboard.actions.modalPlaceholder')}
            onClose={() => setActiveAction(null)}
          />
        </>
      )}
    </main>
  );
}