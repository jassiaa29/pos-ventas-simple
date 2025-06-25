
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import Sales from '../components/Sales';
import Inventory from '../components/Inventory';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Sales />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return (
          <div className="p-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-secondary-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Gestión de Clientes</h2>
              <p className="text-secondary-600">Módulo en desarrollo - Próximamente disponible</p>
            </div>
          </div>
        );
      case 'suppliers':
        return (
          <div className="p-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-secondary-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Gestión de Proveedores</h2>
              <p className="text-secondary-600">Módulo en desarrollo - Próximamente disponible</p>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="p-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-secondary-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Métodos de Pago</h2>
              <p className="text-secondary-600">Módulo en desarrollo - Próximamente disponible</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-secondary-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Configuración</h2>
              <p className="text-secondary-600">Módulo en desarrollo - Próximamente disponible</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 ml-64 min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
