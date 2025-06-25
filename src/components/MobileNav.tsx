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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle, onClose }) => {
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
    onClose();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 z-50 flex items-center justify-between px-4 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary-900">StoreFlow</h1>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className="btn-mobile p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />

      {/* Mobile Sidebar */}
      <div 
        className={`lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-white border-r border-secondary-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } safe-area-bottom scroll-smooth-mobile`}
      >
        {/* Navigation */}
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          <div className="space-y-2 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.id === 'dashboard');
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left mobile-tap ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-secondary-500'
                    }`} 
                  />
                  <span className="font-medium text-responsive-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="mt-auto pt-4 border-t border-secondary-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 mb-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
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
              className="w-full justify-start gap-2 text-secondary-600 hover:text-secondary-900 mobile-tap"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileNav; 