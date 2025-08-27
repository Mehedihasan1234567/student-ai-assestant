import React from 'react';

interface StudyMateLogoProps {
  className?: string;
  size?: number;
}

export const StudyMateLogo: React.FC<StudyMateLogoProps> = ({ 
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
      {/* Background Circle with Gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Main Background Circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#bgGradient)"
        filter="url(#shadow)"
      />
      
      {/* Inner Circle for Depth */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      
      {/* Book Base */}
      <rect
        x="25"
        y="35"
        width="35"
        height="25"
        rx="2"
        fill="url(#bookGradient)"
        stroke="rgba(139,92,246,0.3)"
        strokeWidth="1"
      />
      
      {/* Book Pages */}
      <rect
        x="27"
        y="37"
        width="31"
        height="21"
        rx="1"
        fill="rgba(139,92,246,0.1)"
      />
      
      {/* Book Spine */}
      <rect
        x="25"
        y="35"
        width="4"
        height="25"
        rx="2"
        fill="rgba(139,92,246,0.8)"
      />
      
      {/* Book Lines (Text) */}
      <line x1="32" y1="42" x2="52" y2="42" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="46" x2="48" y2="46" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="50" x2="50" y2="50" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="54" x2="45" y2="54" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* AI Brain/Circuit Pattern */}
      <g transform="translate(55, 25)">
        {/* Central AI Node */}
        <circle cx="10" cy="10" r="4" fill="url(#aiGradient)" />
        
        {/* Neural Network Connections */}
        <line x1="6" y1="7" x2="2" y2="3" stroke="url(#aiGradient)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="7" x2="18" y2="3" stroke="url(#aiGradient)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="13" x2="18" y2="17" stroke="url(#aiGradient)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="13" x2="2" y2="17" stroke="url(#aiGradient)" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Outer AI Nodes */}
        <circle cx="2" cy="3" r="2" fill="url(#aiGradient)" />
        <circle cx="18" cy="3" r="2" fill="url(#aiGradient)" />
        <circle cx="18" cy="17" r="2" fill="url(#aiGradient)" />
        <circle cx="2" cy="17" r="2" fill="url(#aiGradient)" />
        
        {/* Pulsing Effect */}
        <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="1">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Sparkle Effects */}
      <g opacity="0.8">
        <circle cx="20" cy="25" r="1.5" fill="#FBBF24">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="70" r="1" fill="#F59E0B">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="80" cy="30" r="1.2" fill="#EAB308">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Subtle Highlight */}
      <ellipse
        cx="40"
        cy="35"
        rx="15"
        ry="8"
        fill="rgba(255,255,255,0.2)"
        transform="rotate(-15 40 35)"
      />
    </svg>
  );
};

export default StudyMateLogo;