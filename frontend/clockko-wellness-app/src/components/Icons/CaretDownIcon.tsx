import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

const CaretDownIcon: React.FC<IconProps> = ({ size = 24, color = '#999A9C', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5301 10.4697C16.3895 10.3292 16.1988 10.2503 16.0001 10.2503C15.8013 10.2503 15.6107 10.3292 15.4701 10.4697L12.0001 13.9397L8.53009 10.4697C8.38792 10.3372 8.19987 10.2651 8.00557 10.2685C7.81127 10.2719 7.62588 10.3506 7.48847 10.4881C7.35106 10.6255 7.27234 10.8109 7.26892 11.0052C7.26549 11.1995 7.33761 11.3875 7.47009 11.5297L11.4701 15.5297C11.6107 15.6701 11.8013 15.749 12.0001 15.749C12.1988 15.749 12.3895 15.6701 12.5301 15.5297L16.5301 11.5297C16.6705 11.3891 16.7494 11.1984 16.7494 10.9997C16.7494 10.8009 16.6705 10.6103 16.5301 10.4697Z"
        fill={color}
      />
    </svg>
  )
}

export default CaretDownIcon
