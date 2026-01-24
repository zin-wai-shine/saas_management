export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-gray-200" style={{ backgroundColor: '#111828' }}>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex justify-end items-center">
          <p className="text-sm text-gray-600/60">
            © {new Date().getFullYear()} HAISO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

