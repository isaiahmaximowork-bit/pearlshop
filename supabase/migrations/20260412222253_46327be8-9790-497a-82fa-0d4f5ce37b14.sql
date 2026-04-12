INSERT INTO public.catalog_products (product_id, product_name, image_url, source_platform, status, is_verified, raw_payload)
VALUES (
  '1734328470004729723',
  'Vestido de verão longo sem costas com corte lateral alto, recorte na cintura e estampa floral',
  'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/2e9c5d6ec4c04a1bbcfa84c43e9dc74f~tplv-aphluv4xwc-resize-webp:260:260.webp?dr=15582&t=555f072d&ps=933b5bde&shp=7745054a&shcp=9b759fb9&idc=my2&from=2001012042',
  'tiktok_shop',
  'active',
  false,
  '{"product_url": "https://www.tiktok.com/view/product/1734328470004729723"}'::jsonb
)
ON CONFLICT (source_platform, product_id) DO UPDATE SET
  product_name = EXCLUDED.product_name,
  image_url = EXCLUDED.image_url,
  raw_payload = EXCLUDED.raw_payload,
  updated_at = now();