import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  // Define spinner sizes
  const spinnerSizes = {
    small: 20,
    medium: 30,
    large: 40
  };
  
  const spinnerSize = spinnerSizes[size];
  
  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div 
        className="loading-spinner"
        style={{ 
          width: `${spinnerSize}px`, 
          height: `${spinnerSize}px` 
        }}
      />
      {text && <p className="loading-text">{text}</p>}
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        /* The app is dark-only, but --bg-primary is #ffffff unless the OS asks
           for dark. A light-mode visitor got a full-screen white flash before
           every page settled. Painted explicitly to match the page ground
           (bg-gray-950), and dvh so the overlay does not run under the iOS
           address bar. */
        .fullscreen {
          height: 100vh;
          height: 100dvh;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          background-color: #030712;
          z-index: 1000;
        }
        
        .loading-spinner {
          border: 4px solid var(--card-border);
          border-left: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        /* Same reason as .fullscreen: --text-secondary is #666666 in light
           mode, which is near-invisible on the dark ground. */
        .loading-text {
          color: #94a3b8;
          font-size: ${size === 'small' ? '0.85rem' : size === 'large' ? '1.2rem' : '1rem'};
          margin: 0;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading; 