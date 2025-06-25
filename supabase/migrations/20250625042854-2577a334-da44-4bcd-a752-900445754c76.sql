
-- Crear tabla de categorías de productos
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de productos/inventario
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  category_id UUID REFERENCES public.categories(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sku)
);

-- Crear tabla de clientes
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de ventas
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  sale_number TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sale_number)
);

-- Crear tabla de items de venta (detalles de cada venta)
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para todas las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorías
CREATE POLICY "Users can manage their own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para productos
CREATE POLICY "Users can manage their own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para clientes
CREATE POLICY "Users can manage their own customers" ON public.customers
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para ventas
CREATE POLICY "Users can manage their own sales" ON public.sales
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para items de venta (basado en la venta padre)
CREATE POLICY "Users can manage their own sale items" ON public.sale_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

-- Función para generar número de venta automático
CREATE OR REPLACE FUNCTION public.generate_sale_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  sale_number TEXT;
BEGIN
  -- Obtener el siguiente número de venta para este usuario
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM '^V(\d+)$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales
  WHERE user_id = user_uuid;
  
  -- Generar el número de venta con formato V001, V002, etc.
  sale_number := 'V' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN sale_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar stock cuando se completa una venta
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Reducir stock del producto
  UPDATE public.products 
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta cuando se inserta un item de venta
CREATE TRIGGER update_stock_on_sale
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_stock();
