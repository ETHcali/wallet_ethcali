import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/* COMPONENTS.md — Button. Primary is the only filled one; secondary and outline
   are the same hairline-bordered control; destructive is the quiet red used for
   Sign out and Export key. Every size clears the 48px tap target except small,
   which is for inline, non-onchain actions only. */
const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-eth-blue text-on-brand hover:bg-eth-blue-lift active:bg-eth-blue-deep disabled:bg-surface-ridge disabled:text-content-faint',
  secondary:
    'border border-line-strong bg-transparent text-content-primary hover:border-line-brand hover:text-eth-blue-text',
  outline:
    'border border-line-strong bg-transparent text-content-primary hover:border-line-brand hover:text-eth-blue-text',
  destructive:
    'border border-signal-reverted/30 bg-signal-reverted/10 text-signal-reverted hover:bg-signal-reverted/20',
};

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  small: 'min-h-[36px] px-4 text-sm',
  medium: 'min-h-tap px-6 text-[15px]',
  large: 'min-h-[56px] px-8 text-base',
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-base disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
  >
    {children}
  </button>
);

export default Button;
