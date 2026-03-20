'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    const routes: { [key: string]: string } = {
      '/': 'Inicio',
      '/generator': 'Generador',
    };
    return routes[pathname] || 'Sistema de Certificados';
  };

  return (
    <header className="px-6 pt-5 pb-6 bg-primary-500 border-b border-primary-600 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{getPageTitle()}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
