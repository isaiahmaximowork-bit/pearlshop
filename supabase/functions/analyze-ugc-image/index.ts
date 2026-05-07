// Edge function: analyze-ugc-image
// Agente 3 do pipeline Veo 3: recebe a primeira imagem UGC já gerada (e dados de
// referência do avatar/produto) e devolve um relatório JSON estruturado com
// scores de consistência, visibilidade do produto, iluminação, qualidade e
// potencial de movimento — usado depois pelo gerador de prompt Veo 3.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Multimodal: precisa enxergar a imagem.
const VISION_MODEL = "gemini-2.5-flash";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface AnalyzeInput {
  jobId?: string; // se vier, persiste o resultado direto na linha
  ugcImageUrl: string; // URL pública da imagem (storage da etapa 1)
  productName?: string;
  productDescription?: string;
  productCategory?: string;
  productColor?: string;
  productMaterial?: string;
  productFeatures?: string[];
  avatarName?: string;
  avatarDescription?: string;
}

// ---------------------------------------------------------------------------
// Erros do Gemini
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
      console.warn(`[analyze-ugc-image] ${label} attempt ${attempt} (${e?.code}), retry in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function urlToInline(url: string): Promise<{ mimeType: string; data: string }> {
  if (url.startsWith("data:")) {
    const m = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error("Invalid data URL");
    return { mimeType: m[1], data: m[2] };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar imagem: ${res.status}`);
  const mimeType = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return { mimeType, data: btoa(binary) };
}

// ---------------------------------------------------------------------------
// Prompt do Agente 3 — direto do master spec do PDF Veo 3
// ---------------------------------------------------------------------------
function buildAnalysisPrompt(input: AnalyzeInput): string {
  const features = (input.productFeatures || []).filter(Boolean).join(", ") || "(não informado)";
  return `Analise esta imagem UGC (primeiro frame de um vídeo) em DETALHES, como um diretor de fotografia profissional revisando o material antes de gerar movimento.

AVATAR REFERENCE:
${input.avatarName ? `- Name: ${input.avatarName}` : ""}
${input.avatarDescription ? `- Description: ${input.avatarDescription}` : "- (sem descrição adicional)"}

PRODUCT REFERENCE:
- Name: ${input.productName || "(não informado)"}
- Category: ${input.productCategory || "(não informado)"}
- Color: ${input.productColor || "(não informado)"}
- Material: ${input.productMaterial || "(não informado)"}
- Key Features: ${features}
- Description: ${(input.productDescription || "").slice(0, 400) || "(não informado)"}

ANALISE com nota 0-10 cada critério (decimais permitidos):

1. Avatar Consistency — mesmo rosto, mesma identidade, mesmo cabelo, expressão coerente.
2. Product Visibility — produto claramente visível, cor correta, material plausível, características aparentes.
3. Lighting Quality — iluminação profissional, sem sombras duras, cores naturais, profundidade adequada.
4. Overall Quality — poros visíveis, cabelo natural, roupa realista, ZERO artefatos de IA (mãos com 6 dedos, deformações, plástico).
5. Movement Potential — postura natural, mãos bem posicionadas, expressão adequada, espaço pra micro-movimentos críveis no vídeo.

Calcule qualityScore = média ponderada (avatarConsistency 0.25, productVisibility 0.25, lightingQuality 0.15, overallQuality 0.20, movementPotential 0.15).

Liste:
- strengths: o que está ÓTIMO e DEVE ser preservado no vídeo (3-6 itens curtos em inglês)
- weaknesses: o que precisa ser CORRIGIDO/COMPENSADO no prompt do Veo 3 (3-6 itens curtos em inglês)
- recommendations: instruções acionáveis para o gerador de prompt Veo 3 (3-6 itens curtos em inglês)
- optimizationFocus: 2-4 tags curtas em inglês, ex: "reinforce_identity", "boost_product_manipulation", "warmer_lighting", "humanize_micro_movements"

Devolva APENAS JSON válido no schema fornecido. Sem markdown, sem texto fora do JSON.`;
}

// ---------------------------------------------------------------------------
// Chamada Gemini multimodal
// ---------------------------------------------------------------------------
async function callVision(apiKey: string, prompt: string, image: { mimeType: string; data: string }) {
  const url = `${GEMINI_BASE}/${VISION_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: image },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
      maxOutputTokens: 1200,
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
    console.log("[analyze-ugc-image] raw content from gemini:", content);
    return JSON.parse(content);
  } catch (err) {
    console.error("[analyze-ugc-image] JSON parse error:", err, "Content:", content);
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    const e: any = new Error("JSON inválido do Gemini.");
    e.code = "INVALID_JSON";
    e.http = 502;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Normalização (garante números 0-10 e arrays mesmo se modelo errar)
// ---------------------------------------------------------------------------
function clamp(n: any, def = 0): number {
  const v = typeof n === "number" ? n : parseFloat(n);
  if (!isFinite(v)) return def;
  return Math.max(0, Math.min(10, Math.round(v * 10) / 10));
}
function asArr(x: any): string[] {
  if (Array.isArray(x)) return x.map((s) => String(s)).filter(Boolean);
  if (typeof x === "string" && x.trim()) return [x.trim()];
  return [];
}

function normalizeReport(raw: any) {
  const avatarConsistency = clamp(raw.avatarConsistency);
  const productVisibility = clamp(raw.productVisibility);
  const lightingQuality = clamp(raw.lightingQuality);
  const overallQuality = clamp(raw.overallQuality);
  const movementPotential = clamp(raw.movementPotential);
  const computed =
    avatarConsistency * 0.25 +
    productVisibility * 0.25 +
    lightingQuality * 0.15 +
    overallQuality * 0.2 +
    movementPotential * 0.15;
  const qualityScore = clamp(raw.qualityScore ?? computed);
  return {
    avatarConsistency,
    productVisibility,
    lightingQuality,
    overallQuality,
    movementPotential,
    qualityScore,
    strengths: asArr(raw.strengths),
    weaknesses: asArr(raw.weaknesses),
    recommendations: asArr(raw.recommendations),
    optimizationFocus: asArr(raw.optimizationFocus),
  };
}

function statusFromScore(score: number): "confident" | "optimize" | "regenerate" {
  if (score >= 7.5) return "confident";
  if (score >= 6.5) return "optimize";
  return "regenerate";
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

    const input = (await req.json()) as AnalyzeInput;
    if (!input?.ugcImageUrl) {
      return new Response(
        JSON.stringify({ success: false, errorCode: "INVALID_INPUT", error: "ugcImageUrl é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth (job persistence requer usuário; análise pura é permitida sem job)
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

    // 1. Baixar imagem e converter para inline_data
    const image = await urlToInline(input.ugcImageUrl);

    // 2. Análise multimodal
    const prompt = buildAnalysisPrompt(input);
    const raw = await retry(() => callVision(apiKey, prompt, image), "vision-analyze", 3);
    const report = normalizeReport(raw);
    const status = statusFromScore(report.qualityScore);

    // 3. Persistência opcional no media_jobs
    if (input.jobId && userId) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      await admin
        .from("media_jobs")
        .update({
          analysis_report: report,
          analysis_quality_score: report.qualityScore,
        })
        .eq("id", input.jobId)
        .eq("user_id", userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report,
        status, // confident | optimize | regenerate
        model: VISION_MODEL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const code = e?.code || "INTERNAL_ERROR";
    const http = e?.http || 500;
    console.error("[analyze-ugc-image] error:", code, e?.message);
    return new Response(
      JSON.stringify({ success: false, errorCode: code, error: e?.message || "Erro interno" }),
      { status: http, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
