import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const SPINNER_PX = { small: 20, medium: 28, large: 40 } as const;

/**
 * The brand spinner: a 2px ring in --eth-blue with a transparent top,
 * 0.9s linear. Full-screen paints --surface-void itself so a page never
 * flashes before the body background lands; dvh keeps it under the iOS bar.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text = 'Loading…',
  fullScreen = false,
}) => {
  const px = SPINNER_PX[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${
        fullScreen ? 'fixed inset-0 z-[1000] h-[100dvh] w-full bg-surface-void' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className="mb-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-eth-blue border-t-transparent"
        style={{ width: px, height: px }}
      />
      {text && (
        <p
          className={`m-0 text-content-muted ${
            size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
