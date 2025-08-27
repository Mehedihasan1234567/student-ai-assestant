import React from 'react';

interface StudyMateFaviconProps {
  className?: string;
  size?: number;
}

export const StudyMateFavicon: React.FC<StudyMateFaviconProps> = ({ 
  className = "", 
  size = 32 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect
        width="32"
        height="32"
        rx="8"
        fill="url(#faviconGradient)"
      />
      
      {/* Book */}
      <rect
        x="8"
        y="12"
        width="12"
        height="8"
        rx="1"
        fill="white"
        fillOpacity="0.9"
      />
      
      {/* Book Spine */}
      <rect
        x="8"
        y="12"
        width="2"
        height="8"
        rx="1"
        fill="#10B981"
      />
      
      {/* AI Symbol */}
      <circle cx="22" cy="14" r="2" fill="#10B981" />
      <circle cx="19" cy="12" r="1" fill="white" fillOpacity="0.8" />
      <circle cx="25" cy="12" r="1" fill="white" fillOpacity="0.8" />
      <circle cx="25" cy="16" r="1" fill="white" fillOpacity="0.8" />
      <circle cx="19" cy="16" r="1" fill="white" fillOpacity="0.8" />
      
      {/* Connections */}
      <line x1="20.5" y1="13" x2="19.5" y2="12.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.8"/>
      <line x1="23.5" y1="13" x2="24.5" y2="12.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.8"/>
      <line x1="23.5" y1="15" x2="24.5" y2="15.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.8"/>
      <line x1="20.5" y1="15" x2="19.5" y2="15.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.8"/>
    </svg>
  );
};

export default StudyMateFavicon;