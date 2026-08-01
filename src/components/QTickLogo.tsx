import React from 'react';

interface QTickLogoProps {
  variant?: 'full' | 'icon' | 'favicon';
  theme?: 'light' | 'dark' | 'high-contrast' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const QTickLogo: React.FC<QTickLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  // Size mappings
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  // Color mappings based on theme
  let iconBgClass = 'bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20';
  let textColorClass = 'text-slate-900 dark:text-white';
  let tickColorClass = 'text-cyan-300';
  let ringColorClass = 'stroke-cyan-400';

  if (theme === 'light') {
    iconBgClass = 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm';
    textColorClass = 'text-slate-900';
    tickColorClass = 'text-cyan-200';
    ringColorClass = 'stroke-cyan-300';
  } else if (theme === 'dark') {
    iconBgClass = 'bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-blue-500/30';
    textColorClass = 'text-white';
    tickColorClass = 'text-slate-950';
    ringColorClass = 'stroke-cyan-300';
  } else if (theme === 'high-contrast') {
    iconBgClass = 'bg-slate-950 text-white border-2 border-white shadow-none';
    textColorClass = 'text-white';
    tickColorClass = 'text-cyan-400';
    ringColorClass = 'stroke-cyan-400';
  }

  // Icon SVG rendering - modern rounded 'Q' combined with a clock tick / checkmark
  const renderIcon = () => (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl ${iconSizes[size]} ${iconBgClass} p-1.5 transition-all duration-300`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Q Outer Ring / Timer Gauge */}
        <circle
          cx="20"
          cy="19"
          r="13"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeDasharray="70 12"
          strokeLinecap="round"
          className="opacity-90"
        />
        {/* Q Tail / Timer Pointer */}
        <path
          d="M27 26L33 32"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Checkmark inside Q (Tick) */}
        <path
          d="M14.5 19L18.5 23L25.5 15"
          stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === 'icon' || variant === 'favicon') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderIcon()}
      <div className="flex flex-col leading-tight">
        <div className={`tracking-tight flex items-center ${textSizes[size]} ${textColorClass}`}>
          <span>Q</span>
          <span className="text-blue-600 dark:text-cyan-400">Tick</span>
          <span className="text-indigo-600 dark:text-cyan-300 ml-0.5 font-black">X</span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-normal">
            Practice smarter. Track every second.
          </span>
        )}
      </div>
    </div>
  );
};
