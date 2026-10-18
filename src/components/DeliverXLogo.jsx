import React from 'react';

/**
 * 3D Isometric Box Icon matching the official DeliverX logo
 */
export const DeliverXBoxIcon = ({ size = 32, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="20 16 80 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
    aria-hidden="true"
  >
    <polygon points="25,40 60,60 60,100 25,80" fill="#1F5EFF" />
    <polygon points="60,60 95,40 95,80 60,100" fill="#1245C8" />
    <polygon points="60,20 95,40 60,60 25,40" fill="#6FA3FF" />
    <polygon points="47.75,27 82.75,47 72.25,53 37.25,33" fill="#FFFFFF" />
    <path
      d="M33.75 55 L51.25 85 M51.25 65 L33.75 75"
      stroke="#FFFFFF"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Complete DeliverX Logo (Icon + DeliverX Typography)
 * Supports 'white' (for dark backgrounds) or 'dark' (for light backgrounds)
 */
const DeliverXLogo = ({
  theme = 'white', // 'white' | 'dark'
  iconSize = 32,
  textSize = '20px',
  showIcon = true,
  className = '',
  style = {}
}) => {
  const deliverColor = theme === 'white' ? '#ffffff' : '#0b1f4d';

  return (
    <div
      className={`deliverx-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none',
        lineHeight: 1,
        ...style
      }}
    >
      {showIcon && <DeliverXBoxIcon size={iconSize} />}
      <span
        style={{
          fontSize: textSize,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          display: 'inline-flex',
          alignItems: 'center'
        }}
      >
        <span style={{ color: deliverColor }}>Deliver</span>
        <span style={{ color: '#1F5EFF' }}>X</span>
      </span>
    </div>
  );
};

export default DeliverXLogo;

/**
 * { color: '#1F5EFF' }
 */
