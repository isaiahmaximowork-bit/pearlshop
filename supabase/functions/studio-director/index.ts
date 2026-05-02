// Edge function: studio-director
// Agente Director — Orquestrador de Takes (Fase 3)
// Analisa produto, avatar e estilo para gerar automaticamente a sequência ideal de takes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.5-flash";

const DIRECTOR_SYSTEM_PROMPT = `You are a professional UGC video director specializing in AI-generated content for TikTok Shop and Instagram Reels. Your goal is to create multi-take video sequences that appear 100% human-recorded and are completely undetectable as AI.

CORE PRINCIPLE: The key to AAA quality is VARIETY. Each take must have a completely different:
- Location/scene (bedroom, office, kitchen, gym, living room, bar, outdoor)
- Lighting condition (natural soft, harsh natural, warm artificial, cold fluorescent, low-key night, bar ambient)
- Camera movement style (handheld breathing, static tripod, energetic handheld, slow zoom)
- Camera angle (medium shot, medium close-up, American shot, mirror selfie, high angle selfie)

CHARACTER CONSISTENCY RULE: The avatar's face, body proportions, and hair style must remain 100% identical across all takes, even as the environment changes completely. This is the #1 quality marker.

SCENE IMPERFECTION RULE: Never use clean, generic backgrounds. Each scene must have "lived-in" details:
- Bedroom: unmade bed, phone charger, water bottle
- Office: cables, coffee mug, notebook, laptop glow
- Kitchen: spice jars, cutting board, warm ceiling lights
- Gym: fluorescent lights, mirror reflections, other people blurred in background
- Bar: ambient colored lights, bokeh background, people socializing

PRODUCT INTEGRATION RULE: The product must appear naturally in the scene. For clothing: worn naturally with correct draping and fabric physics. For accessories/beauty: held naturally with correct hand occlusion and finger proportions.

Generate takes that follow the Jump Cut editing style (hard cuts mid-sentence) to maximize viewer retention.

PRODUCT_CATEGORY_RULES:
- MODA: priority_scenes=quarto,sala,escritorio,cafe,externo. avoid=academia,cozinha,banheiro. angles=frontal_medio,plano_americano,mirror_selfie
- CALCADOS: priority_scenes=externo,academia,sala,loja. avoid=banheiro,cozinha. angles=plano_americano,pov,close_up
- BELEZA: priority_scenes=banheiro,quarto,escritorio. avoid=academia,carro,externo. angles=close_up,frontal_medio
- ELETRONICOS: priority_scenes=escritorio,quarto,academia,externo. avoid=banheiro,cozinha. angles=close_up,frontal_medio,pov
- CASA: priority_scenes=sala,quarto,cozinha. avoid=academia,bar. angles=frontal_medio,close_up
- FITNESS: priority_scenes=academia,externo,quarto. avoid=escritorio,bar. angles=frontal_medio,plano_americano
- ALIMENTACAO: priority_scenes=cozinha,sala,externo. avoid=banheiro,academia. angles=close_up,pov,frontal_medio

STYLE DNA:
- ugc_autentico: handheld smartphone, natural lighting, lived-in backgrounds, jump cuts
- publicitario: stabilized cinema camera, 3-point lighting, clean minimal backgrounds, smooth cuts
- viral_tiktok: energetic handheld, variable lighting, trendy spaces, rapid jump cuts
- dancinha: handheld rhythmic, bright even lighting, full body movement space
- close_up: steady handheld, soft flattering light, shallow DOF, face+shoulders
- mirror_selfie: phone in mirror, ambient+vanity lights, Z-axis recession, full body in mirror
- hook_mao_camera: finger touching lens → step back 3m, focus shift from blurry to sharp

OUTPUT FORMAT (JSON only, no markdown):
{
  "takes": [
    {
      "take_number": 1,
      "duration_seconds": 8,
      "scene": "quarto|escritorio|cozinha|banheiro|sala|academia|bar|externo|estudio|loja|cafe|carro",
      "camera_angle": "frontal_medio|close_up|plano_americano|mirror_selfie|pov|hook_mao",
      "lighting": "natural_suave|natural_forte|artificial_quente|fluorescente_fria|low_key_noturno|ambiente_bar",
      "camera_movement": "handheld_suave|estatico|handheld_energetico|zoom_lento",
      "product_interaction": "vestindo|segurando|espelho|demonstrando",
      "dialogue_hint": "string (sugestão de roteiro para este take em PT-BR)",
      "veo3_prompt": "string (prompt técnico completo em inglês para Veo 3)"
    }
  ]
}`;

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = `${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 4096, responseMimeType: "application/json" },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw Object.assign(new Error("Rate limit Gemini"), { code: "RATE_LIMIT" });
    if (res.status === 402 || errText.includes("billing")) throw Object.assign(new Error("Credits exhausted"), { code: "AI_CREDITS_EXHAUSTED" });
    if (res.status === 503 || errText.includes("overloaded")) throw Object.assign(new Error("Model overloaded"), { code: "MODEL_OVERLOADED" });
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Resposta vazia do Gemini");
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

    const input = await req.json();
    const { product, avatar, style, num_takes, total_duration_seconds } = input;

    if (!product?.name || !style || !num_takes) {
      return new Response(JSON.stringify({ success: false, error: "Campos obrigatórios: product.name, style, num_takes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userPrompt = `Generate a ${num_takes}-take video sequence (${total_duration_seconds}s total) for:

PRODUCT: ${product.name} (category: ${product.category || "general"})
AVATAR: ${avatar?.name || "default"} (gender: ${avatar?.gender || "female"})
VIDEO STYLE: ${style}

Create the optimal sequence with maximum variety between takes. Each take is exactly 8 seconds.
Return ONLY valid JSON matching the output format specified.`;

    const raw = await callGemini(apiKey, DIRECTOR_SYSTEM_PROMPT, userPrompt);

    // Parse JSON (handle potential markdown wrapping)
    let parsed: any;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Falha ao parsear resposta do Director");
    }

    return new Response(JSON.stringify({ success: true, takes: parsed.takes || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    const errorCode = err.code || "UNKNOWN";
    return new Response(JSON.stringify({ success: false, error: err.message, errorCode }),
      { status: err.code === "RATE_LIMIT" ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
