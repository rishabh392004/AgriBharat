import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
  variant?: 'light' | 'dark' | 'auto'
}

export const KrishiDarphanLogo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 36,
  variant = 'auto',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector Emblem: Mirror ('Darpan') + Golden Ear of Wheat + Crop Leaf */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="lensRingGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5C518" />
            <stop offset="0.5" stopColor="#E8B84B" />
            <stop offset="1" stopColor="#C98F1E" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="0.6" stopColor="#2E5339" />
            <stop offset="1" stopColor="#1B3324" />
          </linearGradient>
          <radialGradient id="mirrorGlass" cx="50%" cy="50%" r="50%">
            <stop stopColor="#EAF8EE" stopOpacity="0.85" />
            <stop offset="0.75" stopColor="#DCEEDB" stopOpacity="0.45" />
            <stop offset="1" stopColor="#A9D18D" stopOpacity="0.25" />
          </radialGradient>
          <filter id="glowSubtle" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2E5339" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Circular Mirror Rim */}
        <circle cx="24" cy="24" r="21" stroke="url(#lensRingGrad)" strokeWidth="3" fill="url(#mirrorGlass)" filter="url(#glowSubtle)" />
        
        {/* Inner Diagnostic Optical Circle */}
        <circle cx="24" cy="24" r="16.5" stroke="#3F7D45" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.65" />

        {/* Stylized Crop Leaf (Left & Center) */}
        <path
          d="M15 31C15 21 21 15 31 15C31 25 25 31 15 31Z"
          fill="url(#leafGrad)"
        />
        {/* Leaf Central Vein */}
        <path d="M15 31C21 27 25 22 31 15" stroke="#FFF" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
        <path d="M20 25C22 25 24 23.5 25 22" stroke="#FFF" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.65" />
        <path d="M23 28C24.5 28 26.5 26.5 27 25.5" stroke="#FFF" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.65" />

        {/* Golden Wheat Grains (Right Stalk) */}
        <path d="M29 27C31.5 26 33 24 33 22C31 22 29.5 24 29 27Z" fill="#F5C518" stroke="#C98F1E" strokeWidth="0.6" />
        <path d="M31 22C33.5 20.8 35 18.5 35 16.5C33 16.5 31.5 18.5 31 22Z" fill="#F5C518" stroke="#C98F1E" strokeWidth="0.6" />
        <path d="M26 32C28 31 29 29.5 29 28C27.5 28 26.5 29.5 26 32Z" fill="#E8B84B" stroke="#C98F1E" strokeWidth="0.5" />

        {/* Diagnostic Optical Sparkle */}
        <path d="M34 11L35.2 13.8L38 15L35.2 16.2L34 19L32.8 16.2L30 15L32.8 13.8L34 11Z" fill="#F5C518" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight text-lg md:text-xl font-['Outfit'] ${
                variant === 'light'
                  ? 'text-white'
                  : variant === 'dark'
                  ? 'text-[#213026]'
                  : 'text-inherit'
              }`}
            >
              Krishi Darphan
            </span>
          </div>
          <span className="text-[10px] md:text-[11px] font-semibold tracking-wider font-['Noto_Sans_Devanagari'] text-[#C98F1E] dark:text-[#E8B84B]">
            कृषि दर्पण AI
          </span>
        </div>
      )}
    </div>
  )
}

export default KrishiDarphanLogo
