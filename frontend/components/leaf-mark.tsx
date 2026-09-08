import React from 'react'

interface LeafMarkProps {
  className?: string
  size?: number
}

export function LeafMark({ className = '', size }: LeafMarkProps) {
  const style = size ? { width: size, height: size } : undefined

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Main Emerald Foliage Gradient */}
        <linearGradient id="kdLeafPrimary" x1="16" y1="52" x2="48" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Secondary Supporting Leaf Gradient */}
        <linearGradient id="kdLeafSecondary" x1="12" y1="46" x2="36" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="65%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        {/* Golden Harvest & Neural Spine Gradient */}
        <linearGradient id="kdGoldSpine" x1="20" y1="48" x2="46" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>

        {/* Solar Flare / Optical Lens Gradient */}
        <radialGradient id="kdSunburst" cx="47" cy="17" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fde047" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        {/* Subtle Ambient Drop Shadow Filter */}
        <filter id="kdShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#062e1e" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#kdShadow)">
        {/* 1. Primary Sweeping Leaf Body */}
        <path
          d="M16 48C18 30 29 18 48 14C49 26 44 42 24 50C20 49 17 49 16 48Z"
          fill="url(#kdLeafPrimary)"
        />

        {/* 2. Secondary Harmonious Sprout Leaf (Left Wing) */}
        <path
          d="M14 44C13 33 19 24 30 20C29 27 25 38 17 43C15 44 14 44 14 44Z"
          fill="url(#kdLeafSecondary)"
          opacity="0.9"
        />

        {/* 3. Golden Optical Spine (Crop Vein + AI Circuit) */}
        <path
          d="M20 48C24 39 31 29 44 18"
          stroke="url(#kdGoldSpine)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* 4. Delicate Secondary Leaf Ribs */}
        <path
          d="M27 38C31 36 36 36 40 38"
          stroke="url(#kdGoldSpine)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M33 30C37 27 42 26 46 27"
          stroke="url(#kdGoldSpine)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* 5. Golden Wheat Kernel Bud at Base */}
        <ellipse
          cx="18"
          cy="48"
          rx="3.2"
          ry="4"
          transform="rotate(-25 18 48)"
          fill="url(#kdGoldSpine)"
        />

        {/* 6. "Darpan" Solar Lens / Diamond Flare (Top-Right Apex) */}
        <circle cx="47" cy="17" r="7.5" fill="url(#kdSunburst)" />
        
        {/* Diamond Star Highlight */}
        <path
          d="M47 11L48.5 15.5L53 17L48.5 18.5L47 23L45.5 18.5L41 17L45.5 15.5Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  )
}
