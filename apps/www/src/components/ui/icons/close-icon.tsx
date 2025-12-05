import React from 'react'

export function CloseIcon({ className }: { className?: string }) {
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
        d="M2.375 2.375L9.625 9.625M9.625 2.375L2.375 9.625"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

