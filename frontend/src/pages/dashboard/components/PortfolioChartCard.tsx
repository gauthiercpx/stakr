import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  type PriceHistoryPoint,
  type PositionResponse,
} from '../../../api/portfolio';
import type { PortfolioPeriod } from './PortfolioSummaryCard';

interface ChartPoint {
  ts: number;
  value: number;
}

interface PortfolioChartCardProps {
  title: string;
  portfolioId: string | null;
  positions: PositionResponse[];
  historiesByTicker: Record<string, PriceHistoryPoint[]>;
  historiesLoading: boolean;
  selectedPeriod: PortfolioPeriod;
  periodLabel: string;
  periods: readonly PortfolioPeriod[];
  onPeriodChange: (period: PortfolioPeriod) => void;
  locale: string;
  noDataText: string;
  emptyText: string;
  tooltipLabel: string;
}

function getPeriodStart(period: PortfolioPeriod): Date | null {
  const now = new Date();
  const d = new Date(now);
  switch (period) {
    case '1D':
      d.setDate(now.getDate() - 1);
      return d;
    case '1W':
      d.setDate(now.getDate() - 7);
      return d;
    case '1M':
      d.setDate(now.getDate() - 30);
      return d;
    case '1Y':
      d.setDate(now.getDate() - 365);
      return d;
    default:
      return null;
  }
}

function buildChartData(
  positions: PositionResponse[],
  historiesMap: Map<string, PriceHistoryPoint[]>,
  periodStart: Date | null,
): ChartPoint[] {
  const active = positions.filter((p) => Number(p.quantity) > 0);

  const allTs = new Set<number>();
  for (const pos of active) {
    const history = historiesMap.get(pos.asset_ticker) ?? [];
    for (const point of history) {
      const t = new Date(point.timestamp).getTime();
      if (!periodStart || t >= periodStart.getTime()) {
        allTs.add(t);
      }
    }
  }

  return Array.from(allTs)
    .sort((a, b) => a - b)
    .map((ts) => {
      let total = 0;
      for (const pos of active) {
        const qty = Number(pos.quantity);
        const history = historiesMap.get(pos.asset_ticker) ?? [];
        let price = 0;
        for (const point of history) {
          if (new Date(point.timestamp).getTime() <= ts) {
            price = Number(point.price);
          } else {
            break;
          }
        }
        total += qty * price;
      }
      return { ts, value: total };
    });
}

function formatXAxisTick(ts: number, period: PortfolioPeriod, numLocale: string): string {
  const date = new Date(ts);
  switch (period) {
    case '1D':
      return date.toLocaleTimeString(numLocale, { hour: '2-digit', minute: '2-digit' });
    case '1W':
    case '1M':
      return date.toLocaleDateString(numLocale, { day: 'numeric', month: 'short' });
    case '1Y':
    case 'ALL':
    default:
      return date.toLocaleDateString(numLocale, { month: 'short', year: '2-digit' });
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
  numLocale: string;
  tooltipLabel: string;
  period: PortfolioPeriod;
}

function CustomTooltip({ active, payload, label, numLocale, tooltipLabel, period }: CustomTooltipProps) {
  if (!active || !payload?.length || label == null) return null;

  const value = payload[0].value;
  const date = new Date(label);

  const dateStr =
    period === '1D'
      ? date.toLocaleTimeString(numLocale, { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString(numLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  const formatted = new Intl.NumberFormat(numLocale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="chart__tooltip">
      <div className="chart__tooltipDate">{dateStr}</div>
      <div className="chart__tooltipRow">
        <span className="chart__tooltipLabel">{tooltipLabel}</span>
        <span className="chart__tooltipValue">{formatted}</span>
      </div>
    </div>
  );
}

export default function PortfolioChartCard({
  title,
  portfolioId,
  positions,
  historiesByTicker,
  historiesLoading,
  selectedPeriod,
  periodLabel,
  periods,
  onPeriodChange,
  locale,
  noDataText,
  emptyText,
  tooltipLabel,
}: PortfolioChartCardProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const numLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    if (!portfolioId) {
      setData([]);
      return;
    }

    const active = positions.filter((p) => Number(p.quantity) > 0);
    if (active.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(historiesLoading);

    const load = async () => {
      try {
        const historiesMap = new Map<string, PriceHistoryPoint[]>(
          Object.entries(historiesByTicker),
        );

        const periodStart = getPeriodStart(selectedPeriod);
        const chartData = buildChartData(active, historiesMap, periodStart);

        if (!cancelled) setData(chartData);
      } catch {
        // Empty and error states are handled by the card state UI.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [historiesByTicker, historiesLoading, portfolioId, positions, selectedPeriod]);

  // Add a small padding to keep min/max values away from chart bounds.
  const minValue = data.length ? Math.min(...data.map((d) => d.value)) : 0;
  const maxValue = data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const padding = (maxValue - minValue) * 0.08 || maxValue * 0.05 || 10;
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding];

  // Color the curve based on net variation over the selected period.
  const firstValue = data[0]?.value ?? 0;
  const lastValue = data[data.length - 1]?.value ?? 0;
  const isPositive = lastValue >= firstValue;
  const strokeColor = isPositive ? '#00a67f' : '#c0392b';
  const gradientId = isPositive ? 'chartGradientGreen' : 'chartGradientRed';
  const gradientColor = isPositive ? '#00a67f' : '#c0392b';

  const yTickFormatter = (value: number) =>
    new Intl.NumberFormat(numLocale, {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <section className="dashboard-card charts">
      <h2 className="dashboard-card__title">{title}</h2>

      <div className="charts__body">
        {!portfolioId && (
          <div className="charts__state">
            <span>{emptyText}</span>
          </div>
        )}

        {portfolioId && data.length === 0 && !isLoading && (
          <div className="charts__state">
            <span>{noDataText}</span>
          </div>
        )}

        {portfolioId && (data.length > 0 || isLoading) && (
          <div
            style={{
              width: '100%',
              opacity: isLoading ? 0.4 : 1,
              transition: 'opacity 0.2s ease',
              pointerEvents: isLoading ? 'none' : 'auto',
              minHeight: 280,
            }}
          >
            {data.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientColor} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="ts"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => formatXAxisTick(ts, selectedPeriod, numLocale)}
                tickCount={6}
                tick={{ fontSize: 12, fill: '#888', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={yTickFormatter}
                tick={{ fontSize: 12, fill: '#888', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    numLocale={numLocale}
                    tooltipLabel={tooltipLabel}
                    period={selectedPeriod}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, fill: strokeColor, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={320}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {portfolioId && (
        <div className="portfolio__periodRow" style={{ marginTop: '0.9rem' }}>
          <span className="portfolio__periodLabel">{periodLabel}</span>
          <div className="portfolio__periodButtons" role="tablist" aria-label={periodLabel}>
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                className={`portfolio__periodButton ${selectedPeriod === period ? 'is-active' : ''}`}
                onClick={() => onPeriodChange(period)}
                role="tab"
                aria-selected={selectedPeriod === period}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
