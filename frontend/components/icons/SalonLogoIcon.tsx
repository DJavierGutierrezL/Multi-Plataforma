import React from 'react';

export const SalonLogoIcon: React.FC<{ salonName: string; className?: string }> = ({ salonName, className }) => {
    // Keyframes for the border animation
    const keyframes = `
        @keyframes tipsy {
            0% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
            100% { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
        }
    `;

    // Responsive font size mapping from container class
    const sizeMap: Record<string, string> = {
        'w-8': '10px',  'h-8': '10px',
        'w-12': '14px', 'h-12': '14px',
    };
    let baseFontSize = '14px'; // Default size
    const classList = className?.split(' ') || [];
    for (const cls of classList) {
        if (sizeMap[cls]) {
            baseFontSize = sizeMap[cls];
            break;
        }
    }

    // Common styles for the animated border elements, derived from the user's CSS.
    // Using 'em' units makes them scale with the font size.
    const commonBorderStyle: React.CSSProperties = {
        content: '""',
        padding: '0.9em 0.4em',
        position: 'absolute',
        left: '50%',
        width: '100%',
        top: '50%',
        display: 'block',
        borderWidth: '0.1875em', // Ratio from example: 15px / 80px font-size
        borderStyle: 'solid',
        transform: 'translateX(-50%) translateY(-50%) rotate(0deg)',
        animation: '10s infinite alternate ease-in-out tipsy',
    };

    // More faithful text shadow, adapted for light/dark themes.
    const themeStyles = `
        .logo-text-wrapper {
            /* For light theme (dark text) */
            text-shadow: 0 0.25em 0.3125em rgba(46, 46, 49, 0.2), 0 0.5em 0.75em rgba(46, 46, 49, 0.15);
        }
        .dark .logo-text-wrapper {
            /* For dark theme (light text) */
            text-shadow: 0 0.25em 0.3125em rgba(0, 0, 0, 0.5), 0 0.5em 0.75em rgba(0, 0, 0, 0.4);
        }
    `;
    
    return (
        // The main container
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Inject styles into the component */}
            <style>{keyframes}{themeStyles}</style>
            
            {/* Wrapper for the text and its shadows */}
            <div
                className="logo-text-wrapper relative font-bold text-gray-800 dark:text-gray-100 text-center"
                style={{
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    fontSize: baseFontSize,
                }}
            >
                {/* The salon name text */}
                <span className="relative block" style={{ zIndex: 2 }}>{salonName}</span>
                
                {/* Element for the top border animation (simulates :before) */}
                <div
                    style={{
                        ...commonBorderStyle,
                        borderColor: '#d9524a #d9524a transparent transparent',
                        // Placed behind the text, matching the original CSS's z-index: -1 logic
                        zIndex: 1, 
                    }}
                />
                
                {/* Element for the bottom border animation (simulates :after) */}
                <div
                    style={{
                        ...commonBorderStyle,
                        borderColor: 'transparent transparent #d9524a #d9524a',
                        // Shadow from example CSS, scaled with 'em' units
                        boxShadow: '0.3125em 0.3125em 0.3125em rgba(46, 46, 49, .8)',
                        // Placed on top
                        zIndex: 3, 
                    }}
                />
            </div>
        </div>
    );
};
