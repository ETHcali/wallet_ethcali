import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-8 pt-5 md:px-6 md:py-8">
      {children}
    </main>
  );
};

export default Layout; 