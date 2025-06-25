
import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  DollarSign,
  Receipt,
  Search
} from 'lucide-react';

const Sales = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const products = [
    { id: 1, name: 'Smartphone Galaxy', price: 299.99, stock: 15, category: 'Electrónicos' },
    { id: 2, name: 'Laptop Dell Inspiron', price: 799.99, stock: 8, category: 'Computadoras' },
    { id: 3, name: 'Auriculares Sony', price: 99.99, stock: 25, category: 'Audio' },
    { id: 4, name: 'Tablet iPad', price: 399.99, stock: 12, category: 'Tablets' },
    { id: 5, name: 'Monitor Samsung 24"', price: 299.99, stock: 10, category: 'Monitores' },
    { id: 6, name: 'Teclado Mecánico', price: 89.99, stock: 20, category: 'Accesorios' },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const processSale = () => {
    if (cart.length === 0) return;
    
    // Simular procesamiento de venta
    alert(`Venta procesada exitosamente!\nTotal: $${total.toFixed(2)}\nMétodo de pago: ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}`);
    setCart([]);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Product Selection */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Productos</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-secondary-500">{product.category}</p>
                    </div>
                    <Plus className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-secondary-900">
                      ${product.price}
                    </span>
                    <span className={`text-sm ${
                      product.stock > 10 ? 'text-success-600' : 
                      product.stock > 5 ? 'text-warning-600' : 'text-destructive-600'
                    }`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-xl border border-secondary-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-secondary-900">
                Carrito ({itemCount})
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">El carrito está vacío</p>
                <p className="text-sm text-secondary-400 mt-1">Agrega productos para comenzar</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 truncate">{item.name}</h4>
                        <p className="text-sm text-secondary-600">${item.price} c/u</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-full bg-destructive-100 hover:bg-destructive-200 flex items-center justify-center transition-colors ml-2"
                        >
                          <X className="w-3 h-3 text-destructive-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-secondary-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Método de pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:bg-secondary-50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:bg-secondary-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Tarjeta
                    </button>
                  </div>
                </div>

                <button
                  onClick={processSale}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Procesar Venta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
