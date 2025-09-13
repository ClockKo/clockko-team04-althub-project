import React from 'react'

export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 32,
  color = '#2563eb',
}) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.415, 31.415"
        transform="rotate(0 25 25)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
)
