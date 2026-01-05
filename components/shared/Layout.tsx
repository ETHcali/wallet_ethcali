import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
      {children}
    </main>
  );
};

export default Layout; 