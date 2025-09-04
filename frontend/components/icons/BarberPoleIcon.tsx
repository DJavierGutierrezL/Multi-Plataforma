import React from 'react';

export const BarberPoleIcon: React.FC<{ className?: string }> = ({ className }) => {
  const keyframes = `
    @keyframes spin-stripes {
      from {
        background-position: 0 0;
      }
      to {
        background-position: 0 -40px; /* The height of one full pattern repeat (10px * 4) */
      }
    }
  `;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  };

  const capStyle: React.CSSProperties = {
    width: '60%', // Adjusted to match the thinner cylinder
    height: '12%',
    background: 'linear-gradient(180deg, #f0f0f0, #a0a0a0)',
    borderRadius: '50% / 100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    border: '1px solid #444',
  };

  const bottomCapStyle: React.CSSProperties = {
    ...capStyle,
    borderRadius: '50% / 100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  };

  const cylinderStyle: React.CSSProperties = {
    width: '50%', // Thinner to appear taller
    height: '76%',
    position: 'relative',
    background: `repeating-linear-gradient(
      -45deg,
      #d13438,
      #d13438 10px,
      #ffffff 10px,
      #ffffff 20px,
      #0078d4 20px,
      #0078d4 30px,
      #ffffff 30px,
      #ffffff 40px
    )`,
    backgroundSize: '100% 40px',
    animation: 'spin-stripes 4s linear infinite', // Slower animation
    borderLeft: '1px solid #444',
    borderRight: '1px solid #444',
    overflow: 'hidden',
  };
  
  const cylinderShineStyle: React.CSSProperties = {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.3), inset -5px 0 15px rgba(0,0,0,0.3)',
  };

  return (
    <div className={className}>
      <style>{keyframes}</style>
      <div style={containerStyle} className="w-full h-full">
        <div style={capStyle} />
        <div style={cylinderStyle}>
            <div style={cylinderShineStyle} />
        </div>
        <div style={bottomCapStyle} />
      </div>
    </div>
  );
};