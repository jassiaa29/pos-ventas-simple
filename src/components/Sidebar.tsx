import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Settings,
  BarChart3,
  CreditCard,
  Store,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, path: '/sales' },
    { id: 'inventory', label: 'Inventario', icon: Package, path: '/inventory' },
    { id: 'customers', label: 'Clientes', icon: Users, path: '/customers' },
    { id: 'suppliers', label: 'Proveedores', icon: Truck, path: '/suppliers' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, path: '/payments' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-secondary-200 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-secondary-200">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-secondary-900">StoreFlow</h1>
          <p className="text-xs text-secondary-500">Sistema POS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.id === 'dashboard');
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-primary-600' : 'text-secondary-500'
                }`} 
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 mb-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-secondary-500">Usuario</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-secondary-600 hover:text-secondary-900"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
