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

      let saleNumber: string;
      
      try {
        // Intentar generar número de venta usando RPC
        const { data, error } = await supabase.rpc('generate_sale_number', {
          user_uuid: user.id
        });
        
        if (error) {
          console.warn('Error calling generate_sale_number RPC:', error);
          // Fallback: generar número localmente
          saleNumber = await generateFallbackSaleNumber(user.id);
        } else {
          saleNumber = data;
        }
      } catch (error) {
        console.warn('RPC function failed, using fallback:', error);
        // Fallback: generar número localmente
        saleNumber = await generateFallbackSaleNumber(user.id);
      }

      if (!saleNumber) {
        throw new Error('No se pudo generar el número de venta');
      }

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

  // Función de fallback para generar número de venta
  const generateFallbackSaleNumber = async (userId: string): Promise<string> => {
    try {
      // Obtener el último número de venta del usuario
      const { data: lastSale, error } = await supabase
        .from('sales')
        .select('sale_number')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last sale:', error);
        // Si falla, usar timestamp como fallback
        return `V${Date.now().toString().slice(-6)}`;
      }

      let nextNumber = 1;
      
      if (lastSale && lastSale.length > 0) {
        const lastNumber = lastSale[0].sale_number;
        // Extraer número del formato V001, V002, etc.
        const match = lastNumber.match(/^V(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Generar el número con formato V001, V002, etc.
      return `V${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Fallback sale number generation failed:', error);
      // Último fallback: usar timestamp
      return `V${Date.now().toString().slice(-6)}`;
    }
  };

  return {
    sales,
    isLoading,
    createSale,
  };
};
