import { useMemo, useState } from 'react';
import type { PositionResponse } from '../../../api/portfolio';
import NeonButton from '../../../components/NeonButton';

interface AccountActionsCardProps {
  title: string;
  positions: PositionResponse[];
  isLoading: boolean;
  loadingText: string;
  emptyText: string;
  triggerLabel: string;
  quantityLabel: string;
  valueLabel: string;
  addTransactionLabel: string;
  addAssetLabel: string;
  onAddTransaction: () => void;
  onAddAsset: () => void;
  locale: string;
}

export default function AccountActionsCard({
  title,
  positions,
  isLoading,
  loadingText,
  emptyText,
  triggerLabel,
  quantityLabel,
  valueLabel,
  addTransactionLabel,
  addAssetLabel,
  onAddTransaction,
  onAddAsset,
  locale,
}: AccountActionsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const formatCurrency = useMemo(
    () =>
      (value: number) =>
        new Intl.NumberFormat(numberLocale, {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 2,
        }).format(value),
    [numberLocale],
  );

  const formatQuantity = useMemo(
    () =>
      (value: string) =>
        new Intl.NumberFormat(numberLocale, {
          maximumFractionDigits: 4,
        }).format(Number(value) || 0),
    [numberLocale],
  );

  const activePositions = useMemo(
    () => positions.filter((position) => Number(position.quantity) > 0),
    [positions],
  );

  return (
    <section className="dashboard-card account-actions">
      <div className="account-actions__header">
        <h2 className="dashboard-card__title">{title}</h2>
        <span className="account-actions__badge">{activePositions.length}</span>
      </div>

      <div className="account-actions__content">
        <button
          type="button"
          className={`account-actions__trigger ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <span>{triggerLabel}</span>
          <span className="account-actions__triggerChevron">▾</span>
        </button>

        {isOpen && (
          <div className="account-actions__list">
            {isLoading ? (
              <p className="account-actions__empty">{loadingText}</p>
            ) : activePositions.length === 0 ? (
              <p className="account-actions__empty">{emptyText}</p>
            ) : (
              activePositions.map((position) => {
                const value = (Number(position.quantity) || 0) * (Number(position.current_price) || 0);

                return (
                  <article key={position.id} className="account-actions__item">
                    <div className="account-actions__itemTop">
                      <div>
                        <div className="account-actions__itemName">{position.asset_name}</div>
                        <div className="account-actions__itemTicker">{position.asset_ticker}</div>
                      </div>
                      <div className="account-actions__itemValue">{formatCurrency(value)}</div>
                    </div>
                    <div className="account-actions__itemMeta">
                      <span>
                        {quantityLabel}: {formatQuantity(position.quantity)}
                      </span>
                      <span>
                        {valueLabel}: {formatCurrency(Number(position.current_price) || 0)}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="account-actions__actions">
        <NeonButton
          label={addAssetLabel}
          onClick={onAddAsset}
          variant="solid"
          className="account-actions__btn"
          style={{ backgroundColor: '#bff104', color: '#000', padding: '0.68rem 1.1rem' }}
        />
        <NeonButton
          label={addTransactionLabel}
          onClick={onAddTransaction}
          variant="solid"
          className="account-actions__btn"
          style={{ backgroundColor: '#000', color: '#bff104', padding: '0.68rem 1.1rem' }}
        />
      </div>
    </section>
  );
}
