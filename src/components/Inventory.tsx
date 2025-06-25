
import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const products = [
    { 
      id: 1, 
      name: 'Smartphone Galaxy', 
      sku: 'SKU001', 
      price: 299.99, 
      stock: 15, 
      minStock: 5,
      category: 'Electrónicos',
      lastUpdated: '2024-01-15',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Laptop Dell Inspiron', 
      sku: 'SKU002', 
      price: 799.99, 
      stock: 3, 
      minStock: 5,
      category: 'Computadoras',
      lastUpdated: '2024-01-14',
      status: 'low'
    },
    { 
      id: 3, 
      name: 'Auriculares Sony', 
      sku: 'SKU003', 
      price: 99.99, 
      stock: 25, 
      minStock: 10,
      category: 'Audio',
      lastUpdated: '2024-01-13',
      status: 'active'
    },
    { 
      id: 4, 
      name: 'Tablet iPad', 
      sku: 'SKU004', 
      price: 399.99, 
      stock: 0, 
      minStock: 3,
      category: 'Tablets',
      lastUpdated: '2024-01-12',
      status: 'out'
    },
    { 
      id: 5, 
      name: 'Monitor Samsung 24"', 
      sku: 'SKU005', 
      price: 299.99, 
      stock: 10, 
      minStock: 5,
      category: 'Monitores',
      lastUpdated: '2024-01-11',
      status: 'active'
    },
  ];

  const categories = ['all', 'Electrónicos', 'Computadoras', 'Audio', 'Tablets', 'Monitores'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.stock <= product.minStock) ||
                        (stockFilter === 'out' && product.stock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (product) => {
    if (product.stock === 0) return 'out';
    if (product.stock <= product.minStock) return 'low';
    return 'good';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out': return 'text-destructive-600 bg-destructive-50';
      case 'low': return 'text-warning-600 bg-warning-50';
      default: return 'text-success-600 bg-success-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'out': return 'Agotado';
      case 'low': return 'Stock Bajo';
      default: return 'Disponible';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Inventario</h1>
          <p className="text-secondary-600 mt-1">Gestiona tu stock y productos</p>
        </div>
        
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{products.length}</p>
              <p className="text-sm text-secondary-600">Total Productos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {products.filter(p => p.stock <= p.minStock && p.stock > 0).length}
              </p>
              <p className="text-sm text-secondary-600">Stock Bajo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {products.filter(p => p.stock === 0).length}
              </p>
              <p className="text-sm text-secondary-600">Agotados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0)}
              </p>
              <p className="text-sm text-secondary-600">Valor Inventario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">Todas las categorías</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">Todo el stock</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotados</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left p-4 font-medium text-secondary-900">Producto</th>
                <th className="text-left p-4 font-medium text-secondary-900">SKU</th>
                <th className="text-left p-4 font-medium text-secondary-900">Categoría</th>
                <th className="text-left p-4 font-medium text-secondary-900">Precio</th>
                <th className="text-left p-4 font-medium text-secondary-900">Stock</th>
                <th className="text-left p-4 font-medium text-secondary-900">Estado</th>
                <th className="text-left p-4 font-medium text-secondary-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-secondary-900">{product.name}</p>
                        <p className="text-sm text-secondary-500">Actualizado: {product.lastUpdated}</p>
                      </div>
                    </td>
                    <td className="p-4 text-secondary-600">{product.sku}</td>
                    <td className="p-4 text-secondary-600">{product.category}</td>
                    <td className="p-4 font-medium text-secondary-900">${product.price}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-secondary-900">{product.stock}</p>
                        <p className="text-xs text-secondary-500">Min: {product.minStock}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stockStatus)}`}>
                        {getStatusText(stockStatus)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-secondary-400 hover:text-primary-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-secondary-400 hover:text-destructive-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
