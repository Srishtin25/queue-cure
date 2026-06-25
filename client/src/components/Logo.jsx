import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Q Circle */}
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" className="opacity-20" />
    <path 
      d="M85 85L70 70" 
      stroke="currentColor" 
      strokeWidth="10" 
      strokeLinecap="round" 
    />
    
    {/* Inner Medical Cross */}
    <rect x="42" y="25" width="16" height="50" rx="4" fill="currentColor" />
    <rect x="25" y="42" width="50" height="16" rx="4" fill="currentColor" />
    
    {/* Heartbeat pulse line through the circle */}
    <path 
      d="M20 50H30L35 40L45 60L50 50H80" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="opacity-40"
    />
  </svg>
);

export default Logo;
