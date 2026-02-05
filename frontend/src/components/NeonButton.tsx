import { useMemo } from 'react';

export type NeonButtonVariant = 'outline' | 'solid';

export interface NeonButtonProps {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: NeonButtonVariant;
  style?: React.CSSProperties;
  title?: string;
  disableOutlineHover?: boolean;
  subtleHover?: boolean;
}

export default function NeonButton({
  label,
  onClick,
  disabled = false,
  variant = 'outline',
  style,
  title,
  disableOutlineHover = false,
  subtleHover = false,
}: NeonButtonProps) {
  const baseStyle = useMemo<React.CSSProperties>(() => {
    const common: React.CSSProperties = {
      padding: '1rem 1.2rem',
      borderRadius: '0.9rem',
      fontWeight: 800,
      fontSize: '1rem',
      lineHeight: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      transition: 'all 0.2s',
      userSelect: 'none',
      fontFamily: 'inherit',
    };

    if (variant === 'solid') {
      return {
        ...common,
        backgroundColor: '#000',
        color: '#bff104',
        border: 'none',
        boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
      };
    }

    // outline
    return {
      ...common,
      backgroundColor: 'transparent',
      color: '#bff104',
      border: '2px solid #bff104',
      boxShadow: 'none',
      fontSize: '0.9rem',
      padding: '0.6rem 1.2rem',
    };
  }, [disabled, variant]);

  const mergedStyle: React.CSSProperties = {
    ...baseStyle,
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      title={title}
      style={mergedStyle}
      onMouseOver={(e) => {
        if (disabled) return;
        if (variant !== 'outline') return;
        if (disableOutlineHover) {
          if (subtleHover) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.12)';
          }
          return;
        }
        e.currentTarget.style.backgroundColor = '#bff104';
        e.currentTarget.style.color = '#000';
      }}
      onMouseOut={(e) => {
        if (disabled) return;
        if (variant !== 'outline') return;
        if (disableOutlineHover) {
          if (subtleHover) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = mergedStyle.boxShadow as string || 'none';
          }
          return;
        }
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#bff104';
      }}
    >
      {label}
    </button>
  );
}
