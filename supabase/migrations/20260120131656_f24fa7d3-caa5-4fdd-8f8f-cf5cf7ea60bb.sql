-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true);

-- Storage policies for products bucket
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for categories bucket
CREATE POLICY "Public can view category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'categories');

CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'categories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update category images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'categories' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete category images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'categories' AND public.has_role(auth.uid(), 'admin'));