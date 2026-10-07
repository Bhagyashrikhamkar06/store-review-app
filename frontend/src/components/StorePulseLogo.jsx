import React from 'react';

const StorePulseLogo = ({ height = 36, variant = 'dark', showText = true }) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#010030' : '#FFFFFF';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {/* Authentic StorePulse Icon Mark */}
      <svg
        width={height * 1.02}
        height={height}
        viewBox="0 0 37 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M18.2449 0H36.4898V18.2449C36.4898 28.3155 28.3155 36.4898 18.2449 36.4898C8.1743 36.4898 0 28.3155 0 18.2449C0 8.17428 8.1743 0 18.2449 0Z"
          fill="#00E79E"
        />
        <path
          d="M27.7107 17.7132C27.7107 17.7132 25.053 17.6126 24.0761 14.5862C23.0992 11.5597 22.4288 9.77355 20.6761 9.67299C18.9282 9.57243 18.186 16.3005 15.964 16.8034C13.7421 17.3062 13.3398 13.5087 11.5249 12.733C9.71 11.9572 9.64296 17.7467 4.49512 18.0819C4.49512 18.0819 8.23029 17.9478 9.03479 20.6391C9.83929 23.3303 11.6255 24.039 12.6359 22.0182C13.6463 19.9974 15.6288 17.038 17.2426 20.3374C18.8564 23.632 20.5037 28.5117 22.7257 24.4078C24.9476 20.3039 25.3163 18.0149 31.9774 17.7132H27.7059H27.7107Z"
          fill="#010030"
        />
      </svg>

      {/* StorePulse Typography */}
      {showText && (
        <span
          style={{
            fontSize: height * 0.65,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontFamily: 'var(--font-family)'
          }}
        >
          StorePulse
        </span>
      )}
    </div>
  );
};

export default StorePulseLogo;
