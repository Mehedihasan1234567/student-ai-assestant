import React from 'react';

interface StudyMateLogoSimpleProps {
  className?: string;
  size?: number;
}

export const StudyMateLogoSimple: React.FC<StudyMateLogoSimpleProps> = ({ 
  className = "", 
  size = 36 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Modern Rounded Square Background */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="20"
        fill="url(#mainGradient)"
      />
      
      {/* Book Icon */}
      <g transform="translate(25, 30)">
        {/* Book Cover */}
        <rect
          x="0"
          y="0"
          width="30"
          height="20"
          rx="2"
          fill="white"
          fillOpacity="0.9"
        />
        
        {/* Book Spine */}
        <rect
          x="0"
          y="0"
          width="3"
          height="20"
          rx="1.5"
          fill="url(#accentGradient)"
        />
        
        {/* Text Lines */}
        <line x1="6" y1="6" x2="24" y2="6" stroke="url(#mainGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
        <line x1="6" y1="9" x2="20" y2="9" stroke="url(#mainGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
        <line x1="6" y1="12" x2="22" y2="12" stroke="url(#mainGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
        <line x1="6" y1="15" x2="18" y2="15" stroke="url(#mainGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
      </g>
      
      {/* AI Brain Symbol */}
      <g transform="translate(55, 35)">
        {/* Central Node */}
        <circle cx="8" cy="5" r="3" fill="url(#accentGradient)" />
        
        {/* Connected Nodes */}
        <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="14" cy="2" r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="14" cy="8" r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="2" cy="8" r="1.5" fill="white" fillOpacity="0.9" />
        
        {/* Connections */}
        <line x1="5.5" y1="3.5" x2="3.5" y2="2.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round"/>
        <line x1="10.5" y1="3.5" x2="12.5" y2="2.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round"/>
        <line x1="10.5" y1="6.5" x2="12.5" y2="7.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round"/>
        <line x1="5.5" y1="6.5" x2="3.5" y2="7.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round"/>
      </g>
      
      {/* Subtle Glow Effect */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="20"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
    </svg>
  );
};

export default StudyMateLogoSimple;