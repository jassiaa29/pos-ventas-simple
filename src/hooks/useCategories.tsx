import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const addCategory = useMutation({
    mutationFn: async (categoryData: { name: string; description?: string }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Actualizar productos que usen categorías
      toast.success('Categoría agregada exitosamente');
    },
    onError: (error) => {
      console.error('Error adding category:', error);
      toast.error('Error al agregar categoría');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<Category> & { id: string }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar categoría');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar categoría');
    },
  });

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}; 