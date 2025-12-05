import React from 'react'

export function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M2.875 6.375V9.125H5.625M6.375 2.875H9.125V5.625"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

