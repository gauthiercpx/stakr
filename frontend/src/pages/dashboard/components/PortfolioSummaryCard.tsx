import NeonButton from '../../../components/NeonButton';
import PortfolioSelect from './PortfolioSelect';

export type PortfolioPeriod = '1D' | '1W' | '1M' | '1Y' | 'ALL';

interface PortfolioKpi {
    title: string;
    value: string;
}

interface PortfolioOption {
    id: string;
    name: string;
}

interface PortfolioSummaryCardProps {
    title: string;
    totalValueLabel: string;
    totalValue: string;
    dividendsLabel: string;
    dividendsValue: string;
    pnlValue: string;
    pnlPercent: string;
    isPositivePnl: boolean;
    isPnlNeutral: boolean;
    hasPortfolio: boolean;
    isLoading: boolean;
    isPeriodPnlLoading: boolean;
    error: string;
    emptyText: string;
    loadingText: string;
    portfolios: PortfolioOption[];
    selectedPortfolioId: string | null;
    onPortfolioChange: (portfolioId: string) => void;
    periodLabel: string;
    selectedPeriod: PortfolioPeriod;
    periods: readonly PortfolioPeriod[];
    onPeriodChange: (period: PortfolioPeriod) => void;
    kpis: PortfolioKpi[];
    viewPortfolioLabel: string;
    onViewPortfolio: () => void;
    createPortfolioLabel: string;
    onCreatePortfolio: () => void;
}

export default function PortfolioSummaryCard({
                                                 title,
                                                 totalValueLabel,
                                                 totalValue,
                                                 dividendsLabel,
                                                 dividendsValue,
                                                 pnlValue,
                                                 pnlPercent,
                                                 isPositivePnl,
                                                 isPnlNeutral,
                                                 hasPortfolio,
                                                 isLoading,
                                                 isPeriodPnlLoading,
                                                 error,
                                                 emptyText,
                                                 loadingText,
                                                 portfolios,
                                                 selectedPortfolioId,
                                                 onPortfolioChange,
                                                 periodLabel,
                                                 selectedPeriod,
                                                 periods,
                                                 onPeriodChange,
                                                 kpis,
                                                 viewPortfolioLabel,
                                                 onViewPortfolio,
                                                 createPortfolioLabel,
                                                 onCreatePortfolio,
                                             }: PortfolioSummaryCardProps) {
    return (
        <section className="dashboard-card">
            <div className="portfolio__header">
                <h2 className="dashboard-card__title">{title}</h2>
                <div className="portfolio__headerActions">
                    {portfolios.length > 0 && (
                        <PortfolioSelect
                            options={portfolios}
                            value={selectedPortfolioId}
                            onChange={onPortfolioChange}
                        />
                    )}
                    <NeonButton
                        label={createPortfolioLabel}
                        onClick={onCreatePortfolio}
                        variant="solid"
                        className="portfolio__createButton"
                        style={{width: '100%', backgroundColor: '#000', color: '#bff104'}}
                    />
                </div>
            </div>

            {!hasPortfolio && !isLoading && <p className="portfolio__meta">{emptyText}</p>}
            {!hasPortfolio && isLoading && <p className="portfolio__meta">{loadingText}</p>}
            {error && <p className="portfolio__meta is-error">{error}</p>}

            {hasPortfolio && (
                <div
                    style={{
                        opacity: isLoading ? 0.45 : 1,
                        transition: 'opacity 0.2s ease',
                        pointerEvents: isLoading ? 'none' : 'auto',
                    }}
                >
                    <div className="portfolio__main">
                        <div className="portfolio__summaryTop">
                            <div className="portfolio__totalLabel">{totalValueLabel}</div>
                            <div className="portfolio__summaryWithPnl">
                                <div className="portfolio__totalValue">{totalValue}</div>
                                <div
                                    className={`portfolio__pnlPill ${isPnlNeutral ? 'is-neutral' : isPositivePnl ? 'is-positive' : 'is-negative'} ${isPeriodPnlLoading ? 'is-loading' : ''}`}>
                                    <span>{isPnlNeutral ? '•' : isPositivePnl ? '▲' : '▼'}</span>
                                    <span>{pnlValue}</span>
                                    <span>({pnlPercent})</span>
                                </div>
                            </div>
                            <div className="portfolio__dividendsLine">
                                <span className="portfolio__dividendsLabel">{dividendsLabel}</span>
                                <span className="portfolio__dividendsValue">{dividendsValue}</span>
                            </div>
                        </div>
                    </div>

                    <div className="portfolio__periodRow">
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

                    <div className="portfolio__kpis">
                        {kpis.map((kpi) => (
                            <article className="portfolio__kpiCard" key={kpi.title}>
                                <div className="portfolio__kpiLabel">{kpi.title}</div>
                                <div className="portfolio__kpiValue">{kpi.value}</div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {hasPortfolio && (
                <NeonButton
                    label={viewPortfolioLabel}
                    onClick={onViewPortfolio}
                    variant="solid"
                    style={{width: '100%', marginTop: '0.9rem', backgroundColor: '#000', color: '#bff104'}}
                />
            )}
        </section>
    );
}
  

