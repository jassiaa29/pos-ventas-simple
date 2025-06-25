import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const addCustomer = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding customer:', error);
      toast.error('Error al agregar cliente');
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...customerData }: Partial<Customer> & { id: string }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast.error('Error al actualizar cliente');
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast.error('Error al eliminar cliente');
    },
  });

  return {
    customers,
    isLoading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
