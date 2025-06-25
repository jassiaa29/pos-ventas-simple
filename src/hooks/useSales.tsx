
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SaleItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    name: string;
    sku: string;
  };
}

export interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  notes?: string;
  sale_date: string;
  customer_id?: string;
  customer?: {
    name: string;
  };
  sale_items?: SaleItem[];
}

export const useSales = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name),
          sale_items(
            *,
            product:products(name, sku)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const createSale = useMutation({
    mutationFn: async ({ items, payment_method, customer_id, notes }: {
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
      }>;
      payment_method: string;
      customer_id?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Usuario no autenticado');

      // Generar número de venta
      const { data: saleNumber } = await supabase.rpc('generate_sale_number', {
        user_uuid: user.id
      });

      const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: user.id,
          sale_number: saleNumber,
          total_amount,
          payment_method,
          customer_id,
          notes,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items de la venta
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Actualizar stock
      toast.success('Venta procesada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating sale:', error);
      toast.error('Error al procesar la venta');
    },
  });

  return {
    sales,
    isLoading,
    createSale,
  };
};
