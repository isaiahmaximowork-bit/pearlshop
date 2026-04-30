// Edge function: generate-veo3-prompt
// Agente 4 do pipeline Veo 3: lê o relatório de análise (Agente 3), o roteiro
// em PT-BR, a configuração de voz e os dados de produto/avatar e devolve um
// PROMPT VEO 3 OTIMIZADO em inglês — pronto pra colar no Flow/Veo 3 com a
// imagem UGC como seed (frame-to-video).
//
// Master prompt extraído fielmente do documento "🎬 Fluxo Completo Veo 3 +
// Master Prompt do Agente" (v1.0, 30/04/2026).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.5-flash";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type ScriptType = "promocional" | "indicacional" | "storytelling";

interface AnalysisReport {
  avatarConsistency: number;
  productVisibility: number;
  lightingQuality: number;
  overallQuality: number;
  movementPotential: number;
  qualityScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizationFocus: string[];
}

interface VoiceConfig {
  gender?: string;
  tone?: string;
  energy?: string;
  style?: string;
}

interface ProductInfo {
  name?: string;
  description?: string;
  category?: string;
  color?: string;
  material?: string;
  features?: string[];
}

interface AvatarInfo {
  name?: string;
  description?: string;
}

interface GenerateVeo3Input {
  jobId?: string; // se vier, persiste resultado em media_jobs
  ugcImageUrl: string;
  analysisReport: AnalysisReport;
  script: string;
  scriptType: ScriptType;
  voice: VoiceConfig;
  product: ProductInfo;
  avatar: AvatarInfo;
}

// ---------------------------------------------------------------------------
// VEO3_OPTIMIZED_PROMPT_GENERATOR_SYSTEM (do PDF, fiel)
// ---------------------------------------------------------------------------
const VEO3_OPTIMIZED_PROMPT_GENERATOR_SYSTEM = `Você é um especialista em geração de prompts para Veo 3 (Google DeepMind).
Sua especialidade é analisar uma imagem UGC (primeiro frame) e gerar um
prompt Veo 3 OTIMIZADO que mantenha a consistência visual enquanto adiciona
movimento humanizado, qualidade AAA e sincronização perfeita com voz/roteiro.

CONTEXTO:
- Você recebe uma imagem UGC já gerada (primeiro frame)
- Você recebe análise detalhada dessa imagem
- Seu trabalho é gerar um prompt que MELHORE o resultado anterior
- O vídeo será gerado usando frame-to-video (imagem como seed)

RESPONSABILIDADES CRÍTICAS:

1. PRESERVAR CONSISTÊNCIA
   - Avatar: Mesmo rosto, mesma identidade
   - Produto: Mesma cor, material, características
   - Cenário: Mesmo ambiente, mesma iluminação
   - Estilo: Mesmo estilo visual

2. OTIMIZAR BASEADO EM ANÁLISE
   - Se avatar inconsistente: Reforçar identidade
   - Se produto não visível: Adicionar manipulação
   - Se iluminação fraca: Especificar profissional
   - Se movimento robótico: Adicionar micro-movimentos
   - Se qualidade baixa: Reforçar realismo

3. ADICIONAR MOVIMENTO HUMANIZADO
   - Micro-movimentos (cabeça, ombros, mãos)
   - Gestos naturais e autênticos
   - Expressões faciais variadas
   - Movimento de cabelo e roupa
   - Contato visual e eye contact
   - Peso e equilíbrio naturais

4. SINCRONIZAR COM VOZ/ROTEIRO
   - Movimento acompanha fala
   - Pausas naturais
   - Ênfase em palavras-chave
   - Gestos enfatizando pontos principais
   - Lip-sync perfeito

5. GARANTIR QUALIDADE AAA
   - 4K, 60fps, 9:16
   - Iluminação profissional
   - Cores vibrantes e precisas
   - Realismo extremo (poros, cabelo, tecido, mãos)
   - Sem artefatos de IA

ESTRUTURA DO PROMPT OTIMIZADO (sempre em INGLÊS, blocos === SECTION ===):

=== VISUAL REFERENCE ===
"Use this image as the starting frame, maintain 100% consistency with the reference"

=== PRESERVATION REQUIREMENTS ===
- Avatar: Preserve facial identity 100%, same face from first frame
- Product: Maintain product appearance, color, and material from reference
- Lighting: Maintain lighting setup from first frame
- Environment: Maintain environment and background from first frame

=== OPTIMIZATION INSTRUCTIONS ===
[Selecionar dinamicamente com base no analysisReport — só inclua as que se aplicam]
- avatarConsistency < 8 → "Strengthen facial consistency, same facial features throughout"
- productVisibility  < 8 → "Ensure product is prominently featured, manipulated properly"
- lightingQuality    < 8 → "Enhance lighting quality, professional 3-point setup"
- movementPotential  < 8 → "Add natural micro-movements, authentic gestures"
- overallQuality     < 8 → "Enhance hyper-realistic details, no AI artifacts"

=== MOVEMENT CHOREOGRAPHY ===
PROMOCIONAL:
"Energetic hand movements highlighting product features, confident posture with direct eye contact, animated facial expressions showing enthusiasm, hand gestures emphasizing key benefits, product manipulation (holding, rotating, displaying), pointing to product features while speaking, nodding and head movements for emphasis, bright smile and positive facial expressions, dynamic body positioning and natural transitions"

INDICACIONAL:
"Friendly, approachable body language, natural hand gestures as if talking to a friend, warm facial expressions and genuine smile, hand on product as if sharing personal recommendation, leaning slightly forward (engaging, intimate), natural head movements and authentic eye contact, relaxed posture, comfortable positioning, occasional hand-to-heart gesture, authentic, non-salesy demeanor, spontaneous micro-movements"

STORYTELLING:
"Expressive hand movements following narrative arc, varied facial expressions showing emotional journey, natural transitions between poses, hand movements following story rhythm, eye movements showing reflection or memory, body positioning changes for different story beats, authentic emotional expressions, natural pacing with story rhythm, genuine reactions and authentic moments, spontaneous, unscripted feel"

=== VOICE & DIALOGUE SYNCHRONIZATION ===
"Dialogue (Portuguese): [roteiro completo, EM PORTUGUÊS, dentro de aspas]
Voice characteristics: [gender, tone, energy, style]
Lip-sync: Perfect synchronization with dialogue
Natural speech pace with occasional pauses
Emphasis on key words: [3-5 palavras-chave do roteiro]
Emotional tone: [emotion matching o tipo de roteiro]"

=== TECHNICAL SPECIFICATIONS ===
Resolution: 4K (3840x2160)
Frame rate: 60fps
Aspect ratio: 9:16 (vertical)
Duration: 8 seconds
Quality: Highest
Color depth: 10-bit
Dynamic range: HDR
Shutter speed: 1/60s (cinema standard)
Depth of field: Shallow (f/1.8-2.8)

=== QUALITY REQUIREMENTS ===
- Hyper-detailed skin pores visible
- Natural hair movement responding to body motion
- Photorealistic fabric texture and drape
- Natural hand gestures with visible fingers (exactly 5)
- Authentic facial expressions and eye contact
- Realistic fabric folds and wrinkles
- Perfect lip-sync with dialogue
- NO plastic appearance
- 100% authentic, not AI-looking
- Professional cinematography
- Smooth, natural motion throughout
- Frame-to-video consistency maintained

REGRAS CRÍTICAS:
1. NUNCA mencione que é IA ou artificial
2. SEMPRE use termos cinematográficos profissionais
3. SEMPRE especifique movimento humanizado
4. SEMPRE sincronize com voz/roteiro
5. SEMPRE inclua qualidade técnica completa
6. SEMPRE garanta realismo extremo
7. SEMPRE preserve consistência visual
8. NUNCA comprometa qualidade por brevidade
9. NUNCA gere prompts genéricos
10. NUNCA esqueça de detalhes de realismo

TERMOS VETO (NUNCA USE no veo3Prompt):
- "AI-generated", "Synthetic", "Digital", "Animated", "Rendered"
- "Fake", "Artificial", "Computer-generated"

TERMOS POSITIVOS (SEMPRE USE):
- "Authentic UGC style", "Hyper-realistic details"
- "Natural movement", "Candid feel"
- "Professional cinematography", "100% authentic human appearance"
- "Frame-to-video", "Consistent with reference"

OUTPUT OBRIGATÓRIO — APENAS JSON VÁLIDO (sem markdown, sem cercas, sem texto fora):
{
  "veo3Prompt": "string (PROMPT COMPLETO em INGLÊS, com TODOS os blocos === SECTION === acima preenchidos, multi-linha)",
  "analysisInsights": {
    "avatarConsistency": "string",
    "productVisibility": "string",
    "lightingQuality": "string",
    "movementPotential": "string",
    "optimizationsApplied": ["string"]
  },
  "movementDescription": "string",
  "voiceCharacteristics": "string",
  "synchronizationPoints": [
    { "timestamp": "0-2s", "action": "string", "voiceEmphasis": "string" },
    { "timestamp": "2-5s", "action": "string", "voiceEmphasis": "string" },
    { "timestamp": "5-8s", "action": "string", "voiceEmphasis": "string" }
  ],
  "technicalSpecs": {
    "resolution": "4K",
    "fps": 60,
    "aspectRatio": "9:16",
    "duration": 8,
    "colorDepth": "10-bit",
    "dynamicRange": "HDR"
  },
  "realismChecklist": {
    "skinPores": true,
    "hairMovement": true,
    "fabricTexture": true,
    "handAnatomy": true,
    "facialExpressions": true,
    "eyeContact": true,
    "lipSync": true,
    "noAIArtifacts": true,
    "frameToVideoConsistency": true
  },
  "qualityScore": 9.0,
  "recommendations": "string"
}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mapGeminiError(status: number, body: string) {
  if (status === 429) return { code: "RATE_LIMIT", http: 429, message: "Rate limit do Gemini." };
  if (status === 402 || /quota|billing/i.test(body))
    return { code: "AI_CREDITS_EXHAUSTED", http: 402, message: "Créditos do Gemini esgotados." };
  if (status === 403)
    return { code: "AI_CREDITS_EXHAUSTED", http: 402, message: "Acesso negado pelo Gemini." };
  if (status === 503 || status === 502 || status === 504)
    return { code: "MODEL_OVERLOADED", http: 503, message: "Gemini sobrecarregado." };
  return { code: "GEMINI_ERROR", http: 500, message: `Gemini error ${status}: ${body.slice(0, 300)}` };
}

async function retry<T>(fn: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const transient = e?.code === "MODEL_OVERLOADED" || e?.code === "RATE_LIMIT";
      if (!transient || attempt === maxAttempts) break;
      const delay = 800 * Math.pow(2, attempt - 1) + Math.random() * 400;
      console.warn(`[generate-veo3-prompt] ${label} attempt ${attempt} (${e?.code}), retry in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function buildUserPrompt(input: GenerateVeo3Input): string {
  const a = input.analysisReport;
  return `GERE UM PROMPT VEO 3 OTIMIZADO BASEADO EM ANÁLISE DE IMAGEM

=== ANALYSIS REPORT ===
${JSON.stringify(a, null, 2)}

=== SCRIPT (Portuguese) ===
"${input.script.replace(/"/g, "'")}"

=== VOICE CONFIG ===
Gender: ${input.voice.gender || "feminino"}
Tone: ${input.voice.tone || "natural"}
Energy: ${input.voice.energy || "media"}
Style: ${input.voice.style || "conversacional"}

=== PRODUCT INFO ===
Name: ${input.product.name || "(não informado)"}
Description: ${(input.product.description || "").slice(0, 400) || "(não informado)"}
Category: ${input.product.category || "(não informado)"}
Color: ${input.product.color || "(não informado)"}
Material: ${input.product.material || "(não informado)"}
Features: ${(input.product.features || []).filter(Boolean).join(", ") || "(não informado)"}

=== AVATAR INFO ===
Name: ${input.avatar.name || "(não informado)"}
Description: ${input.avatar.description || "(não informado)"}

=== SCRIPT TYPE ===
${input.scriptType}

=== OPTIMIZATION REQUIREMENTS ===
Based on analysis report:
- Avatar Consistency: ${a.avatarConsistency}/10
- Product Visibility: ${a.productVisibility}/10
- Lighting Quality:   ${a.lightingQuality}/10
- Overall Quality:    ${a.overallQuality}/10
- Movement Potential: ${a.movementPotential}/10

Optimization Focus: ${(a.optimizationFocus || []).join(", ") || "(none)"}
Strengths to Maintain: ${(a.strengths || []).join("; ") || "(none)"}
Weaknesses to Address: ${(a.weaknesses || []).join("; ") || "(none)"}

=== GENERATE OPTIMIZED VEO 3 PROMPT ===
Generate a COMPLETE, DETAILED, and PROFESSIONAL Veo 3 prompt that:
1. Uses the UGC image as frame-to-video seed
2. Maintains all strengths from analysis
3. Addresses all weaknesses from analysis
4. Synchronizes perfectly with the Portuguese script
5. Includes humanized movement choreography matching scriptType="${input.scriptType}"
6. Specifies AAA quality requirements
7. Ensures perfect lip-sync
8. Preserves avatar consistency 100%
9. Ensures product visibility and manipulation of "${input.product.name || ""}"
10. Includes ALL technical specifications (4K, 60fps, 9:16, 8s)

The prompt MUST be in ENGLISH (for Veo 3). Apenas JSON no formato definido no system prompt — nada fora.`;
}

async function callGemini(apiKey: string, system: string, user: string) {
  const url = `${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.75,
      maxOutputTokens: 3000,
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    const err = mapGeminiError(res.status, txt);
    const e: any = new Error(err.message);
    e.code = err.code;
    e.http = err.http;
    throw e;
  }
  const json = await res.json();
  const content = json?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text || "")
    .join("")
    .trim() || "";
  if (!content) {
    const e: any = new Error("Resposta vazia do Gemini.");
    e.code = "EMPTY_RESPONSE";
    e.http = 502;
    throw e;
  }
  try {
    return JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    const e: any = new Error("JSON inválido do Gemini.");
    e.code = "INVALID_JSON";
    e.http = 502;
    throw e;
  }
}

// Validação anti-veto: garante que termos proibidos não vazaram pro prompt final.
const VETO_TERMS = [
  "AI-generated",
  "AI generated",
  "Synthetic",
  "Animated",
  "Rendered",
  "Fake",
  "Artificial",
  "Computer-generated",
  "Computer generated",
];
function checkVeto(prompt: string): string[] {
  const found: string[] = [];
  const lower = prompt.toLowerCase();
  for (const term of VETO_TERMS) {
    if (lower.includes(term.toLowerCase())) found.push(term);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, errorCode: "MISSING_API_KEY", error: "GEMINI_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const input = (await req.json()) as GenerateVeo3Input;

    // Validação mínima
    const allowed: ScriptType[] = ["promocional", "indicacional", "storytelling"];
    if (!input?.script || !input?.analysisReport || !allowed.includes(input.scriptType)) {
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: "INVALID_INPUT",
          error: "script, analysisReport e scriptType (promocional|indicacional|storytelling) são obrigatórios.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth opcional para persistência
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, ANON, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser();
      userId = data?.user?.id ?? null;
    }

    // Geração
    const userPrompt = buildUserPrompt(input);
    const result = await retry(
      () => callGemini(apiKey, VEO3_OPTIMIZED_PROMPT_GENERATOR_SYSTEM, userPrompt),
      "veo3-prompt",
      3,
    );

    const veo3Prompt: string = (result?.veo3Prompt || "").toString();
    if (!veo3Prompt || veo3Prompt.length < 200) {
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: "PROMPT_TOO_SHORT",
          error: "Prompt gerado muito curto/inválido — tente novamente.",
          raw: result,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const vetoFound = checkVeto(veo3Prompt);

    const metadata = {
      analysisInsights: result.analysisInsights ?? null,
      movementDescription: result.movementDescription ?? null,
      voiceCharacteristics: result.voiceCharacteristics ?? null,
      synchronizationPoints: result.synchronizationPoints ?? [],
      technicalSpecs: result.technicalSpecs ?? {
        resolution: "4K",
        fps: 60,
        aspectRatio: "9:16",
        duration: 8,
        colorDepth: "10-bit",
        dynamicRange: "HDR",
      },
      realismChecklist: result.realismChecklist ?? null,
      qualityScore: typeof result.qualityScore === "number" ? result.qualityScore : null,
      recommendations: result.recommendations ?? null,
      vetoTermsFound: vetoFound,
      generatorModel: TEXT_MODEL,
    };

    if (input.jobId && userId) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      await admin
        .from("media_jobs")
        .update({
          script: input.script,
          script_type: input.scriptType,
          veo3_prompt: veo3Prompt,
          veo3_metadata: metadata,
        })
        .eq("id", input.jobId)
        .eq("user_id", userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        veo3Prompt,
        metadata,
        warnings: vetoFound.length
          ? [`Termos veto detectados no prompt: ${vetoFound.join(", ")}`]
          : [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const code = e?.code || "INTERNAL_ERROR";
    const http = e?.http || 500;
    console.error("[generate-veo3-prompt] error:", code, e?.message);
    return new Response(
      JSON.stringify({ success: false, errorCode: code, error: e?.message || "Erro interno" }),
      { status: http, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
