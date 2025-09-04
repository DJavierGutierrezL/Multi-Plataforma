
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.94 18.06 12 21l2.06-2.94" />
    <path d="m18.06 14.06 2.94-2.06-2.94-2.06" />
    <path d="M9.94 5.94 12 3l2.06 2.94" />
    <path d="m5.94 9.94-2.94 2.06 2.94 2.06" />
    <path d="M12 6V3" />
    <path d="M12 21v-3" />
    <path d="M18 12h3" />
    <path d="M3 12h3" />
  </svg>
);
