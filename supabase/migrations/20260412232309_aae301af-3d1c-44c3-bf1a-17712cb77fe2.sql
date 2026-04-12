
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS size_chart_url text,
  ADD COLUMN IF NOT EXISTS variants text,
  ADD COLUMN IF NOT EXISTS affiliate_link text,
  ADD COLUMN IF NOT EXISTS promo_info text;

-- Update existing vestido product with full details
UPDATE public.catalog_products
SET
  description = E'Vestido de Verão Elegante\n✨ Vestido de verão longo sem costas, com corte lateral alto. Perfeito para dias quentes. 🌞\n·Recorte na cintura: Ajusta-se suavemente, proporcionando um visual elegante.\n·Estampa floral: Adiciona um toque de natureza e frescor ao look.\nDesign Moderno e Confortável\n·Sem costas: Design moderno e confortável.\n·Corte lateral alto: Aumenta a elegância e liberdade de movimento.\nIdeal para Ocasiões Casuais\n·Verão: Perfeito para ocasiões casuais e festas de verão.\n·Estilo floral: Ideal para quem busca um look fresco e alegre.',
  images = ARRAY[
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/2e9c5d6ec4c04a1bbcfa84c43e9dc74f~tplv-aphluv4xwc-crop-webp:640:853.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/12f77a34858f4782bea3c3e7813592eb~tplv-aphluv4xwc-crop-webp:631:841.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/ffa9d8d870524e3587cd3b17d75ba980~tplv-aphluv4xwc-crop-webp:1428:1785.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/cc1fb15b068f40f18059b1e1c83d0d89~tplv-aphluv4xwc-crop-webp:1024:1365.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/161a45ce629847d4aa182159d1ef3e36~tplv-aphluv4xwc-crop-webp:1428:1785.webp'
  ],
  size_chart_url = 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/8dc3d4fdbf1c4f9796a6c79b9df98c08~tplv-aphluv4xwc-origin-jpeg.jpeg',
  variants = 'P, PP, M e G - cor Azul única',
  promo_info = 'Oferta ativa, 15% off em compras de R$ 39+',
  affiliate_link = 'https://vt.tiktok.com/ZS9RdYRotrXT3-qDJXX/',
  product_name = 'Vestido Verão Longo Estampa Floral Recorte na Cintura'
WHERE product_id = '1734328470004729723';

-- Insert Kit 03 Blusas product
INSERT INTO public.catalog_products (product_id, product_name, description, image_url, images, size_chart_url, variants, source_platform, status, is_verified)
VALUES (
  'kit-03-blusas-moderna',
  'Kit 03 Blusas Femininas Manga Curta',
  E'Você está prestes a adquirir um produto lindíssimo da marca Moderna.\nTemos mais de 200 mil estrelinhas e avaliações positivas no TikTok, mais de 1000 variações de produtos e uma ampla gama de cores e tamanhos.\n\nApresentamos a Ajustada, a peça essencial que combina estilo e conforto em perfeita harmonia. Confeccionada em tecido Fluído, ajustada para dar um realce a sua silhueta.\n\nTamanhos:\n(veste 36) - Tamanho P\n(veste 38) - Tamanho M\n(veste 40) - Tamanho G\n\nModelo Veste M:\nAltura: 1,77 | Busto: 90 | Cintura: 65 | Quadril: 100 | Peso: 64\n\nSobre o material:\n- Ajustado Justinha\n- Tecido Fluído\n- Composição: 92% Poliéster 8% Elastano\n- Não tem Bojo\n- Manga Curta\n- Justa no Corpo\n\nAs fotos e vídeos são reais. As modelos são contratadas pela marca.',
  'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/d263b862f9cd45c6a6161c5ab175a1ae~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
  ARRAY[
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/d263b862f9cd45c6a6161c5ab175a1ae~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/fa174c3eeda648b5985f5d277683132a~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/9dbb77a60b104edc81de5802827ce2cc~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/49037559d15f49cfab61a81cefa7b455~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/617cda9cce8740eb97ce9640ab4e3eb0~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/2870c9e9cf214cefa3606e45189d9308~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/9beaf8c391b646d49712a4e41b486494~tplv-aphluv4xwc-crop-webp:1200:1200.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/52e929e8cd124918947a56e1b3ad4329~tplv-aphluv4xwc-resize-webp:800:800.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/77ec91d97d724aa38fbb2dbc531ec312~tplv-aphluv4xwc-resize-webp:800:800.webp',
    'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/c4ea0a9ebf574134adf244cd2d79e622~tplv-aphluv4xwc-resize-webp:800:800.webp',
    'https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/78f04c70680c4c6cafb95023f832777d~tplv-o3syd03w52-resize-webp:800:800.webp'
  ],
  'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/07508636d3264420a867bf05f524e93d~tplv-aphluv4xwc-origin-jpeg.jpeg',
  'Tamanhos P, M e G. Combinações de cores: preto+marrom+nude, preto+marrom+rosa, preto+marrom+vermelho, preto+marrom+cinza, preto+marrom+azul claro, preto+marrom+azul escuro, preto+marrom+verde, preto+marrom+branco, preto+marrom+azaleia, preto+marrom+violeta, preto+marrom+bordô',
  'tiktok_shop',
  'active',
  true
);
