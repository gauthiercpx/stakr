import { useMemo, useState } from 'react';

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
  blurOnClick?: boolean;
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
  blurOnClick = false,
}: NeonButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const isOutline = variant === 'outline';
  const isSolid = variant === 'solid';
  const shouldApplyOutlineActive =
    !disabled && isOutline && !disableOutlineHover && (isHovered || isFocused);

  const isSubtleActive =
    !disabled && isOutline && disableOutlineHover && subtleHover && (isHovered || isFocused);

  const shouldApplySolidActive = !disabled && isSolid && (isHovered || isFocused);

  const interactionStyle = useMemo<React.CSSProperties>(() => {
    if (shouldApplyOutlineActive) {
      return {
        backgroundColor: '#bff104',
        color: '#000',
        outline: '3px solid rgba(191,241,4,0.55)',
        outlineOffset: '3px',
      };
    }

    if (isSubtleActive) {
      return {
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
        outline: '3px solid rgba(191,241,4,0.35)',
        outlineOffset: '3px',
      };
    }

    if (shouldApplySolidActive) {
      return {
        transform: 'translateY(-1px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.28)',
        outline: '3px solid rgba(191,241,4,0.55)',
        outlineOffset: '3px',
        filter: 'brightness(1.02)',
      };
    }

    return {
      outline: 'none',
      outlineOffset: '0',
      transform: 'none',
    };
  }, [isSubtleActive, shouldApplyOutlineActive, shouldApplySolidActive]);

  const mergedStyle: React.CSSProperties = {
    ...baseStyle,
    ...interactionStyle,
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={
        disabled
          ? undefined
          : (e) => {
              onClick?.();
              if (blurOnClick) {
                (e.currentTarget as HTMLButtonElement).blur();
              }
            }
      }
      title={title}
      style={mergedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {label}
    </button>
  );
}
