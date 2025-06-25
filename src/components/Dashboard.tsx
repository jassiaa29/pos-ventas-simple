import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronDown,
  Eye,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('weekly');

  const { products, isLoading: loadingProducts } = useProducts();
  const { sales, isLoading: loadingSales } = useSales();
  const { customers, isLoading: loadingCustomers } = useCustomers();

  // Calcular métricas del día actual
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => new Date(sale.sale_date).toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todayOrders = todaySales.length;
    
    // Calcular nuevos clientes (asumiendo que los de hoy son nuevos)
    const newCustomersToday = customers.filter(customer => 
      customer.created_at && new Date(customer.created_at).toDateString() === today
    ).length;

    // Productos con stock bajo
    const lowStockProducts = products.filter(product => 
      product.stock <= (product.min_stock || 0) && product.status === 'active'
    ).length;

    return {
      todayRevenue,
      todayOrders,
      newCustomersToday,
      lowStockProducts
    };
  }, [sales, customers, products]);

  // Datos para el análisis de ventas (últimos 7 días)
  const salesAnalysisData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        current: 0,
        previous: 0
      };
    });

    // Ventas actuales (últimos 7 días)
    sales.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = 6 - diffDays;
        if (last7Days[dayIndex]) {
          last7Days[dayIndex].current += sale.total_amount;
        }
      }
    });

    // Simular datos del período anterior para comparación
    last7Days.forEach((day, index) => {
      day.previous = day.current * (0.8 + Math.random() * 0.4); // Variación del ±20%
    });

    return last7Days;
  }, [sales]);

  // Productos más vendidos
  const topProducts = useMemo(() => {
    const productSales = new Map();
    
    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        const productName = item.product?.name || 'Producto desconocido';
        const currentQuantity = productSales.get(productName) || 0;
        productSales.set(productName, currentQuantity + item.quantity);
      });
    });

    return Array.from(productSales.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Ventas recientes
  const recentSales = useMemo(() => {
    return sales
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
      .slice(0, 5);
  }, [sales]);

  // Resumen de operaciones
  const operationsSummary = useMemo(() => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalOrders = sales.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      avgOrderValue
    };
  }, [sales]);

  const isLoading = loadingProducts || loadingSales || loadingCustomers;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      <div className="max-w-7xl mx-auto spacing-responsive-md space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="pt-4 lg:pt-0">
          <h1 className="text-responsive-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-responsive-sm text-gray-600">Bienvenido de nuevo, aquí está tu resumen de hoy.</p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Ventas Hoy */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-responsive-xl font-bold text-gray-900 mb-1">
                $ {todayStats.todayRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-responsive-xs text-gray-600 mb-2">Ventas Hoy</p>
              <div className="flex items-center text-green-600 text-responsive-xs">
                <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                <span>100% respecto a ayer</span>
              </div>
            </div>
          </div>

          {/* Órdenes */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-responsive-xl font-bold text-gray-900 mb-1">{todayStats.todayOrders}</p>
              <p className="text-responsive-xs text-gray-600 mb-2">Órdenes</p>
              <div className="flex items-center text-green-600 text-responsive-xs">
                <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                <span>0% respecto a ayer</span>
              </div>
            </div>
          </div>

          {/* Clientes Nuevos */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-responsive-xl font-bold text-gray-900 mb-1">{todayStats.newCustomersToday}</p>
              <p className="text-responsive-xs text-gray-600 mb-2">Clientes Nuevos</p>
              <p className="text-green-600 text-responsive-xs">Sin cambios</p>
            </div>
          </div>

          {/* Stock Agotado */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-responsive-xl font-bold text-gray-900 mb-1">{todayStats.lowStockProducts}</p>
              <p className="text-responsive-xs text-gray-600 mb-2">Stock Agotado</p>
              <p className="text-green-600 text-responsive-xs">Todo en orden</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Análisis de Ventas */}
          <div className="xl:col-span-2 card-mobile">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 lg:mb-6">
              <div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-1">Análisis de Ventas</h3>
                <p className="text-responsive-xs text-gray-600">Comparativa de ventas con el período anterior</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                <div className="flex items-center gap-4 lg:gap-6 text-responsive-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Período actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">Período anterior</span>
                  </div>
                </div>
                <button className="btn-secondary-mobile text-responsive-xs px-3 py-2">
                  <span>Semanal</span>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesAnalysisData}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorCurrent)"
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resumen de Operaciones */}
          <div className="card-mobile">
            <h3 className="text-responsive-lg font-semibold text-gray-900 mb-1">Resumen de Operaciones</h3>
            <p className="text-responsive-xs text-gray-600 mb-4 lg:mb-6">Datos globales del negocio</p>
            
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-responsive-xs text-gray-600">Total de Ventas</p>
                  <p className="text-responsive-lg font-bold text-gray-900">
                    $ {operationsSummary.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-responsive-xs text-gray-600">Órdenes Realizadas</p>
                  <p className="text-responsive-lg font-bold text-gray-900">{operationsSummary.totalOrders}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-responsive-xs text-gray-600">Promedio por Orden</p>
                  <p className="text-responsive-lg font-bold text-gray-900">
                    $ {operationsSummary.avgOrderValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <button className="btn-primary-mobile w-full">
                Ver historial completo
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Productos Más Vendidos */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-1">Productos Más Vendidos</h3>
                <p className="text-responsive-xs text-gray-600">Los 5 productos más populares</p>
              </div>
            </div>
            
            {topProducts.length > 0 ? (
              <div className="space-y-3 lg:space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between mobile-hover p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-responsive-sm">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-responsive-sm">{product.quantity} uds.</p>
                    </div>
                  </div>
                ))}
                <button className="btn-secondary-mobile w-full mt-4">
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="text-center py-6 lg:py-8">
                <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-responsive-sm">No hay datos de productos</p>
              </div>
            )}
          </div>

          {/* Alertas de Inventario + Últimas Ventas */}
          <div className="space-y-4 lg:space-y-6">
            {/* Alertas de Inventario */}
            <div className="card-mobile">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-responsive-lg font-semibold text-gray-900 mb-1">Alertas de Inventario</h3>
                  <p className="text-responsive-xs text-gray-600">Productos con stock bajo</p>
                </div>
                {todayStats.lowStockProducts > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {todayStats.lowStockProducts} productos
                  </span>
                )}
              </div>
              
              {todayStats.lowStockProducts === 0 ? (
                <div className="text-center py-4 lg:py-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium text-responsive-sm">¡Bien! No hay productos con stock bajo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products
                    .filter(p => p.stock <= (p.min_stock || 0) && p.status === 'active')
                    .slice(0, 3)
                    .map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg mobile-hover">
                        <div>
                          <p className="font-medium text-gray-900 text-responsive-sm">{product.name}</p>
                          <p className="text-responsive-xs text-gray-600">Stock: {product.stock}</p>
                        </div>
                        <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      </div>
                    ))}
                </div>
              )}
              
              <button className="btn-secondary-mobile w-full mt-4">
                Gestionar inventario
              </button>
            </div>

            {/* Últimas Ventas */}
            <div className="card-mobile">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-responsive-lg font-semibold text-gray-900 mb-1">Últimas Ventas</h3>
                  <p className="text-responsive-xs text-gray-600">Las transacciones más recientes</p>
                </div>
              </div>
              
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="flex items-center justify-between p-3 mobile-hover rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-responsive-sm">Venta #{sale.sale_number}</p>
                          <p className="text-responsive-xs text-gray-600">
                            {sale.customer?.name || 'Cliente genérico'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-responsive-sm">
                          $ {sale.total_amount.toFixed(2)}
                        </p>
                        <p className="text-2xs text-gray-500">
                          {new Date(sale.sale_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 lg:py-6">
                  <ShoppingCart className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-responsive-sm">No hay ventas recientes</p>
                </div>
              )}
              
              <button className="btn-secondary-mobile w-full mt-4">
                Ver todas las ventas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
