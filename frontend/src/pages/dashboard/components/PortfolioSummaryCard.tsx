import NeonButton from '../../../components/NeonButton';
import FadeText from '../../../components/FadeText';
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
                <h2 className="dashboard-card__title"><FadeText>{title}</FadeText></h2>
                <div className={`portfolio__headerActions ${portfolios.length === 0 ? 'portfolio__headerActions--single' : ''}`}>
                    {portfolios.length > 0 && (
                        <PortfolioSelect
                            options={portfolios}
                            value={selectedPortfolioId}
                            onChange={onPortfolioChange}
                        />
                    )}
                    <NeonButton
                        label={<FadeText>{createPortfolioLabel}</FadeText>}
                        onClick={onCreatePortfolio}
                        variant="solid"
                        className="portfolio__createButton"
                        style={{width: '100%', backgroundColor: '#000', color: '#bff104'}}
                    />
                </div>
            </div>

            {!hasPortfolio && !isLoading && <p className="portfolio__meta"><FadeText>{emptyText}</FadeText></p>}
            {!hasPortfolio && isLoading && <p className="portfolio__meta"><FadeText>{loadingText}</FadeText></p>}
            {error && <p className="portfolio__meta is-error"><FadeText>{error}</FadeText></p>}

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
                            <div className="portfolio__totalLabel"><FadeText>{totalValueLabel}</FadeText></div>
                            <div className="portfolio__summaryWithPnl">
                                <div className="portfolio__totalValue"><FadeText>{totalValue}</FadeText></div>
                                <div
                                    className={`portfolio__pnlPill ${isPnlNeutral ? 'is-neutral' : isPositivePnl ? 'is-positive' : 'is-negative'} ${isPeriodPnlLoading ? 'is-loading' : ''}`}>
                                    <span>{isPnlNeutral ? '•' : isPositivePnl ? '▲' : '▼'}</span>
                                    <FadeText as="span">{pnlValue}</FadeText>
                                    <FadeText as="span">({pnlPercent})</FadeText>
                                </div>
                            </div>
                            <div className="portfolio__dividendsLine">
                                <span className="portfolio__dividendsLabel"><FadeText>{dividendsLabel}</FadeText></span>
                                <span className="portfolio__dividendsValue"><FadeText>{dividendsValue}</FadeText></span>
                            </div>
                        </div>
                    </div>

                    <div className="portfolio__periodRow">
                        <span className="portfolio__periodLabel"><FadeText>{periodLabel}</FadeText></span>
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
                                <div className="portfolio__kpiLabel"><FadeText>{kpi.title}</FadeText></div>
                                <div className="portfolio__kpiValue"><FadeText>{kpi.value}</FadeText></div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {hasPortfolio && (
                <NeonButton
                    label={<FadeText>{viewPortfolioLabel}</FadeText>}
                    onClick={onViewPortfolio}
                    variant="solid"
                    style={{width: '100%', marginTop: '0.9rem', backgroundColor: '#000', color: '#bff104'}}
                />
            )}
        </section>
    );
}
  

