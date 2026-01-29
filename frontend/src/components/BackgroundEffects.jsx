export const BackgroundEffects = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Curved Edge Gradient (Teal) - Concentrated along bottom and right edges to create a "corner curve" */}
            <div
                className="absolute inset-x-0 bottom-0 h-full opacity-[0.25] pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 80% at 100% 100%, #00BBA7 0%, transparent 70%),
                        linear-gradient(to top, rgba(0, 187, 167, 0.05) 0%, transparent 20%),
                        linear-gradient(to left, rgba(0, 187, 167, 0.05) 0%, transparent 20%)
                    `,
                }}
            />

            {/* Perspective Grid - Subtle base grid exactly matching the reference image's density */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[250px] opacity-[0.15]"
                style={{
                    backgroundImage: `linear-gradient(#00BBA7 1px, transparent 1px), linear-gradient(90deg, #00BBA7 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                    transform: 'perspective(1000px) rotateX(65deg)',
                    transformOrigin: 'bottom',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                }}
            />
        </div>
    );
};
