
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
  };
}

export const useProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const addProduct = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding product:', error);
      toast.error('Error al agregar producto');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    },
  });

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
