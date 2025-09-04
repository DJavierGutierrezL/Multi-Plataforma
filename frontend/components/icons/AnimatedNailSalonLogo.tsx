import React from 'react';

interface AnimatedNailSalonLogoProps {
  className?: string;
}

export const AnimatedNailSalonLogo: React.FC<AnimatedNailSalonLogoProps> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <style>{`
          .salon-logo-wrapper { 
            position: relative; 
            width: 3.5em; height: 3.5em; /* Use em for scaling with font-size */
            cursor: pointer;
          }
          .salon-logo-wrapper .sq { 
            width: 1.5em; 
            height: 1.5em; 
            background: currentColor; 
            position: absolute; 
            left: 1em; 
            top: 1em; 
          }
          .salon-logo-wrapper .s1, .salon-logo-wrapper .s2, .salon-logo-wrapper .s3, .salon-logo-wrapper .s4 { 
            position: absolute; 
            transition: all 1s ease-in-out; 
            display: inline-block;
          }
          .salon-logo-wrapper .s1 { border-left: 0.75em solid transparent; border-right: 0.75em solid transparent; border-bottom: 1.25em solid currentColor; left: 1em; transform: translateY(-0.25em); transform-origin: 50% 100%; top: 0; }
          .salon-logo-wrapper .s2 { border-left: 0.75em solid transparent; border-right: 0.75em solid transparent; border-top: 1.25em solid currentColor; bottom: 0; transform: translateY(0.25em); transform-origin: 50% 0; left: 1em; }
          .salon-logo-wrapper .s3 { border-left: 0 solid transparent; border-right: 1.25em solid currentColor; border-top: 0.75em solid transparent; border-bottom: 0.75em solid transparent; left: 0; top: 1em; transform: translateX(-0.25em); transform-origin: 100% 50%; }
          .salon-logo-wrapper .s4 { border-left: 1.25em solid currentColor; border-right: 0 solid transparent; border-top: 0.75em solid transparent; border-bottom: 0.75em solid transparent; right: 0; top: 1em; transform: translateX(0.25em); transform-origin: 0 50%; }
          .salon-logo-wrapper .perspective { 
            transform-style: preserve-3d; 
            perspective: 20em;  /* Use em */
            position: absolute; 
            left: 0; 
            top: 0;
            width: 100%; 
            height: 100%; 
            transform-origin: center; 
            transform: rotateX(0deg); 
            transition: all 1s ease-in-out; 
          }
          .salon-logo-wrapper:hover .perspective { transform: rotateX(60deg) rotate(45deg); }
          .salon-logo-wrapper:hover .perspective .s1 { transform: translateY(0) rotateX(-126.87deg); }
          .salon-logo-wrapper:hover .perspective .s2 { transform: translateY(0) rotateX(126.87deg); }
          .salon-logo-wrapper:hover .perspective .s3 { transform: translateX(0) rotateY(126.87deg); }
          .salon-logo-wrapper:hover .perspective .s4 { transform: translateX(0) rotateY(-126.87deg); }
        `}</style>
        <div className="salon-logo-wrapper text-primary">
            <div className="perspective">
                <div className="s1"></div>
                <div className="s2"></div>
                <div className="s3"></div>
                <div className="s4"></div>
                <div className="sq"></div>
            </div>
        </div>
    </div>
  );
};