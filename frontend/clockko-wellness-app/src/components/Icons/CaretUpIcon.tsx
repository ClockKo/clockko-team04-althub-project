import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

const CaretUpIcon: React.FC<IconProps> = ({ size = 24, color = '#999A9C', ...props }) => {
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
        d="M16.5301 14.5303C16.3895 14.6708 16.1988 14.7497 16.0001 14.7497C15.8013 14.7497 15.6107 14.6708 15.4701 14.5303L12.0001 11.0603L8.53009 14.5303C8.38792 14.6628 8.19987 14.7349 8.00557 14.7315C7.81127 14.7281 7.62588 14.6494 7.48847 14.5119C7.35106 14.3745 7.27234 14.1891 7.26892 13.9948C7.26549 13.8005 7.33761 13.6125 7.47009 13.4703L11.4701 9.47032C11.6107 9.32987 11.8013 9.25098 12.0001 9.25098C12.1988 9.25098 12.3895 9.32987 12.5301 9.47032L16.5301 13.4703C16.6705 13.6109 16.7494 13.8016 16.7494 14.0003C16.7494 14.1991 16.6705 14.3897 16.5301 14.5303Z"
        fill={color}
      />
    </svg>
  )
}

export default CaretUpIcon
