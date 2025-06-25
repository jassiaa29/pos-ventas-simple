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
  Filter,
  Loader2,
  X,
  Tag,
  FolderPlus,
  Power,
  PowerOff
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  cost: z.number().min(0, 'El costo debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  min_stock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  category_id: z.string().optional(),
  status: z.string().default('active'),
});

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const { products, isLoading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, addCategory, isLoading: loadingCategories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
      stock: 0,
      min_stock: 0,
      price: 0,
      cost: 0,
    }
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    watch: watchEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: categoryErrors, isSubmitting: isSubmittingCategory }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const selectedCategoryId = watch('category_id');
  const selectedCategoryIdEdit = watchEdit('category_id');

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        min_stock: data.min_stock,
        status: data.status,
        category_id: data.category_id || undefined,
      };
      await addProduct.mutateAsync(productData);
      reset();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  const onSubmitEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      const productData = {
        id: editingProduct.id,
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        min_stock: data.min_stock,
        status: data.status,
        category_id: data.category_id || undefined,
      };
      await updateProduct.mutateAsync(productData);
      resetEdit();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      await addCategory.mutateAsync({
        name: data.name,
        description: data.description,
      });
      resetCategory();
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    resetEdit({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      min_stock: product.min_stock,
      status: product.status,
      category_id: product.category_id || undefined,
    });
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await updateProduct.mutateAsync({
        id: product.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           (product.category && product.category.name === categoryFilter);
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.stock <= product.min_stock) ||
                        (stockFilter === 'out' && product.stock === 0);
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  // Obtener categorías únicas para el filtro
  const categoryNames = ['all', ...categories.map(cat => cat.name)];

  const getStockStatus = (product: any) => {
    if (product.stock === 0) return 'out';
    if (product.stock <= product.min_stock) return 'low';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-destructive-600 bg-destructive-50';
      case 'low': return 'text-warning-600 bg-warning-50';
      default: return 'text-success-600 bg-success-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out': return 'Agotado';
      case 'low': return 'Stock Bajo';
      default: return 'Disponible';
    }
  };

  if (isLoading || loadingCategories) {
    return (
      <div className="spacing-responsive-md animate-fade-in safe-area-top safe-area-bottom">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Cargando inventario...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spacing-responsive-md animate-fade-in safe-area-top safe-area-bottom">
        <div className="bg-destructive-50 border border-destructive-200 rounded-lg p-4">
          <p className="text-destructive-600">Error al cargar el inventario. Por favor, intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-area-top safe-area-bottom animate-fade-in">
      <div className="max-w-7xl mx-auto spacing-responsive-md space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="pt-4 lg:pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-responsive-2xl font-bold text-secondary-900">Inventario</h1>
              <p className="text-responsive-sm text-secondary-600 mt-1">Gestiona tu stock y productos</p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Botón Agregar Categoría */}
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="btn-mobile flex items-center gap-2 text-responsive-xs lg:text-sm">
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nueva Categoría</span>
                    <span className="sm:hidden">Categoría</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Categoría</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitCategory(onSubmitCategory)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-responsive-xs font-medium">Nombre de la Categoría *</Label>
                      <Input
                        id="categoryName"
                        {...registerCategory('name')}
                        placeholder="Ej: Electrónicos"
                        className={`input-mobile ${categoryErrors.name ? 'border-red-500' : ''}`}
                      />
                      {categoryErrors.name && (
                        <p className="text-responsive-xs text-red-500">{categoryErrors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription" className="text-responsive-xs font-medium">Descripción</Label>
                      <Textarea
                        id="categoryDescription"
                        {...registerCategory('description')}
                        placeholder="Descripción de la categoría (opcional)"
                        rows={3}
                        className="input-mobile resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCategoryModalOpen(false)}
                        disabled={isSubmittingCategory}
                        className="btn-secondary-mobile order-2 sm:order-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingCategory}
                        className="btn-primary-mobile order-1 sm:order-2"
                      >
                        {isSubmittingCategory ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Agregando...
                          </>
                        ) : (
                          'Agregar Categoría'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Botón Agregar Producto */}
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary-mobile flex items-center gap-2 text-responsive-xs lg:text-sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Agregar Producto</span>
                    <span className="sm:hidden">Producto</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-responsive-xs font-medium">Nombre del Producto *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Ej: Laptop HP"
                          className={`input-mobile ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && (
                          <p className="text-responsive-xs text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sku" className="text-responsive-xs font-medium">SKU *</Label>
                        <Input
                          id="sku"
                          {...register('sku')}
                          placeholder="Ej: LAP-HP-001"
                          className={`input-mobile ${errors.sku ? 'border-red-500' : ''}`}
                        />
                        {errors.sku && (
                          <p className="text-responsive-xs text-red-500">{errors.sku.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Selector de Categoría */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-responsive-xs font-medium">Categoría</Label>
                      <Select value={selectedCategoryId || 'none'} onValueChange={(value) => setValue('category_id', value === 'none' ? undefined : value)}>
                        <SelectTrigger className="input-mobile">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin categoría</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-responsive-xs font-medium">Descripción</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Descripción del producto (opcional)"
                        rows={3}
                        className="input-mobile resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-responsive-xs font-medium">Precio de Venta *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register('price', { valueAsNumber: true })}
                          placeholder="0.00"
                          className={`input-mobile ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && (
                          <p className="text-responsive-xs text-red-500">{errors.price.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost" className="text-responsive-xs font-medium">Costo *</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          {...register('cost', { valueAsNumber: true })}
                          placeholder="0.00"
                          className={`input-mobile ${errors.cost ? 'border-red-500' : ''}`}
                        />
                        {errors.cost && (
                          <p className="text-responsive-xs text-red-500">{errors.cost.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-responsive-xs font-medium">Stock Inicial *</Label>
                        <Input
                          id="stock"
                          type="number"
                          {...register('stock', { valueAsNumber: true })}
                          placeholder="0"
                          className={`input-mobile ${errors.stock ? 'border-red-500' : ''}`}
                        />
                        {errors.stock && (
                          <p className="text-responsive-xs text-red-500">{errors.stock.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min_stock" className="text-responsive-xs font-medium">Stock Mínimo *</Label>
                        <Input
                          id="min_stock"
                          type="number"
                          {...register('min_stock', { valueAsNumber: true })}
                          placeholder="0"
                          className={`input-mobile ${errors.min_stock ? 'border-red-500' : ''}`}
                        />
                        {errors.min_stock && (
                          <p className="text-responsive-xs text-red-500">{errors.min_stock.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-responsive-xs font-medium">Estado</Label>
                      <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                        <SelectTrigger className="input-mobile">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                        disabled={isSubmitting}
                        className="btn-secondary-mobile order-2 sm:order-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary-mobile order-1 sm:order-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Agregando...
                          </>
                        ) : (
                          'Agregar Producto'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="card-mobile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 lg:w-6 lg:h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-responsive-xl font-bold text-secondary-900">{products.filter(p => p.status === 'active').length}</p>
                <p className="text-responsive-xs text-secondary-600">Productos Activos</p>
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 lg:w-6 lg:h-6 text-secondary-500" />
              </div>
              <div>
                <p className="text-responsive-xl font-bold text-secondary-900">{products.filter(p => p.status === 'inactive').length}</p>
                <p className="text-responsive-xs text-secondary-600">Productos Inactivos</p>
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-responsive-xl font-bold text-secondary-900">
                  {products.filter(p => p.stock <= p.min_stock && p.stock > 0).length}
                </p>
                <p className="text-responsive-xs text-secondary-600">Stock Bajo</p>
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-destructive-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-destructive-600" />
              </div>
              <div>
                <p className="text-responsive-xl font-bold text-secondary-900">
                  {products.filter(p => p.stock === 0).length}
                </p>
                <p className="text-responsive-xs text-secondary-600">Agotados</p>
              </div>
            </div>
          </div>

          <div className="card-mobile sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-responsive-xl font-bold text-secondary-900">{categories.length}</p>
                <p className="text-responsive-xs text-secondary-600">Categorías</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-mobile">
          <div className="flex flex-col gap-4">
            <h3 className="text-responsive-lg font-semibold text-secondary-900">Filtros</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-mobile pl-10"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-mobile"
              >
                <option value="all">Todas las categorías</option>
                {categoryNames.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="input-mobile"
              >
                <option value="all">Todo el stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Agotados</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-mobile"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table/List */}
        <div className="card-mobile">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-6 lg:py-8">
              <Package className="w-10 h-10 lg:w-12 lg:h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500 text-responsive-sm">No hay productos que mostrar</p>
              <p className="text-responsive-xs text-secondary-400 mt-1">
                {products.length === 0 ? 'Agrega tu primer producto' : 'Prueba con diferentes filtros'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Producto</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">SKU</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Categoría</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Precio</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Stock</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Estado</th>
                      <th className="text-left p-4 font-medium text-secondary-900 text-responsive-xs">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const isInactive = product.status === 'inactive';
                      return (
                        <tr key={product.id} className={`border-b border-secondary-100 hover:bg-secondary-50 transition-colors ${isInactive ? 'opacity-60 bg-secondary-25' : ''}`}>
                          <td className="p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-medium text-responsive-sm ${isInactive ? 'text-secondary-500 line-through' : 'text-secondary-900'}`}>
                                  {product.name}
                                </p>
                                {isInactive && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium bg-secondary-100 text-secondary-600">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <p className="text-2xs text-secondary-500">
                                Actualizado: {new Date(product.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-secondary-600 text-responsive-xs">{product.sku}</td>
                          <td className="p-4">
                            {product.category ? (
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-emerald-600" />
                                <span className="text-secondary-600 text-responsive-xs">{product.category.name}</span>
                              </div>
                            ) : (
                              <span className="text-secondary-400 text-responsive-xs">Sin categoría</span>
                            )}
                          </td>
                          <td className="p-4 font-medium text-secondary-900 text-responsive-sm">${product.price}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-secondary-900 text-responsive-sm">{product.stock}</p>
                              <p className="text-2xs text-secondary-500">Min: {product.min_stock}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {isInactive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium bg-secondary-100 text-secondary-600">
                                Inactivo
                              </span>
                            ) : (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium ${getStatusColor(stockStatus)}`}>
                              {getStatusText(stockStatus)}
                            </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="p-1 text-secondary-400 hover:text-primary-600 transition-colors mobile-tap"
                                title="Editar producto"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(product)}
                                className={`p-1 transition-colors mobile-tap ${
                                  product.status === 'active' 
                                    ? 'text-secondary-400 hover:text-warning-600' 
                                    : 'text-warning-600 hover:text-success-600'
                                }`}
                                title={product.status === 'active' ? 'Desactivar producto' : 'Activar producto'}
                              >
                                {product.status === 'active' ? (
                                  <PowerOff className="w-4 h-4" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
                              </button>
                              <button 
                                onClick={() => setDeletingProduct(product)}
                                className="p-1 text-secondary-400 hover:text-destructive-600 transition-colors mobile-tap"
                                title="Eliminar producto"
                              >
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

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const isInactive = product.status === 'inactive';
                  return (
                    <div key={product.id} className={`p-4 bg-secondary-50 rounded-lg mobile-hover ${isInactive ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium text-responsive-sm truncate ${isInactive ? 'text-secondary-500 line-through' : 'text-secondary-900'}`}>
                              {product.name}
                            </h3>
                            {isInactive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium bg-secondary-100 text-secondary-600 flex-shrink-0">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <p className="text-2xs text-secondary-500 mb-2">SKU: {product.sku}</p>
                          
                          <div className="flex items-center gap-4 mb-2">
                            {product.category ? (
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-emerald-600" />
                                <span className="text-2xs text-secondary-600">{product.category.name}</span>
                              </div>
                            ) : (
                              <span className="text-2xs text-secondary-400">Sin categoría</span>
                            )}
                            
                            <span className="text-responsive-sm font-semibold text-secondary-900">${product.price}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-responsive-xs text-secondary-600">Stock: </span>
                              <span className="font-medium text-secondary-900 text-responsive-xs">{product.stock}</span>
                              <span className="text-2xs text-secondary-500">(Min: {product.min_stock})</span>
                            </div>
                            
                            {!isInactive && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium ${getStatusColor(stockStatus)}`}>
                                {getStatusText(stockStatus)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="touch-target w-8 h-8 rounded-lg bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors mobile-tap"
                            title="Editar producto"
                          >
                            <Edit3 className="w-4 h-4 text-primary-600" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(product)}
                            className={`touch-target w-8 h-8 rounded-lg flex items-center justify-center transition-colors mobile-tap ${
                              product.status === 'active' 
                                ? 'bg-warning-100 hover:bg-warning-200 text-warning-600' 
                                : 'bg-success-100 hover:bg-success-200 text-success-600'
                            }`}
                            title={product.status === 'active' ? 'Desactivar producto' : 'Activar producto'}
                          >
                            {product.status === 'active' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => setDeletingProduct(product)}
                            className="touch-target w-8 h-8 rounded-lg bg-destructive-100 hover:bg-destructive-200 flex items-center justify-center transition-colors mobile-tap"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4 text-destructive-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal de Editar Producto */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName" className="text-responsive-xs font-medium">Nombre del Producto *</Label>
                    <Input
                      id="editName"
                      {...registerEdit('name')}
                      className={`input-mobile ${errorsEdit.name ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.name && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editSku" className="text-responsive-xs font-medium">SKU *</Label>
                    <Input
                      id="editSku"
                      {...registerEdit('sku')}
                      className={`input-mobile ${errorsEdit.sku ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.sku && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.sku.message}</p>
                    )}
                  </div>
                </div>

                {/* Selector de Categoría para Edición */}
                <div className="space-y-2">
                  <Label htmlFor="editCategory" className="text-responsive-xs font-medium">Categoría</Label>
                  <Select value={selectedCategoryIdEdit || 'none'} onValueChange={(value) => setValueEdit('category_id', value === 'none' ? undefined : value)}>
                    <SelectTrigger className="input-mobile">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription" className="text-responsive-xs font-medium">Descripción</Label>
                  <Textarea
                    id="editDescription"
                    {...registerEdit('description')}
                    rows={3}
                    className="input-mobile resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPrice" className="text-responsive-xs font-medium">Precio de Venta *</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      step="0.01"
                      {...registerEdit('price', { valueAsNumber: true })}
                      className={`input-mobile ${errorsEdit.price ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.price && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editCost" className="text-responsive-xs font-medium">Costo *</Label>
                    <Input
                      id="editCost"
                      type="number"
                      step="0.01"
                      {...registerEdit('cost', { valueAsNumber: true })}
                      className={`input-mobile ${errorsEdit.cost ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.cost && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.cost.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editStock" className="text-responsive-xs font-medium">Stock *</Label>
                    <Input
                      id="editStock"
                      type="number"
                      {...registerEdit('stock', { valueAsNumber: true })}
                      className={`input-mobile ${errorsEdit.stock ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.stock && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.stock.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editMinStock" className="text-responsive-xs font-medium">Stock Mínimo *</Label>
                    <Input
                      id="editMinStock"
                      type="number"
                      {...registerEdit('min_stock', { valueAsNumber: true })}
                      className={`input-mobile ${errorsEdit.min_stock ? 'border-red-500' : ''}`}
                    />
                    {errorsEdit.min_stock && (
                      <p className="text-responsive-xs text-red-500">{errorsEdit.min_stock.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStatus" className="text-responsive-xs font-medium">Estado</Label>
                  <Select value={watchEdit('status')} onValueChange={(value) => setValueEdit('status', value)}>
                    <SelectTrigger className="input-mobile">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProduct(null)}
                    disabled={isSubmittingEdit}
                    className="btn-secondary-mobile order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="btn-primary-mobile order-1 sm:order-2"
                  >
                    {isSubmittingEdit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Producto'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Eliminar Producto</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            {deletingProduct && (
              <div className="py-4">
                <div className="bg-secondary-50 rounded-lg p-4">
                  <p className="font-medium text-secondary-900 text-responsive-sm">{deletingProduct.name}</p>
                  <p className="text-responsive-xs text-secondary-600">SKU: {deletingProduct.sku}</p>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                className="btn-secondary-mobile order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={deleteProduct.isPending}
                className="btn-mobile bg-destructive-600 hover:bg-destructive-700 text-white order-1 sm:order-2"
              >
                {deleteProduct.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Inventory;