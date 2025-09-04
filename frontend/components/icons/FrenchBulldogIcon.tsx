import React from 'react';

export const FrenchBulldogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <path d="M32,52 C18,52 14,42 18,32 C22,22 28,18 32,18 C36,18 42,22 46,32 C50,42 46,52 32,52 Z" />

    {/* Ears */}
    <path d="M24,24 C18,12 22,6 28,8 C34,10 30,22 30,22" />
    <path d="M40,24 C46,12 42,6 36,8 C30,10 34,22 34,22" />
    
    {/* Eyes */}
    <circle cx="27" cy="31" r="3" />
    <circle cx="37" cy="31" r="3" />
    
    {/* Nose */}
    <path d="M32,38 C30,38 29,39.5 29,40.5 C29,41.5 30.5,43 32,43 C33.5,43 35,41.5 35,40.5 C35,39.5 34,38 32,38 Z" />
    <path d="M30,40.5 C30.5,39.5 33.5,39.5 34,40.5" />
    
    {/* Wrinkles */}
    <path d="M29,26 C30,25 34,25 35,26" />
    
    {/* Mouth */}
    <path d="M32,43 v 3" />
  </svg>
);
