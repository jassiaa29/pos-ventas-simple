-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS public.generate_sale_number(UUID);

-- Recrear la función con permisos mejorados
CREATE OR REPLACE FUNCTION public.generate_sale_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  generated_sale_number TEXT;
BEGIN
  -- Validar que el UUID del usuario no sea nulo
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'user_uuid cannot be null';
  END IF;
  
  -- Obtener el siguiente número de venta para este usuario
  SELECT COALESCE(MAX(CAST(SUBSTRING(sales.sale_number FROM '^V(\d+)$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales
  WHERE sales.user_id = user_uuid
    AND sales.sale_number ~ '^V\d+$'; -- Solo considerar números con formato V###
  
  -- Si no se encontró ningún número, empezar desde 1
  IF next_number IS NULL THEN
    next_number := 1;
  END IF;
  
  -- Generar el número de venta con formato V001, V002, etc.
  generated_sale_number := 'V' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN generated_sale_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos explícitos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.generate_sale_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_sale_number(UUID) TO anon;

-- Comentario para documentar la función
COMMENT ON FUNCTION public.generate_sale_number(UUID) IS 'Genera un número de venta único con formato V001, V002, etc. para un usuario específico'; 