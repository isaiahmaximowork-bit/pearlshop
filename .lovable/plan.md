# Superplano — Correção dos 4 Bugs Críticos do Studio UGC

Objetivo: garantir que o produto real apareça nas imagens, com identidade do avatar preservada, roupa completa e framing correto por pose.

---

## Bug #1 — Frontend envia UUID como `productName`

**Arquivos:** `src/pages/app/Studio.tsx`, `src/components/studio/StudioStepProduct.tsx`, `src/components/studio/StudioStepFinal.tsx`

1. Estender `StudioState` com os campos do produto:
   - `productName`, `productDescription`, `productCategory`, `productImageUrl`, `productImages: string[]`, `catalogProductId` (id em `catalog_products`).
2. Em `StudioStepProduct.tsx`, ao selecionar um produto (`handleSelect` e `StudioProductModal.onSelect`), passar o **objeto completo** do `user_products + catalog_products` em vez de só `item.id`. Popular todos os campos novos no estado.
3. Em `StudioStepFinal.tsx`, montar o payload da invocação de `generate-ugc` com os campos reais (`productName`, `productDescription`, `productCategory`, `productImageUrl`, `productImages`, `catalogProductId`) — remover o `productName: state.productId`.

## Bug #2 — Edge Function não enriquece o produto

**Arquivo:** `supabase/functions/generate-ugc/index.ts`

1. Criar helper `enrichProductData(input, admin)`:
   - Se `productName` veio e é diferente de `productId`, usar direto.
   - Caso contrário, fazer fallback `SELECT user_products JOIN catalog_products WHERE user_products.id = $productId` e devolver `{ productId, productName, description, category, imageUrl, images }`.
2. Chamar `enrichProductData` antes de inserir em `media_jobs` e usar os valores enriquecidos no `insert` (e nas chamadas dos agentes).
3. Migration: adicionar colunas em `media_jobs` para auditoria — `product_description text`, `product_category text`, `product_image_url text`, `product_mention text`, `clothing_description text`, `framing_type text`. Todas nullable.

## Bug #3 — Agente 1 ignora o produto

**Arquivo:** `supabase/functions/generate-ugc/index.ts` (constantes `CREATIVE_DIRECTOR_SYSTEM` e `MEDIA_GENERATOR_SYSTEM`)

1. Reescrever `CREATIVE_DIRECTOR_SYSTEM` com bloco **MANDATORY PRODUCT INCLUSION**:
   - Sempre citar `productName` no `masterPrompt`.
   - Descrever cor/material/categoria do produto.
   - Mapeamento de framing por `interaction`:
     - `wearing_product` → full-body, head-to-toe, roupa completa (tipo, cor, fit, material), calçado visível.
     - `holding_product` → medium shot, mãos com 5 dedos, produto em foco.
     - `unboxing` → close-up, embalagem visível.
     - `using_product` → medium close-up, ação clara.
2. Atualizar JSON de saída do Agente 1 para incluir: `masterPrompt`, `productMention` (string ≥5 chars), `clothingDescription`, `framingType` (`full-body|close-up|medium-shot|extreme-close-up`), `metadata.productIncluded`, `metadata.clothingComplete`.
3. Adicionar validação no handler: se `productMention` ausente/curta, lançar erro e marcar job como `failed` com `error_message` claro.
4. Atualizar `MEDIA_GENERATOR_SYSTEM` para preservar `productMention` e `clothingDescription` no `imagePrompt` final, e iniciar com:
   `"Using the FIRST attached image as the EXACT character reference (identity 100%), and the SECOND attached image as the EXACT product reference (same shape, color, material), generate: ..."`.
5. Persistir `master_prompt`, `product_mention`, `clothing_description`, `framing_type` em `media_jobs`.

## Bug #4 — Nano Banana recebe só 1 imagem

**Arquivo:** `supabase/functions/generate-ugc/index.ts` (função `generateImage`)

1. Mudar assinatura: `generateImage(prompt, avatarImageUrl, productImageUrl, apiKey)`.
2. Construir `content` multimodal com 3 elementos:
   - `{ type: "text", text: prompt }` (já com a instrução dual-reference do Agente 2).
   - `{ type: "image_url", image_url: { url: avatarImageUrl } }` — identidade.
   - `{ type: "image_url", image_url: { url: productImageUrl } }` — produto.
3. No handler, passar `enrichedProduct.productImageUrl` (com fallback para a primeira de `productImages`). Se faltar imagem do produto, fazer fallback gracioso para single-image (avatar) e registrar `warning`.
4. Manter modelo atual `google/gemini-3.1-flash-image-preview` (Nano Banana 2) e `modalities: ["image", "text"]`.

---

## Ordem de execução

1. Migration `media_jobs` (novas colunas).
2. Edge Function `generate-ugc` (enrichment + prompts + dual-image generateImage + validação).
3. `StudioState` + `StudioStepProduct` + `StudioStepFinal` (payload completo).
4. Deploy automático da edge function.

## Validação pós-deploy

- Network do navegador: payload tem `productName` real (não UUID).
- SQL: `SELECT product_name, product_mention, framing_type, image_prompt FROM media_jobs ORDER BY created_at DESC LIMIT 3;` → produto e framing corretos.
- Visual QA: gerar 1 job por interação (`wearing`, `holding`, `unboxing`) e conferir produto visível, identidade do avatar preservada, roupa não cortada.

## Detalhes técnicos

- Sem mudança de modelo de IA. Sem novos secrets.
- `referenceImageUrl` (avatar) continua sendo enviado como data URL pelo frontend; `productImageUrl` é URL pública do `catalog_products.image_url` (já hospedada).
- Backward compat: se um payload antigo chegar sem `productName`, o `enrichProductData` resolve via JOIN.
- RLS de `media_jobs` não muda; novas colunas são apenas nullable text.
