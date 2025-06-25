import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  DollarSign,
  Receipt,
  Search,
  Loader2,
  Calendar,
  User,
  Filter,
  BarChart3,
  TrendingUp,
  Package,
  Percent,
  ScanLine,
  Eye,
  Clock,
  Check
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  sku: string;
  category?: string;
  discount: number; // Descuento en porcentaje
}

const Sales = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  // Filtros para historial
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const { products, isLoading: loadingProducts } = useProducts();
  const { sales, isLoading: loadingSales, createSale } = useSales();
  const { customers, isLoading: loadingCustomers } = useCustomers();

  // Productos filtrados para POS
  const filteredProducts = products.filter(product =>
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
    product.stock > 0 &&
    product.status === 'active'
  );

  // Ventas filtradas para historial
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = !historySearchTerm || 
        sale.sale_number.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        sale.customer?.name?.toLowerCase().includes(historySearchTerm.toLowerCase());
      
      const saleDate = new Date(sale.sale_date);
      const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || saleDate <= new Date(dateTo);
      
      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [sales, historySearchTerm, dateFrom, dateTo]);

  // Métricas calculadas
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return sales.filter(sale => new Date(sale.sale_date).toDateString() === today);
  }, [sales]);

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const weekRevenue = sales
    .filter(sale => {
      const saleDate = new Date(sale.sale_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    })
    .reduce((sum, sale) => sum + sale.total_amount, 0);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        sku: product.sku,
        category: product.category?.name || 'Sin categoría',
        discount: 0
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else if (newQuantity <= item.stock) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, discount: Math.max(0, Math.min(100, discount)) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer('');
    setNotes('');
    setGlobalDiscount(0);
    setCashReceived(0);
  };

  // Cálculos del carrito
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemDiscounts = cart.reduce((sum, item) => 
    sum + (item.price * item.quantity * item.discount / 100), 0
  );
  const globalDiscountAmount = (subtotal - itemDiscounts) * globalDiscount / 100;
  const total = subtotal - itemDiscounts - globalDiscountAmount;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const change = cashReceived - total;

  const processSale = async () => {
    if (cart.length === 0) return;
    
    const items = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price * (1 - item.discount / 100) // Aplicar descuento individual
    }));

    try {
      await createSale.mutateAsync({
        items,
        payment_method: paymentMethod,
        customer_id: selectedCustomer || undefined,
        notes: notes || undefined
      });
      clearCart();
      setActiveTab('history'); // Cambiar a historial después de la venta
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  };

  // Manejar búsqueda por código de barras/SKU
  const handleBarcodeSearch = (value: string) => {
    setSearchTerm(value);
    
    // Si coincide exactamente con un SKU, agregar al carrito automáticamente
    const exactMatch = products.find(p => 
      p.sku.toLowerCase() === value.toLowerCase() && 
      p.stock > 0 && 
      p.status === 'active'
    );
    
    if (exactMatch) {
      addToCart(exactMatch);
      setSearchTerm(''); // Limpiar búsqueda después de agregar
    }
  };

  if (loadingProducts || loadingSales || loadingCustomers) {
    return (
      <div className="spacing-responsive-md animate-fade-in">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Cargando panel de ventas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-area-top safe-area-bottom animate-fade-in">
      <div className="max-w-7xl mx-auto spacing-responsive-md space-y-4 lg:space-y-6">
        {/* Header con tabs responsivo */}
        <div className="pt-4 lg:pt-0">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-responsive-2xl font-bold text-secondary-900">Panel de Ventas</h1>
              <p className="text-responsive-sm text-secondary-600 mt-1">Gestiona transacciones y consulta el historial</p>
            </div>
            
            {/* Tabs responsivos */}
            <div className="flex bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('pos')}
                className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 rounded-md text-responsive-xs lg:text-sm font-medium transition-colors mobile-tap ${
                  activeTab === 'pos' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                <span className="hidden sm:inline">Punto de Venta</span>
                <span className="sm:hidden">POS</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 rounded-md text-responsive-xs lg:text-sm font-medium transition-colors mobile-tap ${
                  activeTab === 'history' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-2" />
                Historial
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        {activeTab === 'pos' && (
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 h-full">
            {/* Product Selection */}
            <div className="flex-1 order-2 xl:order-1">
              <div className="card-mobile">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 lg:mb-6">
                  <h2 className="text-responsive-lg font-semibold text-secondary-900">Productos</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-mobile pl-10 pr-4 w-full sm:w-64"
                    />
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-6 lg:py-8">
                    <ShoppingCart className="w-10 h-10 lg:w-12 lg:h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500 text-responsive-sm">No hay productos disponibles</p>
                    <p className="text-responsive-xs text-secondary-400 mt-1">
                      {products.length === 0 ? 'Agrega productos al inventario' : 'Prueba con diferentes términos de búsqueda'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-secondary-200 rounded-lg p-3 lg:p-4 mobile-tap mobile-hover cursor-pointer group"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors text-responsive-sm truncate">
                              {product.name}
                            </h3>
                            <p className="text-responsive-xs text-secondary-500 truncate">{product.category?.name || 'Sin categoría'}</p>
                          </div>
                          <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-secondary-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-responsive-lg font-semibold text-secondary-900">
                            ${product.price}
                          </span>
                          <span className={`text-responsive-xs ${
                            product.stock > 10 ? 'text-success-600' : 
                            product.stock > 5 ? 'text-warning-600' : 'text-destructive-600'
                          }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart and Checkout - Responsive */}
            <div className="w-full xl:w-96 order-1 xl:order-2">
              <div className="card-mobile xl:sticky xl:top-6">
                <div className="flex items-center gap-2 mb-4 lg:mb-6">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                  <h2 className="text-responsive-lg font-semibold text-secondary-900">
                    Carrito ({itemCount})
                  </h2>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-6 lg:py-8">
                    <ShoppingCart className="w-10 h-10 lg:w-12 lg:h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500 text-responsive-sm">El carrito está vacío</p>
                    <p className="text-responsive-xs text-secondary-400 mt-1">Agrega productos para comenzar</p>
                  </div>
                ) : (
                  <>
                    {/* Búsqueda por código de barras */}
                    <div className="mb-4">
                      <div className="relative">
                        <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <Input
                          type="text"
                          placeholder="Escanear código o SKU..."
                          value={searchTerm}
                          onChange={(e) => handleBarcodeSearch(e.target.value)}
                          className="input-mobile pl-10"
                        />
                      </div>
                    </div>

                    {/* Selección de cliente */}
                    <div className="mb-4">
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">Cliente (opcional)</Label>
                      <Select value={selectedCustomer || 'none'} onValueChange={(value) => setSelectedCustomer(value === 'none' ? '' : value)}>
                        <SelectTrigger className="input-mobile">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin cliente</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {customer.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Items del carrito - Scroll optimizado para móvil */}
                    <div className="space-y-3 mb-4 lg:mb-6 max-h-48 lg:max-h-64 overflow-y-auto scroll-smooth-mobile">
                      {cart.map((item) => (
                        <div key={item.id} className="p-3 bg-secondary-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-secondary-900 truncate text-responsive-sm">{item.name}</h4>
                              <p className="text-2xs text-secondary-500">{item.sku} • {item.category}</p>
                              <p className="text-responsive-xs text-secondary-600">${item.price.toFixed(2)} c/u</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="touch-target w-6 h-6 rounded-full bg-destructive-100 hover:bg-destructive-200 flex items-center justify-center transition-colors mobile-tap"
                            >
                              <X className="w-3 h-3 text-destructive-600" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="touch-target w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors mobile-tap"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium text-responsive-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="touch-target w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors mobile-tap"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Percent className="w-3 h-3 text-secondary-400" />
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount}
                                onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                                className="w-16 h-8 text-2xs border border-secondary-300 rounded px-2"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-secondary-200">
                            <span className="text-responsive-xs text-secondary-600">Subtotal:</span>
                            <span className="font-medium text-responsive-sm">
                              ${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Descuento global */}
                    <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">Descuento Global (%)</Label>
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-primary-600" />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={globalDiscount}
                          onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                          className="input-mobile flex-1"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Resumen de totales */}
                    <div className="border-t border-secondary-200 pt-4 mb-4 lg:mb-6 space-y-2">
                      <div className="flex justify-between items-center text-responsive-xs">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {itemDiscounts > 0 && (
                        <div className="flex justify-between items-center text-responsive-xs text-secondary-600">
                          <span>Desc. productos:</span>
                          <span>-${itemDiscounts.toFixed(2)}</span>
                        </div>
                      )}
                      {globalDiscountAmount > 0 && (
                        <div className="flex justify-between items-center text-responsive-xs text-secondary-600">
                          <span>Desc. global:</span>
                          <span>-${globalDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-responsive-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div className="mb-4">
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">Método de pago</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('cash')}
                          className={`btn-mobile flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === 'cash'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-200 hover:bg-secondary-50'
                          }`}
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-responsive-xs">Efectivo</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`btn-mobile flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === 'card'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-200 hover:bg-secondary-50'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-responsive-xs">Tarjeta</span>
                        </button>
                      </div>
                    </div>

                    {/* Efectivo recibido (solo si es efectivo) */}
                    {paymentMethod === 'cash' && (
                      <div className="mb-4">
                        <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">Efectivo recibido</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(Number(e.target.value))}
                          placeholder="0.00"
                          className="input-mobile"
                        />
                        {cashReceived > 0 && cashReceived >= total && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-responsive-xs">
                            <div className="flex justify-between">
                              <span>Cambio:</span>
                              <span className="font-medium text-green-700">${change.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notas */}
                    <div className="mb-4">
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">Notas (opcional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Agregar notas sobre la venta..."
                        rows={2}
                        className="input-mobile resize-none"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <Button
                        onClick={processSale}
                        disabled={createSale.isPending || (paymentMethod === 'cash' && cashReceived < total)}
                        className="btn-primary-mobile w-full"
                      >
                        {createSale.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Receipt className="w-4 h-4 mr-2" />
                            Procesar Venta
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="btn-secondary-mobile w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar Carrito
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 h-full">
            {/* Historial de ventas */}
            <div className="flex-1">
              <div className="card-mobile">
                <div className="flex flex-col gap-4 mb-4 lg:mb-6">
                  <h2 className="text-responsive-lg font-semibold text-secondary-900">Historial de Ventas</h2>
                  
                  {/* Filtros responsivos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {/* Filtros de fecha */}
                    <div className="sm:col-span-2 xl:col-span-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="input-mobile flex-1"
                        placeholder="Desde"
                      />
                      <span className="text-secondary-400">-</span>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="input-mobile flex-1"
                        placeholder="Hasta"
                      />
                    </div>
                    
                    {/* Búsqueda */}
                    <div className="sm:col-span-2 xl:col-span-2 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                      <Input
                        type="text"
                        placeholder="Buscar ventas..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        className="input-mobile pl-10"
                      />
                    </div>
                  </div>
                </div>

                {filteredSales.length === 0 ? (
                  <div className="text-center py-6 lg:py-8">
                    <ShoppingCart className="w-10 h-10 lg:w-12 lg:h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500 text-responsive-sm">No hay ventas disponibles</p>
                    <p className="text-responsive-xs text-secondary-400 mt-1">
                      {sales.length === 0 ? 'Realiza tu primera venta' : 'Prueba con diferentes términos de búsqueda'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Vista de tabla para desktop */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary-50 border-b border-secondary-200">
                          <tr>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Número</th>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Fecha</th>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Cliente</th>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Total</th>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Método</th>
                            <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSales.map((sale) => (
                            <tr key={sale.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                              <td className="p-4">
                                <span className="font-medium text-secondary-900 text-responsive-sm">{sale.sale_number}</span>
                              </td>
                              <td className="p-4 text-secondary-600 text-responsive-xs">
                                {new Date(sale.sale_date).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-secondary-600 text-responsive-xs">
                                {sale.customer?.name || 'Cliente general'}
                              </td>
                              <td className="p-4">
                                <span className="font-medium text-secondary-900 text-responsive-sm">${sale.total_amount.toFixed(2)}</span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium ${
                                  sale.payment_method === 'cash' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {sale.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                                </span>
                              </td>
                              <td className="p-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSale(sale)}
                                  className="btn-mobile flex items-center gap-2 text-2xs"
                                >
                                  <Eye className="w-3 h-3" />
                                  Ver
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista de cards para móvil */}
                    <div className="lg:hidden space-y-3">
                      {filteredSales.map((sale) => (
                        <div key={sale.id} className="p-4 bg-secondary-50 rounded-lg mobile-hover">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-secondary-900 text-responsive-sm">Venta #{sale.sale_number}</p>
                              <p className="text-responsive-xs text-secondary-600">{sale.customer?.name || 'Cliente general'}</p>
                            </div>
                            <button
                              onClick={() => setSelectedSale(sale)}
                              className="btn-mobile p-2 text-primary-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium ${
                                sale.payment_method === 'cash' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {sale.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                              </span>
                              <span className="text-2xs text-secondary-500">
                                {new Date(sale.sale_date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="font-semibold text-secondary-900 text-responsive-sm">${sale.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Detalles de la venta seleccionada - Responsive */}
            {selectedSale && (
              <div className="w-full xl:w-96">
                <div className="card-mobile xl:sticky xl:top-6">
                  <div className="flex items-center gap-2 mb-4 lg:mb-6">
                    <Receipt className="w-5 h-5 text-primary-600" />
                    <h2 className="text-responsive-lg font-semibold text-secondary-900">
                      Detalles de la Venta
                    </h2>
                  </div>

                  <div className="space-y-3 mb-4 lg:mb-6">
                    <div>
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                        Número de Venta
                      </Label>
                      <p className="text-responsive-sm text-secondary-900">{selectedSale.sale_number}</p>
                    </div>
                    <div>
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                        Fecha de Venta
                      </Label>
                      <p className="text-responsive-sm text-secondary-900">
                        {new Date(selectedSale.sale_date).toLocaleDateString()} {new Date(selectedSale.sale_date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                        Cliente
                      </Label>
                      <p className="text-responsive-sm text-secondary-900">{selectedSale.customer?.name || 'Cliente general'}</p>
                    </div>
                    <div>
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                        Método de Pago
                      </Label>
                      <p className="text-responsive-sm text-secondary-900">
                        {selectedSale.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                        Total de Venta
                      </Label>
                      <p className="text-responsive-lg font-semibold text-secondary-900">${selectedSale.total_amount.toFixed(2)}</p>
                    </div>
                    {selectedSale.notes && (
                      <div>
                        <Label className="text-responsive-xs font-medium text-secondary-700 mb-2">
                          Notas
                        </Label>
                        <p className="text-responsive-sm text-secondary-900">{selectedSale.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Productos vendidos */}
                  {selectedSale.sale_items && selectedSale.sale_items.length > 0 && (
                    <div className="space-y-3 mb-4 lg:mb-6">
                      <h3 className="text-responsive-sm font-semibold text-secondary-900">Productos Vendidos</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto scroll-smooth-mobile">
                        {selectedSale.sale_items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-secondary-900 truncate text-responsive-sm">
                                {item.product?.name || 'Producto eliminado'}
                              </h4>
                              <p className="text-2xs text-secondary-500">
                                {item.product?.sku} • ${item.unit_price.toFixed(2)} c/u
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-responsive-sm">x{item.quantity}</p>
                              <p className="text-responsive-xs text-secondary-600">${item.subtotal.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón cerrar detalles */}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSale(null)}
                    className="btn-secondary-mobile w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cerrar Detalles
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
