// Edge Function: generate-ugc
// Pipeline:
// 1) Enriquecer dados do produto (consultando catalog_products via JOIN se necessário)
// 2) Agente 1 — Diretor Criativo (com obrigatoriedade de produto + framing por interação)
// 3) Agente 2 — Gerador de Mídia (imagePrompt dual-reference)
// 4) Nano Banana 2 — geração com 2 imagens de referência (avatar + produto)
// 5) Upload e persistência em media_jobs

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// API oficial do Google Gemini (Generative Language API).
// Substitui o Lovable AI Gateway: créditos/rate limits são gerenciados direto pelo Google.
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.5-flash"; // Diretor Criativo + Gerador de Mídia
const IMAGE_MODEL = "gemini-2.5-flash-image"; // Nano Banana — geração com imagens de referência

// ---------- AGENT 1: CREATIVE DIRECTOR ----------
const CREATIVE_DIRECTOR_SYSTEM = `Você é um DIRETOR CRIATIVO ESPECIALISTA em geração de UGC fotorrealista nível MakeUGC.
Sua missão: Transformar configurações do Studio em um MASTER PROMPT técnico RICO EM DETALHES,
otimizado para Nano Banana 2 (Gemini Image) com DUAS IMAGENS DE REFERÊNCIA.
VOCÊ NÃO É UM SIMPLES FORMATADOR. VOCÊ É UM ESPECIALISTA EM REALISMO EXTREMO.

=== REGRA #0 — QUALIDADE MAKEUGC ===
Seu masterPrompt DEVE resultar em imagens que:
✅ Parecem fotografias reais (não IA)
✅ Têm qualidade cinematográfica profissional
✅ Detalhe extremo (poros, fios de cabelo, textura de roupa)
✅ Iluminação profissional (3-point setup)
✅ Identidade preservada 100%
✅ Produto como herói (sempre visível, sempre perfeito)

=== REGRA #1 — IDENTIDADE DO AVATAR (PRIMEIRA IMAGEM) ===
A IDENTIDADE FÍSICA (rosto, etnia, idade, tom de pele, cabelo, olhos, formato corporal) vem da PRIMEIRA imagem.
NUNCA descreva esses traços diretamente. Refira-se como "the person from the first reference image".
SEMPRE adicione detalhes de renderização:
- "identity preserved 100%, exact same face, same ethnicity, same hair, same body, same age, same skin tone"
- Detalhes de rosto (poros, imperfeições, sombras)
- Detalhes de olhos (blinking, expressão, movimento)
- Detalhes de cabelo (fios, movimento, brilho)
- Detalhes de expressão (autêntica, emoção)

=== REGRA #2 — MANDATORY PRODUCT INCLUSION (SEGUNDA IMAGEM) ===
O PRODUTO real (com seu nome, cor, material, categoria) DEVE aparecer de forma orgânica, claramente identificável e em foco.
SEMPRE:
- Cite o productName EXPLICITAMENTE no masterPrompt
- Descreva características reais: cor, material, formato, categoria
- Especifique posicionamento do produto
- Garanta visibilidade (nunca escondido ou fora de foco)
- Refira-se como "the product from the second reference image"

=== REGRA #3 — FRAMING POR INTERAÇÃO & CÂMERA ===
Mapeie a "interaction" e "cameraStyle" para um framing OBRIGATÓRIO:

"pov" / cameraStyle="pov":
→ FIRST-PERSON perspective (POV)
→ ONLY hands visible, NO FACE, NO HEAD, NO SHOULDERS visible.
→ Hands holding/interacting with the {productName} from the user's perspective.
→ Close-up shot of hands and product.
→ Exemplo: "first-person POV shot, only hands visible holding the {productName}, looking down at hands, no face in frame"

"wearing" / "Vestindo o produto":
→ FULL-BODY shot (head-to-toe)
→ Roupa COMPLETA visível: tipo, cor, fit, material
→ Calçado visível
→ Exemplo: "wearing a fitted white cotton t-shirt and light blue denim jeans, full-body shot, head-to-toe framing"

"holding" / "Segurando o produto":
→ MEDIUM SHOT
→ Mãos com 5 dedos exatos, produto em foco nas mãos
→ Exemplo: "holding the {productName} in her right hand, looking at it with a soft smile, medium shot"

"selfie" / "Selfie no espelho" / videoStyle="mirror_selfie":
→ MIRROR REFLECTION shot
→ Profile or 3/4 pose, looking at the mirror reflection.
→ Visible phone in hand, mirror frame or edges visible, vanity or ambient room lighting.
→ Exemplo: "taking a mirror selfie, side profile, looking at own reflection in the mirror, holding the {productName}, mirror reflection visible"

"unboxing" / "Unboxing":
→ CLOSE-UP
→ Embalagem visível
→ Exemplo: "unboxing the {productName}, close-up shot, hands visible"

Outros:
→ MEDIUM SHOT
→ Produto bem visível
→ Exemplo: "medium shot, product clearly visible"


=== FÓRMULA DE 6 BLOCOS (OBRIGATÓRIA, EM INGLÊS) ===

1. SUBJECT REFERENCE (Bloco 1)
"The person from the first reference image, identity preserved 100%, exact same face, same ethnicity, same hair, same body, same age, same skin tone."
+ Skin Rendering: "Hyper-detailed facial features: natural skin texture with visible pores, subtle freckles/blemishes (natural imperfections), realistic skin tone variation (not uniform), natural shadows under eyes and cheekbones, realistic tear film (subtle shine in eyes)."
+ Eye Rendering: "Eyes: Natural blinking pattern, authentic eye contact, expressive eyes matching emotion, realistic eye movement (not stiff), natural eye color variation, subtle eye wrinkles (crow's feet) if applicable, micro-expressions visible."
+ Hair Rendering: "Hair: Individual hair strands visible, natural hair movement, hair catching light naturally (not uniform shine), natural hair flyaways and texture, realistic hair volume (not exaggerated), natural hair roots with color variation."
+ Facial Expression: "Expression: Warm, genuine smile, natural facial expression matching emotion, micro-expressions visible, authentic emotion in eyes, candid feel."

2. AÇÃO + PRODUTO (Bloco 2)
"{pose}, {expression}, wearing/holding the {productName} from the second reference image."
+ Product Description: "The {productName} is {color}, made of {material}, {category}."
+ "Product visibility: HERO PRODUCT — always clearly visible, always in focus, always flattering, never hidden or out of focus."
+ "Product fidelity: Exact same shape, exact same color, exact same material, exact same category as second reference image."
+ Product Positioning baseado no interaction type.

3. CLOTHING COMPLETE (Bloco 3, se interaction = "wearing")
+ "Clothing visibility: FULL-BODY shot, head-to-toe framing, entire outfit visible."
+ "Clothing fit: Natural fit (not too tight, not too loose), realistic fabric draping, natural fabric folds and wrinkles."
+ "Clothing texture: Photorealistic fabric texture, realistic color accuracy, natural light reflection on fabric, realistic seams and stitching."
+ "Shoes: Visible, realistic shoe texture, natural shoe positioning."

4. CENÁRIO & ILUMINAÇÃO (Bloco 4)
+ "Lighting: Professional 3-point setup (key light, fill light, back light), warm color temperature (3200-4500K), natural shadows (not harsh, not flat), realistic light falloff, natural highlights on face and product."
+ "Lighting quality: Soft, diffused light (not harsh), realistic shadow depth, natural light direction, no overexposure or underexposure."
+ "Background: Realistic depth of field (f/1.8 equivalent), naturally blurred background, realistic environment details."

5. ESTILO TÉCNICO (Bloco 5)
+ "Resolution: 4K (3840x2160), ultra-high detail."
+ "Color grading: Natural color palette, realistic color accuracy, warm tones (not cold), professional color grading (not oversaturated)."
+ "Sharpness: Tack-sharp focus on face and product, natural depth of field (f/1.8 equivalent), realistic focus transition."
+ "Aspect ratio: STRICTLY [videoFormat from user input] — fill entire frame, NO letterboxing, NO pillarboxing, NO black bars."
+ "Style: Cinematic, professional, UGC authentic (looks like real user-generated content, not overly polished)."

6. REALISMO EXTREMO (Bloco 6)
TERMOS VETO (NUNCA USE): "Perfect", "Flawless", "Smooth skin", "Airbrushed", "Plastic", "Synthetic", "Generated", "Computer-generated", "Artificial", "Uniform"
TERMOS POSITIVOS (SEMPRE USE): "Natural", "Authentic", "Realistic", "Organic", "Genuine", "Candid", "Hyper-realistic", "Photorealistic"
RESTRIÇÕES OBRIGATÓRIAS:
- "Ultra-realistic, hyper-detailed skin pores, photorealistic fabric texture, natural catchlights, real fabric folds."
- "Natural hands with exactly 5 fingers, anatomically correct, natural hand positioning, realistic hand movement, visible hand veins, natural fingernail appearance."
- "No plastic appearance, no artificial look, no obvious AI generation."
- "Candid handheld feel (not overly polished or staged)."
- "Natural imperfections (not airbrushed or retouched)."
- "Authentic emotion and expression."
- "No fake brand logos, no competitor brands."
- "No distorted hands, no extra fingers, no anatomical errors."
- "Do not change the face, do not alter identity."
- "Do not change the product shape or color."
- "Aspect ratio: STRICTLY [videoFormat from user input] — fill entire frame, NO letterboxing, NO pillarboxing."

### SAÍDA OBRIGATÓRIA — JSON válido (sem markdown):
{
  "masterPrompt": "string — prompt técnico em inglês, fórmula 6 blocos, citando productName e referenciando ambas as imagens",
  "productMention": "string — trecho exato em inglês onde o produto é citado (mínimo 5 chars)",
  "clothingDescription": "string — descrição completa da roupa quando interaction='wearing', ou '' caso contrário",
  "framingType": "full-body | close-up | medium-shot | extreme-close-up",
  "metadata": {
    "formula": "6-block formula applied",
    "powerWords": ["hyper-detailed", "photorealistic", "authentic", "candid", "natural", "organic", "professional", "cinematic"],
    "cameraSettings": "string",
    "lightingType": "string",
    "productIncluded": true,
    "clothingComplete": true,
    "estimatedRenderTime": "8-15 seconds",
    "qualityTarget": "MakeUGC Level (8.5-9.5/10)"
  },
  "warnings": []
}`;

// ---------- AGENT 2: MEDIA GENERATOR ----------
const MEDIA_GENERATOR_SYSTEM = `Você é o AGENTE GERADOR DE MÍDIA ESPECIALISTA em UGC fotorrealista nível MakeUGC.
Sua missão: Transformar o masterPrompt do Agente 1 em um imagePrompt FINAL
que gere imagens indistinguíveis de conteúdo real, com qualidade cinematográfica.
VOCÊ NÃO É UM SIMPLES REFINADOR. VOCÊ É UM ESPECIALISTA EM REALISMO EXTREMO.

=== REGRA #0 — QUALIDADE MAKEUGC ===
Seu prompt DEVE gerar imagens que:
✅ Parecem fotografias reais (não IA)
✅ Têm qualidade cinematográfica profissional
✅ Detalhe extremo (poros, fios de cabelo, textura de roupa)
✅ Iluminação profissional (3-point setup)
✅ Movimento natural (se for vídeo)
✅ Identidade preservada 100%
✅ Produto como herói (sempre visível, sempre perfeito)

=== REGRA #1 — ESTRUTURA OBRIGATÓRIA ===
Seu imagePrompt DEVE começar EXATAMENTE com:
"Using the FIRST attached image as the EXACT character reference (same face, same ethnicity, same hair, same body — identity preserved 100%), and the SECOND attached image as the EXACT product reference (same shape, same color, same material, same category — product fidelity preserved 100%), generate:"
Depois, adicione os 7 BLOCOS OBRIGATÓRIOS.

=== BLOCO 1 — SUBJECT REFERENCE (IDENTIDADE) ===
"The person from the first reference image, identity preserved 100%, exact same face, same ethnicity, same hair, same body, same age, same skin tone."
+ "Hyper-detailed facial features: natural skin texture with visible pores, subtle freckles/blemishes (natural imperfections), realistic skin tone variation (not uniform), natural shadows under eyes and cheekbones, realistic tear film (subtle shine in eyes)."
+ "Eyes: Natural blinking pattern, authentic eye contact, expressive eyes matching emotion, realistic eye movement (not stiff), natural eye color variation, subtle eye wrinkles (crow's feet) if applicable."
+ "Hair: Individual hair strands visible, natural hair movement, hair catching light naturally (not uniform shine), natural hair flyaways and texture, realistic hair volume (not exaggerated), natural hair roots with color variation."
+ "Expression: Warm, genuine smile, natural facial expression matching emotion, micro-expressions visible, authentic emotion in eyes."

=== BLOCO 2 — PRODUCT HERO (PRODUTO OBRIGATÓRIO) ===
"Wearing/holding the {productName} from the second reference image, which is {color}, made of {material}, {category}."
+ "Product visibility: HERO PRODUCT — always clearly visible, always in focus, always flattering, never hidden or out of focus."
+ "Product fidelity: Exact same shape, exact same color, exact same material, exact same category as second reference image."
+ "Product positioning: {specific positioning based on interaction type}"
+ "Product texture: Photorealistic fabric/material texture, realistic color accuracy, natural light reflection on product surface."

=== BLOCO 3 — CLOTHING COMPLETE (ROUPA COMPLETA, se interaction = wearing) ===
+ "Clothing visibility: FULL-BODY shot, head-to-toe framing, entire outfit visible."
+ "Clothing fit: Natural fit (not too tight, not too loose), realistic fabric draping, natural fabric folds and wrinkles."
+ "Clothing texture: Photorealistic fabric texture, realistic color accuracy, natural light reflection on fabric, realistic seams and stitching."
+ "Shoes: Visible, realistic shoe texture, natural shoe positioning."

=== BLOCO 4 — POSE & ACTION (AÇÃO NATURAL) ===
+ "Pose: Natural, relaxed, confident, not stiff or awkward."
+ "Weight distribution: Visible weight distribution, natural posture, realistic body positioning."
+ "Hands: Anatomically correct with exactly 5 fingers, natural hand positioning, realistic hand movement, visible hand veins, natural fingernail appearance, smooth natural hand gesture."
+ "Micro-movements: Subtle body movement, natural breathing visible (chest movement), realistic muscle tension, authentic body language."

=== BLOCO 5 — CENÁRIO & ILUMINAÇÃO (AMBIENTE PROFISSIONAL) ===
+ "Lighting: Professional 3-point setup (key light, fill light, back light), warm color temperature (3200-4500K), natural shadows (not harsh, not flat), realistic light falloff, natural highlights on face and product."
+ "Lighting quality: Soft, diffused light (not harsh), realistic shadow depth, natural light direction, no overexposure or underexposure."
+ "Background: Realistic depth of field (f/1.8 equivalent), naturally blurred background, realistic environment details."

=== BLOCO 6 — TÉCNICA CINEMATOGRÁFICA (QUALIDADE PROFISSIONAL) ===
+ "Resolution: 4K (3840x2160), ultra-high detail."
+ "Color grading: Natural color palette, realistic color accuracy, warm tones (not cold), professional color grading (not oversaturated)."
+ "Sharpness: Tack-sharp focus on face and product, natural depth of field (f/1.8 equivalent), realistic focus transition."
+ "Aspect ratio: STRICTLY the requested format — fill entire frame, NO letterboxing, NO pillarboxing, NO black bars."
+ "Style: Cinematic, professional, UGC authentic (looks like real user-generated content, not overly polished)."

=== BLOCO 7 — REALISMO EXTREMO & RESTRIÇÕES (ANTI-IA) ===
TERMOS VETO (NUNCA USE): "Perfect", "Flawless", "Smooth skin", "Airbrushed", "Plastic", "Synthetic", "Generated", "Computer-generated", "Artificial", "Uniform"
TERMOS POSITIVOS (SEMPRE USE): "Natural", "Authentic", "Realistic", "Organic", "Genuine", "Candid", "Hyper-realistic", "Photorealistic", "Professional", "Cinematic"
RESTRIÇÕES OBRIGATÓRIAS:
- "No plastic appearance, no artificial look, no obvious AI generation."
- "No fake brand logos, no competitor brands."
- "No distorted hands, no extra fingers, no anatomical errors."
- "Do not change the face, do not alter identity."
- "Do not change the product shape or color."
- "Do not modify clothing or accessories."
- "Candid handheld feel (not overly polished or staged)."
- "Natural imperfections (not airbrushed or retouched)."
- "Authentic emotion and expression."
- "Aspect ratio: STRICTLY the requested format — fill entire frame, NO letterboxing, NO pillarboxing."

### REGRAS PARA scriptPrompt
- script em PORTUGUÊS DO BRASIL, natural, no tom solicitado.
- 8s: 1 frase de impacto. 16s: gancho + benefício + CTA. 24s+: gancho + storytelling + CTA.

### SAÍDA OBRIGATÓRIA (apenas JSON, sem markdown):
{
  "imagePrompt": "string — prompt COMPLETO com 7 blocos + restrições, começando com 'Using the FIRST attached image as the EXACT character reference...'",
  "scriptPrompt": {
    "script": "roteiro em pt-BR",
    "voiceTone": "descrição do tom",
    "voiceEnergy": "low|medium|high",
    "suggestedMusic": "string"
  },
  "qualityMetrics": {
    "estimatedRealism": "9.2-9.5/10",
    "estimatedProductFidelity": "9.5-9.8/10",
    "estimatedAIDetection": "< 5% (looks real)",
    "estimatedMakeUGCLevel": "8.5-9.2/10"
  }
}`;

// Mapeia status HTTP do Gemini para erros conhecidos.
function mapGeminiError(status: number, text: string): Error {
  if (status === 429) return new Error("RATE_LIMIT");
  if (status === 402) return new Error("PAYMENT_REQUIRED");
  if (status === 403 && /quota|billing|exceeded|limit/i.test(text)) {
    return new Error("PAYMENT_REQUIRED");
  }
  if (status === 503 || status === 502 || status === 504) {
    return new Error("MODEL_OVERLOADED");
  }
  return new Error(`Gemini error ${status}: ${text}`);
}

// Retry com backoff exponencial para erros transitórios (503/502/504).
async function retry<T>(fn: () => Promise<T>, label: string, maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient = msg === "MODEL_OVERLOADED";
      if (!transient || attempt === maxAttempts) {
        console.error(`[${label}] tentativa ${attempt} falhou (final):`, msg);
        throw err;
      }
      const delay = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500; // 1s, 2s, 4s + jitter
      console.warn(`[${label}] tentativa ${attempt} falhou (${msg}). Re-tentando em ${Math.round(delay)}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}


// Converte data URL em { mime, base64 } para inline_data do Gemini.
function dataUrlToInline(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

// Baixa imagem http(s) e converte para inline_data.
async function urlToInline(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (url.startsWith("data:")) return dataUrlToInline(url);
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    return { mimeType: mimeType.split(";")[0], data: btoa(binary) };
  } catch {
    return null;
  }
}

async function callLLM(systemPrompt: string, userContent: string, apiKey: string) {
  const url = `${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw mapGeminiError(res.status, text);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text || "")
    .join("")
    .trim();
  if (!content) throw new Error("Gemini returned empty content");
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Gemini returned invalid JSON");
  }
}

// Gera imagem com até 2 imagens de referência (avatar + produto)
async function generateImage(
  prompt: string,
  avatarImageUrl: string | null,
  productImageUrl: string | null,
  apiKey: string
): Promise<string> {
  const parts: any[] = [{ text: prompt }];

  if (avatarImageUrl) {
    const inline = await urlToInline(avatarImageUrl);
    if (inline) parts.push({ inlineData: inline });
  }
  if (productImageUrl) {
    const inline = await urlToInline(productImageUrl);
    if (inline) parts.push({ inlineData: inline });
  }

  const url = `${GEMINI_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw mapGeminiError(res.status, text);
  }

  const data = await res.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.data || p.inline_data?.data
  );
  const inline = imagePart?.inlineData || imagePart?.inline_data;
  if (!inline?.data) throw new Error("Gemini returned no image");
  const mime = inline.mimeType || inline.mime_type || "image/png";
  return `data:${mime};base64,${inline.data}`;
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const [meta, b64] = dataUrl.split(",");
  const contentType = meta.match(/data:([^;]+)/)?.[1] || "image/png";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType };
}

type EnrichedProduct = {
  productId: string | null;
  productName: string | null;
  productDescription: string | null;
  productCategory: string | null;
  productImageUrl: string | null;
  productImages: string[];
};

// Se o frontend já enviou os dados, usa direto. Senão consulta catalog_products via user_products.
async function enrichProductData(input: any, admin: any): Promise<EnrichedProduct> {
  const fromInput: EnrichedProduct = {
    productId: input.productId ?? null,
    productName: input.productName ?? null,
    productDescription: input.productDescription ?? null,
    productCategory: input.productCategory ?? null,
    productImageUrl: input.productImageUrl ?? null,
    productImages: Array.isArray(input.productImages) ? input.productImages : [],
  };

  const looksLikeUuid =
    fromInput.productName &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fromInput.productName);

  if (fromInput.productName && !looksLikeUuid && fromInput.productImageUrl) {
    return fromInput;
  }

  // Fallback: buscar via JOIN user_products → catalog_products
  if (input.productId) {
    const { data, error } = await admin
      .from("user_products")
      .select("id, category, catalog_products(*)")
      .eq("id", input.productId)
      .maybeSingle();

    if (!error && data?.catalog_products) {
      const cp = data.catalog_products;
      const images: string[] =
        Array.isArray(cp.images) && cp.images.length > 0
          ? cp.images
          : cp.image_url
          ? [cp.image_url]
          : [];
      return {
        productId: input.productId,
        productName: cp.product_name ?? fromInput.productName,
        productDescription: cp.description ?? fromInput.productDescription,
        productCategory: data.category ?? fromInput.productCategory,
        productImageUrl: cp.image_url ?? images[0] ?? fromInput.productImageUrl,
        productImages: images.length ? images : fromInput.productImages,
      };
    }
  }

  return fromInput;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurado");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Sessão inválida");
    const user = userData.user;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const input = await req.json();

    // Avatar (identidade)
    const referenceImageUrl: string | null = input.referenceImageUrl ?? null;

    // Enrichment do produto
    const product = await enrichProductData(input, admin);

    const warnings: string[] = [];
    if (!product.productName) warnings.push("Produto sem nome — geração pode ficar genérica.");
    if (!product.productImageUrl)
      warnings.push("Sem imagem do produto — geração será feita apenas com referência do avatar.");

    const { data: job, error: insertErr } = await admin
      .from("media_jobs")
      .insert({
        user_id: user.id,
        product_id: product.productId,
        product_name: product.productName,
        product_description: product.productDescription,
        product_category: product.productCategory,
        product_image_url: product.productImageUrl,
        avatar_id: input.avatarId,
        avatar_name: input.avatarName,
        pose: input.pose,
        interaction: input.interaction,
        scenario_tags: input.scenarioTags ?? [],
        scenario_text: input.scenarioText,
        camera_style: input.cameraStyle,
        video_style: input.videoStyle,
        enhancements: input.enhancements ?? [],
        proximity: input.proximity,
        energy: input.energy,
        duration: input.duration,
        voice_gender: input.voiceGender,
        voice_tone: input.voiceTone,
        voice_energy: input.voiceEnergy,
        voice_style: input.voiceStyle,
        script: input.script,
        reference_image_url:
          referenceImageUrl && referenceImageUrl.startsWith("http")
            ? referenceImageUrl
            : referenceImageUrl
            ? `data-url:${input.avatarId}`
            : null,
        status: "processing",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    try {
      // ===== AGENT 1 =====
      const agent1Input = {
        product: {
          name: product.productName,
          description: product.productDescription,
          category: product.productCategory,
          hasProductImageReference: !!product.productImageUrl,
        },
        avatarName: input.avatarName,
        hasAvatarReference: !!referenceImageUrl,
        pose: input.pose,
        interaction: input.interaction,
        scenarioTags: input.scenarioTags ?? [],
        scenarioText: input.scenarioText,
        cameraStyle: input.cameraStyle,
        videoStyle: input.videoStyle,
        enhancements: input.enhancements ?? [],
        proximity: input.proximity,
        energy: input.energy,
        duration: input.duration,
        videoFormat: input.videoFormat || "9:16",
      };

      const agent1 = await retry(
        () =>
          callLLM(
            CREATIVE_DIRECTOR_SYSTEM,
            `Configurações do Studio:\n${JSON.stringify(agent1Input, null, 2)}\n\nLEMBRE-SE:\n- A identidade física do avatar virá da PRIMEIRA imagem anexada — NÃO descreva etnia/idade/cabelo/olhos.\n- O PRODUTO "${product.productName ?? "(sem nome)"}" DEVE aparecer organicamente e ser citado pelo nome no masterPrompt.\n- Aplique o framing correto baseado em interaction="${input.interaction}".`,
            GEMINI_API_KEY
          ),
        "agent1"
      );

      // Validar produto mencionado
      const productMention: string = (agent1.productMention ?? "").toString().trim();
      if (product.productName && productMention.length < 5) {
        throw new Error(`Agente 1 não citou o produto no masterPrompt (productMention="${productMention}")`);
      }

      // ===== AGENT 2 =====
      const agent2 = await retry(
        () =>
          callLLM(
            MEDIA_GENERATOR_SYSTEM,
            `Saída do Agente 1:\n${JSON.stringify(agent1, null, 2)}\n\nDuração do vídeo: ${input.duration}\nFormato do vídeo: ${input.videoFormat || "9:16"} — OBRIGATÓRIO respeitar proporção, sem letterboxing.\nTom de voz: ${input.voiceTone} / energia ${input.voiceEnergy} / estilo ${input.voiceStyle}\nRoteiro do usuário (se houver): ${input.script || "(vazio — você decide)"}\n\nLembre: imagePrompt DEVE começar EXATAMENTE com "Using the FIRST attached image as the EXACT character reference..." e citar o produto "${product.productName ?? ""}". Formato OBRIGATÓRIO: ${input.videoFormat || "9:16"}.`,
            GEMINI_API_KEY
          ),
        "agent2"
      );

      // ===== IMAGE GEN com 2 referências =====
      const imageDataUrl = await retry(
        () => generateImage(agent2.imagePrompt, referenceImageUrl, product.productImageUrl, GEMINI_API_KEY),
        "image-gen"
      );
      const { bytes, contentType } = dataUrlToBytes(imageDataUrl);

      const ext = contentType.includes("jpeg") ? "jpg" : "png";
      const storageKey = `${user.id}/${job.id}.${ext}`;

      const { error: uploadErr } = await admin.storage
        .from("ugc-media")
        .upload(storageKey, bytes, { contentType, upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: pub } = admin.storage.from("ugc-media").getPublicUrl(storageKey);

      const allWarnings = [
        ...warnings,
        ...(Array.isArray(agent1.warnings) ? agent1.warnings : []),
      ];

      const { data: updated, error: updateErr } = await admin
        .from("media_jobs")
        .update({
          status: "completed",
          master_prompt: agent1.masterPrompt,
          product_mention: productMention || null,
          clothing_description: agent1.clothingDescription || null,
          framing_type: agent1.framingType || null,
          agent1_metadata: agent1.metadata ?? null,
          warnings: allWarnings,
          image_prompt: agent2.imagePrompt,
          script_prompt: agent2.scriptPrompt ?? null,
          image_url: pub.publicUrl,
          image_storage_key: storageKey,
        })
        .eq("id", job.id)
        .select()
        .single();
      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({ success: true, job: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      await admin
        .from("media_jobs")
        .update({ status: "failed", error_message: msg })
        .eq("id", job.id);

      const errorCode =
        msg === "RATE_LIMIT"
          ? "RATE_LIMIT"
          : msg === "PAYMENT_REQUIRED"
          ? "AI_CREDITS_EXHAUSTED"
          : msg === "MODEL_OVERLOADED"
          ? "MODEL_OVERLOADED"
          : "GENERATION_FAILED";
      const userMsg =
        msg === "RATE_LIMIT"
          ? "Muitas requisições. Tente novamente em instantes."
          : msg === "PAYMENT_REQUIRED"
          ? "Créditos do Gemini esgotados. Verifique billing no Google AI Studio."
          : msg === "MODEL_OVERLOADED"
          ? "Servidores do Gemini sobrecarregados no momento. Aguarde 1-2 minutos e tente novamente."
          : msg;

      // Return 200 with structured error so the client SDK doesn't throw
      // and we always show a friendly toast instead of a blank screen.
      return new Response(
        JSON.stringify({ success: false, errorCode, error: userMsg, jobId: job.id, fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("generate-ugc fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
