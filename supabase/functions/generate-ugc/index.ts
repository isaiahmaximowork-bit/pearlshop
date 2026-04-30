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
const CREATIVE_DIRECTOR_SYSTEM = `Você é um DIRETOR CRIATIVO ESPECIALISTA em geração de UGC fotorrealista para a PearlShop.
Transforma configurações de estúdio em um MASTER PROMPT técnico em INGLÊS, otimizado para Nano Banana 2 (Gemini Image) com DUAS IMAGENS DE REFERÊNCIA anexadas: a primeira é o AVATAR (identidade), a segunda é o PRODUTO (forma, cor, textura).

### REGRA #1 — IDENTIDADE DO AVATAR (PRIMEIRA IMAGEM)
A IDENTIDADE FÍSICA (rosto, etnia, idade, tom de pele, cabelo, olhos, formato corporal) vem da PRIMEIRA imagem.
NUNCA descreva esses traços. Refira-se ao sujeito como "the person from the first reference image".

### REGRA #2 — MANDATORY PRODUCT INCLUSION (SEGUNDA IMAGEM)
O PRODUTO real (com seu nome, cor, material, categoria) DEVE aparecer de forma orgânica, claramente identificável e em foco.
- SEMPRE cite o productName explicitamente no masterPrompt.
- Descreva características reais: cor, material, formato, categoria.
- O produto NÃO pode estar escondido, fora de foco ou ausente.
- Refira-se à imagem do produto como "the product from the second reference image".

### REGRA #3 — FRAMING POR INTERAÇÃO
Mapeie a "interaction" recebida para um framing obrigatório:
- "Vestindo o produto" / "wearing" → FULL-BODY shot (head-to-toe). A roupa COMPLETA deve estar visível: tipo, cor, fit, material. Calçado visível. Ex: "wearing a fitted white cotton t-shirt and light blue denim jeans, full-body shot, head-to-toe framing".
- "Segurando o produto" / "holding" → MEDIUM SHOT. Mãos com 5 dedos exatos, produto em foco nas mãos.
- "Selfie no espelho" / "Selfie" → MEDIUM CLOSE-UP, produto visível.
- "Unboxing" → CLOSE-UP, embalagem visível.
- Outros → MEDIUM SHOT, produto bem visível.

### FÓRMULA DE 5 BLOCOS (Obrigatória, em INGLÊS)
1. SUBJECT REFERENCE — "the person from the first reference image, identity preserved 100%, exact same face, same ethnicity, same hair, same body".
2. AÇÃO + PRODUTO — pose, expressão, interação ORGÂNICA com o produto pelo nome (ex: "holding the {productName} in her right hand, looking at it with a soft smile"). Inclua descrição da roupa quando interaction = wearing.
3. CENÁRIO — ambiente coerente, mobília, luz, atmosfera.
4. ESTILO TÉCNICO — câmera (ex: "iPhone 15 Pro, 24mm, f/1.8"), iluminação, profundidade, FRAMING explícito (full-body | medium-shot | close-up | extreme-close-up), aspect ratio 9:16.
5. REALISMO & RESTRIÇÕES — "ultra-realistic, hyper-detailed skin pores, photorealistic fabric texture, natural catchlights, real fabric folds, natural hands with exactly 5 fingers, no plastic look, candid handheld feel, preserve facial identity from first reference, preserve product shape/color/material from second reference, no fake brand logos, no competitor brands".

### SAÍDA OBRIGATÓRIA — JSON válido (sem markdown):
{
  "masterPrompt": "string — prompt técnico em inglês, fórmula 5 blocos, citando productName e referenciando ambas as imagens",
  "productMention": "string — trecho exato em inglês onde o produto é citado (mínimo 5 chars)",
  "clothingDescription": "string — descrição completa da roupa quando aplicável, ou '' caso contrário",
  "framingType": "full-body | close-up | medium-shot | extreme-close-up",
  "metadata": {
    "formula": "5-block formula applied",
    "powerWords": ["..."],
    "cameraSettings": "string",
    "lightingType": "string",
    "productIncluded": true,
    "clothingComplete": true,
    "estimatedRenderTime": "8-15 seconds"
  },
  "warnings": []
}`;

// ---------- AGENT 2: MEDIA GENERATOR ----------
const MEDIA_GENERATOR_SYSTEM = `Você é o AGENTE GERADOR DE MÍDIA da PearlShop. Recebe a saída do Diretor Criativo (Agente 1) e produz:
1. imagePrompt — prompt FINAL para Nano Banana 2 com DUAS imagens de referência anexadas (avatar + produto).
2. scriptPrompt — instruções de roteiro/voz em PT-BR.

### REGRAS PARA imagePrompt
- DEVE começar EXATAMENTE com:
"Using the FIRST attached image as the EXACT character reference (same face, same ethnicity, same hair, same body — identity preserved 100%), and the SECOND attached image as the EXACT product reference (same shape, same color, same material, same category — product fidelity preserved 100%), generate: "
- Em seguida, refine o masterPrompt do Agente 1 mantendo: productMention, clothingDescription (se houver), framingType e todas as power words.
- NUNCA descreva etnia/idade/cor de cabelo/cor de olhos.
- Termine com: "no fake brand logos, no competitor brands, no distorted hands, no extra fingers, do not change the face, do not alter identity, do not change the product shape or color, vertical 9:16 framing".

### REGRAS PARA scriptPrompt
- script em PORTUGUÊS DO BRASIL, natural, no tom solicitado.
- 8s: 1 frase de impacto. 16s: gancho + benefício + CTA. 24s+: gancho + storytelling + CTA.

### SAÍDA OBRIGATÓRIA (apenas JSON, sem markdown):
{
  "imagePrompt": "string em inglês começando exatamente com 'Using the FIRST attached image as the EXACT character reference...'",
  "scriptPrompt": {
    "script": "roteiro em pt-BR",
    "voiceTone": "descrição do tom",
    "voiceEnergy": "low|medium|high",
    "suggestedMusic": "string"
  }
}`;

// Mapeia status HTTP do Gemini para erros conhecidos.
function mapGeminiError(status: number, text: string): Error {
  if (status === 429) return new Error("RATE_LIMIT");
  // 402 quase nunca ocorre no Gemini; 403 com "quota" / "billing" indica créditos esgotados.
  if (status === 402) return new Error("PAYMENT_REQUIRED");
  if (status === 403 && /quota|billing|exceeded|limit/i.test(text)) {
    return new Error("PAYMENT_REQUIRED");
  }
  return new Error(`Gemini error ${status}: ${text}`);
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
      };

      const agent1 = await callLLM(
        CREATIVE_DIRECTOR_SYSTEM,
        `Configurações do Studio:\n${JSON.stringify(agent1Input, null, 2)}\n\nLEMBRE-SE:\n- A identidade física do avatar virá da PRIMEIRA imagem anexada — NÃO descreva etnia/idade/cabelo/olhos.\n- O PRODUTO "${product.productName ?? "(sem nome)"}" DEVE aparecer organicamente e ser citado pelo nome no masterPrompt.\n- Aplique o framing correto baseado em interaction="${input.interaction}".`,
        GEMINI_API_KEY
      );

      // Validar produto mencionado
      const productMention: string = (agent1.productMention ?? "").toString().trim();
      if (product.productName && productMention.length < 5) {
        throw new Error(`Agente 1 não citou o produto no masterPrompt (productMention="${productMention}")`);
      }

      // ===== AGENT 2 =====
      const agent2 = await callLLM(
        MEDIA_GENERATOR_SYSTEM,
        `Saída do Agente 1:\n${JSON.stringify(agent1, null, 2)}\n\nDuração do vídeo: ${input.duration}\nTom de voz: ${input.voiceTone} / energia ${input.voiceEnergy} / estilo ${input.voiceStyle}\nRoteiro do usuário (se houver): ${input.script || "(vazio — você decide)"}\n\nLembre: imagePrompt DEVE começar EXATAMENTE com "Using the FIRST attached image as the EXACT character reference..." e citar o produto "${product.productName ?? ""}".`,
        GEMINI_API_KEY
      );

      // ===== IMAGE GEN com 2 referências =====
      const imageDataUrl = await generateImage(
        agent2.imagePrompt,
        referenceImageUrl,
        product.productImageUrl,
        GEMINI_API_KEY
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
        msg === "RATE_LIMIT" ? "RATE_LIMIT" : msg === "PAYMENT_REQUIRED" ? "AI_CREDITS_EXHAUSTED" : "GENERATION_FAILED";
      const userMsg =
        msg === "RATE_LIMIT"
          ? "Muitas requisições. Tente novamente em instantes."
          : msg === "PAYMENT_REQUIRED"
          ? "Créditos de IA esgotados. Adicione créditos no workspace."
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
