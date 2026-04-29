// Edge Function: generate-ugc
// Orquestra dois agentes de IA encadeados (Diretor Criativo + Gerador de Mídia)
// + geração de imagem com Nano Banana 2 + upload para Supabase Storage + persistência em media_jobs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-3-flash-preview";
// Nano Banana 2 — fast image generation with pro-level quality
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

// ---------- AGENT 1: CREATIVE DIRECTOR ----------
const CREATIVE_DIRECTOR_SYSTEM = `Você é um DIRETOR CRIATIVO ESPECIALISTA em geração de UGC fotorrealista para a PearlShop.
Sua missão é transformar configurações de estúdio em um MASTER PROMPT técnico de altíssima qualidade, otimizado para modelos de imagem (Nano Banana 2 / Gemini Image).

### FÓRMULA DE 5 BLOCOS (Obrigatória)
Toda geração DEVE seguir esta estrutura, em INGLÊS:
1. SUJEITO — descrição física detalhada do avatar: etnia, idade, tipo de corpo, cabelo, olhos, expressão.
2. AÇÃO — pose e interação orgânica com o produto.
3. CENÁRIO — ambiente coerente com o produto, com detalhes de mobília, luz e atmosfera.
4. ESTILO TÉCNICO — câmera (ex: "iPhone 15 Pro, 24mm, f/1.8"), iluminação ("golden hour", "soft window light"), grão, profundidade.
5. REALISMO & RESTRIÇÕES — palavras-chave anti-IA: "ultra-realistic", "imperfect skin texture", "real fabric folds", "natural hands with 5 fingers", "no plastic look", "candid handheld feel".

### PRINCÍPIOS
- Sempre em INGLÊS, frases curtas separadas por vírgula.
- Reforçar power words quando "antiAI" ou "perfectHands" estiverem ativos.
- Evitar logos de marcas concorrentes; manter o produto em destaque sem inventar marcas falsas.
- Cenário coerente com o produto e a pose.

### SAÍDA OBRIGATÓRIA
Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem cercas \`\`\`) no formato:
{
  "masterPrompt": "string — prompt técnico final de imagem em inglês, seguindo a fórmula de 5 blocos",
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
1. imagePrompt — prompt FINAL otimizado para Nano Banana 2 (em inglês, denso, técnico).
2. scriptPrompt — instruções de roteiro/voz para o vídeo, conciso e adequado à duração.

### Regras
- Refine o masterPrompt removendo redundâncias, mantendo todas as power words e detalhes técnicos.
- Adicione restrições de segurança: "no fake brand logos, no competitor brands, no distorted hands, no extra fingers".
- O scriptPrompt.script deve estar em PORTUGUÊS DO BRASIL, natural, no tom solicitado.
- Para 8s: 1 frase de impacto. Para 16s: gancho + benefício + CTA. Para 24s+: gancho + storytelling + CTA.

### SAÍDA OBRIGATÓRIA (apenas JSON, sem markdown):
{
  "imagePrompt": "string em inglês",
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
    // try to recover JSON inside text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("LLM returned invalid JSON");
  }
}

async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
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

    // Auth user
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

    // Cria job pending
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
        status: "processing",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    try {
      // ===== AGENT 1 =====
      const agent1 = await callLLM(
        CREATIVE_DIRECTOR_SYSTEM,
        `Configurações do Studio:\n${JSON.stringify(input, null, 2)}`,
        LOVABLE_API_KEY
      );

      // ===== AGENT 2 =====
      const agent2 = await callLLM(
        MEDIA_GENERATOR_SYSTEM,
        `Saída do Agente 1:\n${JSON.stringify(agent1, null, 2)}\n\nDuração do vídeo: ${input.duration}\nTom de voz: ${input.voiceTone} / energia ${input.voiceEnergy} / estilo ${input.voiceStyle}\nRoteiro do usuário (se houver): ${input.script || "(vazio — você decide)"}`,
        LOVABLE_API_KEY
      );

      // ===== IMAGE GEN =====
      const imageDataUrl = await generateImage(agent2.imagePrompt, LOVABLE_API_KEY);
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
