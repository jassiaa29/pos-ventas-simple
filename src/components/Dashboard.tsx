
import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('7days');

  const stats = [
    {
      title: 'Ventas Totales',
      value: '$12,847',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Productos Vendidos',
      value: '1,247',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'primary'
    },
    {
      title: 'Transacciones',
      value: '342',
      change: '+15.3%',
      isPositive: true,
      icon: TrendingUp,
      color: 'accent'
    },
    {
      title: 'Clientes Nuevos',
      value: '86',
      change: '-2.1%',
      isPositive: false,
      icon: Users,
      color: 'warning'
    }
  ];

  const recentTransactions = [
    { id: 1, customer: 'María González', amount: '$45.90', time: '10:30 AM', status: 'completed' },
    { id: 2, customer: 'Carlos Ruiz', amount: '$128.50', time: '10:15 AM', status: 'completed' },
    { id: 3, customer: 'Ana López', amount: '$67.25', time: '09:45 AM', status: 'pending' },
    { id: 4, customer: 'Juan Pérez', amount: '$89.75', time: '09:30 AM', status: 'completed' },
    { id: 5, customer: 'Sofia Martín', amount: '$156.00', time: '09:00 AM', status: 'completed' },
  ];

  const topProducts = [
    { name: 'Smartphone Galaxy', sales: 45, revenue: '$13,500' },
    { name: 'Laptop Dell', sales: 23, revenue: '$18,400' },
    { name: 'Auriculares Sony', sales: 67, revenue: '$6,700' },
    { name: 'Tablet iPad', sales: 34, revenue: '$13,600' },
    { name: 'Monitor Samsung', sales: 28, revenue: '$8,400' },
  ];

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
          
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-secondary-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {transaction.customer.split(' ').map(n => n[0]).join('')}
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
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Productos Destacados</h2>
          
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">¿Listo para hacer una venta?</h2>
            <p className="text-primary-100 mt-1">Procesa transacciones de forma rápida y sencilla</p>
          </div>
          <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
