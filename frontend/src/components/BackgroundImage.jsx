import mainBackground from '../assets/main_background.png';

export const BackgroundImage = () => {
  return (
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${mainBackground})`,
        backgroundColor: '#0f172a'
      }}
    >
    </div>
  );
};

