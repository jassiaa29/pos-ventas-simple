
import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('7days');

  const { products, isLoading: loadingProducts } = useProducts();
  const { sales, isLoading: loadingSales } = useSales();
  const { customers, isLoading: loadingCustomers } = useCustomers();

  // Calcular estadísticas
  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProducts = sales.reduce((sum, sale) => 
    sum + (sale.sale_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
  );
  const totalTransactions = sales.length;
  const totalCustomers = customers.length;

  // Ventas recientes
  const recentTransactions = sales.slice(0, 5).map(sale => ({
    id: sale.id,
    customer: sale.customer?.name || 'Cliente General',
    amount: `$${sale.total_amount.toFixed(2)}`,
    time: new Date(sale.sale_date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: sale.status
  }));

  // Productos más vendidos
  const topProducts = React.useMemo(() => {
    const productSales = new Map();
    
    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        const productName = item.product?.name || 'Producto desconocido';
        if (productSales.has(productName)) {
          const existing = productSales.get(productName);
          productSales.set(productName, {
            sales: existing.sales + item.quantity,
            revenue: existing.revenue + item.subtotal
          });
        } else {
          productSales.set(productName, {
            sales: item.quantity,
            revenue: item.subtotal
          });
        }
      });
    });

    return Array.from(productSales.entries())
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: `$${data.revenue.toFixed(0)}`
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [sales]);

  const stats = [
    {
      title: 'Ventas Totales',
      value: `$${totalSales.toFixed(2)}`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Productos Vendidos',
      value: totalProducts.toString(),
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'primary'
    },
    {
      title: 'Transacciones',
      value: totalTransactions.toString(),
      change: '+15.3%',
      isPositive: true,
      icon: TrendingUp,
      color: 'accent'
    },
    {
      title: 'Clientes',
      value: totalCustomers.toString(),
      change: '+2.1%',
      isPositive: true,
      icon: Users,
      color: 'warning'
    }
  ];

  const isLoading = loadingProducts || loadingSales || loadingCustomers;

  if (isLoading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">Resumen de tu negocio</p>
        </div>
        
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none bg-white border border-secondary-200 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="custom">Personalizado</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-500 pointer-events-none" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-secondary-200 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'success' ? 'bg-success-50' :
                  stat.color === 'primary' ? 'bg-primary-50' :
                  stat.color === 'accent' ? 'bg-accent-50' :
                  'bg-warning-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'success' ? 'text-success-600' :
                    stat.color === 'primary' ? 'text-primary-600' :
                    stat.color === 'accent' ? 'text-accent-600' :
                    'text-warning-600'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.isPositive ? 'text-success-600' : 'text-destructive-600'
                }`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-secondary-900">{stat.value}</h3>
                <p className="text-secondary-600 text-sm mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">Transacciones Recientes</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
              Ver todas
            </button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500">No hay transacciones recientes</p>
              <p className="text-sm text-secondary-400 mt-1">Las ventas aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-secondary-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {transaction.customer.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{transaction.customer}</p>
                      <p className="text-sm text-secondary-500">{transaction.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">{transaction.amount}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-success-50 text-success-700' 
                        : 'bg-warning-50 text-warning-700'
                    }`}>
                      {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Productos Destacados</h2>
          
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500">No hay datos de ventas</p>
              <p className="text-sm text-secondary-400 mt-1">Los productos más vendidos aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{product.name}</p>
                    <p className="text-sm text-secondary-500">{product.sales} vendidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">¿Listo para hacer una venta?</h2>
            <p className="text-primary-100 mt-1">Procesa transacciones de forma rápida y sencilla</p>
          </div>
          <button 
            onClick={() => window.location.hash = '#sales'}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
