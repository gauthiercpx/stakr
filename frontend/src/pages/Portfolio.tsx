import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NeonButton from '../components/NeonButton';
import {
  getPortfolioPositions,
  getPortfolioSummary,
  type PositionResponse,
  type PortfolioSummary,
} from '../api/portfolio';
import { useI18n } from '../i18n/useI18n';
import './portfolio/portfolio.css';

interface PortfolioPageProps {
  onSessionInvalid: () => void;
}

export default function PortfolioPage({ onSessionInvalid }: PortfolioPageProps) {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { locale, t } = useI18n();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const formatCurrency = (value?: string | number) => {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  };

  const formatNumber = (value?: string) => {
    const amount = Number(value ?? '0');
    return new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 4 }).format(
      Number.isFinite(amount) ? amount : 0,
    );
  };

  useEffect(() => {
    if (!portfolioId) {
      navigate('/dashboard', { replace: true });
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryData, positionsData] = await Promise.all([
          getPortfolioSummary(portfolioId),
          getPortfolioPositions(portfolioId),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setPositions(positionsData);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) { onSessionInvalid(); return; }
        if (!cancelled) setError(t('dashboard.portfolio.error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [navigate, onSessionInvalid, portfolioId, t]);

  const title = useMemo(
    () => summary?.portfolio_name ?? t('portfolioPage.titleFallback'),
    [summary?.portfolio_name, t],
  );

  return (
    <main className="portfolio-page">
      <div className="portfolio-page__header">
        <h1 className="portfolio-page__title">{title}</h1>
        <NeonButton
          label={t('portfolioPage.backToDashboard')}
          onClick={() => navigate('/dashboard')}
          variant="solid"
          style={{ backgroundColor: '#000', color: '#bff104' }}
        />
      </div>

      {loading && <p className="portfolio-page__state">{t('common.loading')}</p>}
      {error && <p className="portfolio-page__state is-error">{error}</p>}

      {!loading && !error && summary && (
        <section className="portfolio-page__kpis">
          <article className="portfolio-page__kpiCard">
            <div className="portfolio-page__kpiLabel">{t('dashboard.portfolio.kpi.totalValue')}</div>
            <div className="portfolio-page__kpiValue">{formatCurrency(summary.total_value)}</div>
          </article>
          <article className="portfolio-page__kpiCard">
            <div className="portfolio-page__kpiLabel">{t('dashboard.portfolio.kpi.totalInvested')}</div>
            <div className="portfolio-page__kpiValue">{formatCurrency(summary.total_invested)}</div>
          </article>
          <article className="portfolio-page__kpiCard">
            <div className="portfolio-page__kpiLabel">{t('dashboard.portfolio.kpi.pnl')}</div>
            <div className={`portfolio-page__kpiValue ${Number(summary.global_pnl) >= 0 ? 'portfolio-page__pnlPositive' : 'portfolio-page__pnlNegative'}`}>
              {formatCurrency(summary.global_pnl)}{' '}
              <span style={{ fontSize: '0.85em', fontWeight: 700 }}>
                ({formatNumber(summary.global_pnl_percent)}%)
              </span>
            </div>
          </article>
          <article className="portfolio-page__kpiCard">
            <div className="portfolio-page__kpiLabel">{t('dashboard.portfolio.dividends')}</div>
            <div className="portfolio-page__kpiValue">{formatCurrency(summary.total_dividends_received)}</div>
          </article>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* Tableau — desktop */}
          <section className="portfolio-page__tableCard">
            <div className="portfolio-page__tableScroll">
              <table className="portfolio-page__table">
                <thead>
                  <tr>
                    <th>{t('portfolioPage.table.asset')}</th>
                    <th className="is-right">{t('portfolioPage.table.quantity')}</th>
                    <th className="is-right">{t('portfolioPage.table.avgPrice')}</th>
                    <th className="is-right">{t('portfolioPage.table.currentPrice')}</th>
                    <th className="is-right">{t('portfolioPage.table.value')}</th>
                    <th className="is-right">PnL</th>
                    <th className="is-right">{t('portfolioPage.table.dividends')}</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => {
                    const qty = Number(position.quantity);
                    const current = Number(position.current_price);
                    const avg = Number(position.average_buy_price);
                    const value = qty * current;
                    const pnl = qty * (current - avg);
                    const isPositive = pnl >= 0;

                    return (
                      <tr key={position.id}>
                        <td>
                          <div className="portfolio-page__assetName">{position.asset_name}</div>
                          <div className="portfolio-page__assetTicker">{position.asset_ticker}</div>
                        </td>
                        <td className="is-right">{formatNumber(position.quantity)}</td>
                        <td className="is-right">{formatCurrency(position.average_buy_price)}</td>
                        <td className="is-right">{formatCurrency(position.current_price)}</td>
                        <td className="is-right">{formatCurrency(value)}</td>
                        <td className={`is-right ${isPositive ? 'portfolio-page__pnlPositive' : 'portfolio-page__pnlNegative'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(pnl)}
                        </td>
                        <td className="is-right">{formatCurrency(position.dividends_received)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!positions.length && (
              <p className="portfolio-page__empty">{t('portfolioPage.empty')}</p>
            )}
          </section>

          {/* Cards — mobile */}
          <div className="portfolio-page__positionCards">
            {!positions.length && (
              <p className="portfolio-page__state">{t('portfolioPage.empty')}</p>
            )}
            {positions.map((position) => {
              const qty = Number(position.quantity);
              const current = Number(position.current_price);
              const avg = Number(position.average_buy_price);
              const value = qty * current;
              const pnl = qty * (current - avg);
              const isPositive = pnl >= 0;

              return (
                <article key={position.id} className="portfolio-page__positionCard">
                  <div className="portfolio-page__positionCardHeader">
                    <div className="portfolio-page__positionCardTitle">
                      <div className="portfolio-page__assetName">{position.asset_name}</div>
                      <div className="portfolio-page__assetTicker">{position.asset_ticker}</div>
                    </div>
                    <div className={`portfolio-page__positionCardPnl ${isPositive ? 'portfolio-page__pnlPositive' : 'portfolio-page__pnlNegative'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(pnl)}
                    </div>
                  </div>

                  <div className="portfolio-page__positionCardGrid">
                    <div className="portfolio-page__positionCardStat">
                      <div className="portfolio-page__positionCardStatLabel">{t('portfolioPage.table.quantity')}</div>
                      <div className="portfolio-page__positionCardStatValue">{formatNumber(position.quantity)}</div>
                    </div>
                    <div className="portfolio-page__positionCardStat">
                      <div className="portfolio-page__positionCardStatLabel">{t('portfolioPage.table.value')}</div>
                      <div className="portfolio-page__positionCardStatValue">{formatCurrency(value)}</div>
                    </div>
                    <div className="portfolio-page__positionCardStat">
                      <div className="portfolio-page__positionCardStatLabel">{t('portfolioPage.table.avgPrice')}</div>
                      <div className="portfolio-page__positionCardStatValue">{formatCurrency(position.average_buy_price)}</div>
                    </div>
                    <div className="portfolio-page__positionCardStat">
                      <div className="portfolio-page__positionCardStatLabel">{t('portfolioPage.table.currentPrice')}</div>
                      <div className="portfolio-page__positionCardStatValue">{formatCurrency(position.current_price)}</div>
                    </div>
                    <div className="portfolio-page__positionCardStat">
                      <div className="portfolio-page__positionCardStatLabel">{t('portfolioPage.table.dividends')}</div>
                      <div className="portfolio-page__positionCardStatValue">{formatCurrency(position.dividends_received)}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

