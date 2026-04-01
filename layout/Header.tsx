'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/') {
      return 'Generador de Certificados';
    }

    if (pathname === '/authors') {
      return 'Gestión de Autores';
    }

    if (pathname === '/authors/new') {
      return 'Nuevo Autor';
    }

    if (pathname.startsWith('/authors/')) {
      return 'Editar Autor';
    }

    if (pathname === '/departments') {
      return 'Departamentos';
    }

    return 'Sistema de Certificados';
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
