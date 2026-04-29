// Edge Function: generate-ugc
// Orquestra dois agentes de IA encadeados (Diretor Criativo + Gerador de Mídia)
// + geração de imagem com Nano Banana 2 USANDO a foto do avatar como REFERÊNCIA VISUAL
// + upload para Supabase Storage + persistência em media_jobs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-3-flash-preview";
// Nano Banana 2 — fast image generation with pro-level quality + image-to-image
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

// ---------- AGENT 1: CREATIVE DIRECTOR ----------
// IMPORTANTE: NÃO descrever etnia/idade/cabelo/olhos do avatar — esses traços vêm
// da imagem de referência anexada. O agente foca em ação, cenário e técnica.
const CREATIVE_DIRECTOR_SYSTEM = `Você é um DIRETOR CRIATIVO ESPECIALISTA em geração de UGC fotorrealista para a PearlShop.
Sua missão é transformar configurações de estúdio em um MASTER PROMPT técnico de altíssima qualidade, otimizado para Nano Banana 2 (Gemini Image) com IMAGEM DE REFERÊNCIA do avatar anexada.

### REGRA CRÍTICA — IDENTIDADE DO AVATAR
A IDENTIDADE FÍSICA do avatar (rosto, etnia, idade, tom de pele, cor/textura de cabelo, olhos, formato corporal) virá da IMAGEM DE REFERÊNCIA anexada na geração.
NUNCA descreva esses traços no prompt. NUNCA invente etnia, idade ou aparência.
Refira-se ao sujeito como "the person from the reference image" — preservando 100% a identidade visual.

### FÓRMULA DE 5 BLOCOS (Obrigatória, em INGLÊS)
1. SUBJECT REFERENCE — "the same person from the reference image, exact same face, same ethnicity, same hair, same body type, identity preserved 100%".
2. AÇÃO — pose, expressão e interação orgânica com o produto (sem alterar identidade).
3. CENÁRIO — ambiente coerente, mobília, luz, atmosfera.
4. ESTILO TÉCNICO — câmera (ex: "iPhone 15 Pro, 24mm, f/1.8"), iluminação, grão, profundidade, aspect ratio 9:16.
5. REALISMO & RESTRIÇÕES — "ultra-realistic", "imperfect skin texture", "real fabric folds", "natural hands with exactly 5 fingers", "no plastic look", "candid handheld feel", "preserve facial identity from reference".

### PRINCÍPIOS
- Sempre em INGLÊS, frases curtas separadas por vírgula.
- Reforçar power words quando "antiAI" ou "perfectHands" estiverem ativos.
- Sem logos de marcas concorrentes.

### SAÍDA OBRIGATÓRIA
Retorne EXCLUSIVAMENTE um JSON válido (sem markdown):
{
  "masterPrompt": "string — prompt técnico final em inglês, fórmula 5 blocos, referenciando 'the person from the reference image'",
  "metadata": {
    "formula": "5-block formula applied",
    "powerWords": ["..."],
    "cameraSettings": "string",
    "lightingType": "string",
    "estimatedRenderTime": "8-15 seconds"
  },
  "warnings": []
}`;

// ---------- AGENT 2: MEDIA GENERATOR ----------
const MEDIA_GENERATOR_SYSTEM = `Você é o AGENTE GERADOR DE MÍDIA da PearlShop. Recebe a saída do Diretor Criativo (Agente 1) e produz:
1. imagePrompt — prompt FINAL otimizado para Nano Banana 2 com IMAGEM DE REFERÊNCIA anexada.
2. scriptPrompt — instruções de roteiro/voz em PT-BR.

### REGRAS PARA imagePrompt
- DEVE começar EXATAMENTE com: "Using the attached image as the EXACT character reference (same face, same ethnicity, same hair, same body — identity preserved 100%), generate: "
- Em seguida, refine o masterPrompt removendo redundâncias mas mantendo todas as power words.
- NUNCA descreva etnia/idade/cor de cabelo/cor de olhos — a referência cuida disso.
- Adicione restrições finais: "no fake brand logos, no competitor brands, no distorted hands, no extra fingers, do not change the face, do not alter identity, vertical 9:16 framing".

### REGRAS PARA scriptPrompt
- script em PORTUGUÊS DO BRASIL, natural, no tom solicitado.
- 8s: 1 frase de impacto. 16s: gancho + benefício + CTA. 24s+: gancho + storytelling + CTA.

### SAÍDA OBRIGATÓRIA (apenas JSON, sem markdown):
{
  "imagePrompt": "string em inglês começando com 'Using the attached image as the EXACT character reference...'",
  "scriptPrompt": {
    "script": "roteiro em pt-BR",
    "voiceTone": "descrição do tom",
    "voiceEnergy": "low|medium|high",
    "suggestedMusic": "string"
  }
}`;

async function callLLM(systemPrompt: string, userContent: string, apiKey: string) {
  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`LLM error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty content");
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("LLM returned invalid JSON");
  }
}

// Gera imagem usando IMAGEM DE REFERÊNCIA (image-to-image / character reference)
async function generateImage(
  prompt: string,
  referenceImageUrl: string | null,
  apiKey: string
): Promise<string> {
  // Monta content: se houver referência, envia multimodal (texto + imagem).
  const content: any = referenceImageUrl
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: referenceImageUrl } },
      ]
    : prompt;

  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`Image gen error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("Image gen returned no image");
  return url; // data:image/png;base64,...
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const [meta, b64] = dataUrl.split(",");
  const contentType = meta.match(/data:([^;]+)/)?.[1] || "image/png";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");

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

    // Imagem de referência do avatar (data URL ou URL pública)
    const referenceImageUrl: string | null = input.referenceImageUrl ?? null;

    const { data: job, error: insertErr } = await admin
      .from("media_jobs")
      .insert({
        user_id: user.id,
        product_id: input.productId,
        product_name: input.productName,
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
        // Persiste apenas se for URL pública (data URLs ficam grandes; salvamos só o ID)
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
        ...input,
        // não trafega o data URL gigante pro LLM de texto
        referenceImageUrl: referenceImageUrl ? "[reference image attached to the image generator]" : null,
      };
      const agent1 = await callLLM(
        CREATIVE_DIRECTOR_SYSTEM,
        `Configurações do Studio:\n${JSON.stringify(agent1Input, null, 2)}\n\nLEMBRE-SE: a identidade física do avatar virá da imagem de referência anexada — NÃO descreva etnia, idade, cabelo ou olhos. Refira-se como "the person from the reference image".`,
        LOVABLE_API_KEY
      );

      // ===== AGENT 2 =====
      const agent2 = await callLLM(
        MEDIA_GENERATOR_SYSTEM,
        `Saída do Agente 1:\n${JSON.stringify(agent1, null, 2)}\n\nDuração do vídeo: ${input.duration}\nTom de voz: ${input.voiceTone} / energia ${input.voiceEnergy} / estilo ${input.voiceStyle}\nRoteiro do usuário (se houver): ${input.script || "(vazio — você decide)"}\n\nLembre: imagePrompt DEVE começar com "Using the attached image as the EXACT character reference...".`,
        LOVABLE_API_KEY
      );

      // ===== IMAGE GEN com referência visual =====
      const imageDataUrl = await generateImage(
        agent2.imagePrompt,
        referenceImageUrl,
        LOVABLE_API_KEY
      );
      const { bytes, contentType } = dataUrlToBytes(imageDataUrl);

      const ext = contentType.includes("jpeg") ? "jpg" : "png";
      const storageKey = `${user.id}/${job.id}.${ext}`;

      const { error: uploadErr } = await admin.storage
        .from("ugc-media")
        .upload(storageKey, bytes, { contentType, upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: pub } = admin.storage.from("ugc-media").getPublicUrl(storageKey);

      const { data: updated, error: updateErr } = await admin
        .from("media_jobs")
        .update({
          status: "completed",
          master_prompt: agent1.masterPrompt,
          agent1_metadata: agent1.metadata ?? null,
          warnings: agent1.warnings ?? [],
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

      const status = msg === "RATE_LIMIT" ? 429 : msg === "PAYMENT_REQUIRED" ? 402 : 500;
      const userMsg =
        msg === "RATE_LIMIT"
          ? "Muitas requisições. Tente novamente em instantes."
          : msg === "PAYMENT_REQUIRED"
          ? "Créditos de IA esgotados. Adicione créditos no workspace."
          : msg;

      return new Response(JSON.stringify({ success: false, error: userMsg, jobId: job.id }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("generate-ugc fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
