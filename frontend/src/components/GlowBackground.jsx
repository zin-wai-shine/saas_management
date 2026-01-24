export const GlowBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#111828' }} />
      
      {/* Energy Orbs - Subtle Glow Effects */}
      <div 
        className="absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(0,213,190,0.6) 0%, rgba(0,184,163,0.4) 20%, rgba(0,166,147,0.2) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'glowOrb1 20s ease-in-out infinite',
          boxShadow: '0 0 200px rgba(0,213,190,0.4), 0 0 400px rgba(0,184,163,0.2)'
        }}
      />
      <div 
        className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,255,0.5) 0%, rgba(0,213,190,0.3) 25%, rgba(0,184,163,0.2) 50%, transparent 75%)',
          filter: 'blur(70px)',
          animation: 'glowOrb2 25s ease-in-out infinite 5s',
          boxShadow: '0 0 180px rgba(0,213,190,0.3), 0 0 360px rgba(0,255,255,0.2)'
        }}
      />
      <div 
        className="absolute bottom-[20%] left-[20%] w-[550px] h-[550px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0,213,190,0.6) 0%, rgba(0,184,163,0.4) 20%, rgba(0,166,147,0.2) 40%, transparent 70%)',
          filter: 'blur(75px)',
          animation: 'glowOrb3 22s ease-in-out infinite 3s',
          boxShadow: '0 0 200px rgba(0,213,190,0.3), 0 0 400px rgba(0,184,163,0.2)'
        }}
      />
      <div 
        className="absolute bottom-[30%] right-[25%] w-[480px] h-[480px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0,184,163,0.5) 0%, rgba(0,213,190,0.3) 25%, rgba(0,166,147,0.2) 50%, transparent 75%)',
          filter: 'blur(65px)',
          animation: 'glowOrb4 18s ease-in-out infinite 7s',
          boxShadow: '0 0 180px rgba(0,184,163,0.3), 0 0 360px rgba(0,213,190,0.2)'
        }}
      />
      
      {/* Subtle Rings */}
      <div 
        className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-2 opacity-20"
        style={{
          borderColor: 'rgba(0,213,190,0.4)',
          animation: 'glowRing1 30s linear infinite',
          filter: 'blur(2px)'
        }}
      />
      <div 
        className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 opacity-15"
        style={{
          borderColor: 'rgba(0,184,163,0.4)',
          animation: 'glowRing2 35s linear infinite reverse',
          filter: 'blur(1.5px)'
        }}
      />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes glowOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.9); }
        }
        @keyframes glowOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.15); }
          66% { transform: translate(40px, -20px) scale(0.85); }
        }
        @keyframes glowOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.05); }
        }
        @keyframes glowOrb4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -25px) scale(1.08); }
        }
        @keyframes glowRing1 {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes glowRing2 {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

