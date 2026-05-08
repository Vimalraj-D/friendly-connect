
-- 1) Order price integrity: overwrite product_price + product_name from products on insert
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price numeric;
  v_name text;
  v_active boolean;
BEGIN
  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'product_id is required';
  END IF;

  SELECT price, name, COALESCE(is_active, true)
    INTO v_price, v_name, v_active
  FROM public.products
  WHERE id = NEW.product_id;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Product % not found', NEW.product_id;
  END IF;
  IF NOT v_active THEN
    RAISE EXCEPTION 'Product % is not available', NEW.product_id;
  END IF;
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;

  NEW.product_price := v_price;
  NEW.product_name := v_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_order_item_price ON public.order_items;
CREATE TRIGGER trg_enforce_order_item_price
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_item_price();

-- 2) Recompute orders.total from items after insert/update/delete on order_items
CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);
  UPDATE public.orders
     SET total = COALESCE((
           SELECT SUM(product_price * quantity)
           FROM public.order_items
           WHERE order_id = v_order_id
         ), 0),
         updated_at = now()
   WHERE id = v_order_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_order_total ON public.order_items;
CREATE TRIGGER trg_recompute_order_total
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_order_total();

-- 3) Privilege escalation: explicit RLS on user_roles for INSERT/UPDATE/DELETE (admin-only)
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4) Admins can also INSERT/DELETE orders (SELECT/UPDATE already covered)
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
CREATE POLICY "Admins can insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5) Lock down has_role: only callable by postgres / RLS context, not anon/authenticated directly
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
