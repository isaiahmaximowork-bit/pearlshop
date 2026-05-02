// Edge function: generate-script
// Gera roteiro UGC (promocional | indicacional | storytelling) usando a API
// oficial do Google Gemini (gemini-2.5-flash). Recebe configuração de voz
// completa + dados do produto + duração e devolve apenas o roteiro pronto
// para preencher a textarea do Studio.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.5-flash";

// ============================================================================
// Tipos
// ============================================================================
type ScriptType = "promocional" | "indicacional" | "storytelling";

interface GenerateScriptInput {
  scriptType: ScriptType;
  // Produto
  productId?: string | null;
  catalogProductId?: string | null;
  productName?: string | null;
  productDescription?: string | null;
  productCategory?: string | null;
  // Voz
  voiceGender?: string;
  voiceTone?: string;
  voiceEnergy?: string;
  voiceStyle?: string;
  // Duração ("1take" | "2takes" | ...)
  duration?: string;
}

// ============================================================================
// Helpers
// ============================================================================
function durationToWords(duration?: string): { min: number; max: number; seconds: number } {
  // ~2.5 palavras/segundo em PT-BR conversacional
  const map: Record<string, number> = {
    "1take": 8,
    "2takes": 16,
    "3takes": 24,
    "4takes": 32,
    "5takes": 40,
  };
  const seconds = map[duration || "1take"] ?? 8;
  // Margem para entrega natural com pausas
  const min = Math.max(12, Math.round(seconds * 2.0));
  const max = Math.round(seconds * 2.8);
  return { min, max, seconds };
}

function styleGuide(type: ScriptType): string {
  switch (type) {
    case "promocional":
      return `ESTILO: PROMOCIONAL (venda direta, oferta, urgência)
- Abertura em gancho forte (pergunta retórica, afirmação ousada ou "olha isso").
- Destaque 1-2 benefícios CONCRETOS do produto (não adjetivos vazios).
- Crie senso de oportunidade ("aproveita", "antes que acabe", "no link").
- Termine com CTA explícito mencionando "PearlShop" ou "link na bio".
- Energia alta mesmo se o tom for calmo. Linguagem de creator, não de comercial de TV.`;
    case "indicacional":
      return `ESTILO: INDICACIONAL (recomendação amiga, autêntica, sem pressão)
- Abertura em tom de conversa íntima ("gente, eu preciso te contar", "olha que coisa boa").
- Fale como quem JÁ USA o produto há tempo, com detalhes reais do dia a dia.
- Mencione 1 detalhe específico de uso (textura, sensação, situação concreta).
- Sem hype agressivo. Sem "promoção", sem "corre". Confiança calma.
- CTA suave: "se quiser, dá uma olhada na PearlShop" ou similar.`;
    case "storytelling":
      return `ESTILO: STORYTELLING (mini-narrativa pessoal, arco emocional)
- Abertura com micro-conflito ou situação ("eu vivia frustrada com X", "semana passada aconteceu...").
- Meio: descoberta do produto como virada de chave, com detalhe sensorial.
- Fim: transformação concreta + reflexão curta. CTA orgânico, não forçado.
- Linguagem visual, com imagens mentais. Pausas naturais. Vulnerabilidade real.
- NUNCA soar publicitário. Soar como desabafo bom.`;
  }
}

function buildSystemPrompt(input: GenerateScriptInput): string {
  const { min, max, seconds } = durationToWords(input.duration);
  const productLine = [
    input.productName && `Nome: ${input.productName}`,
    input.productCategory && `Categoria: ${input.productCategory}`,
    input.productDescription && `Descrição: ${input.productDescription.slice(0, 400)}`,
  ]
    .filter(Boolean)
    .join("\n- ");

  return `Você é um copywriter brasileiro especialista em UGC (User Generated Content) para TikTok e Reels. Seu trabalho é escrever roteiros que pareçam gravados por uma pessoa real, NÃO por uma marca.

PRODUTO:
- ${productLine || "(produto não informado — fale de forma genérica mas natural)"}

CONFIGURAÇÃO DE VOZ (o roteiro DEVE refletir isso na escolha de palavras, ritmo e pontuação):
- Gênero do narrador: ${input.voiceGender || "feminino"}
- Tom de voz: ${input.voiceTone || "natural"}
- Energia: ${input.voiceEnergy || "media"}
- Estilo: ${input.voiceStyle || "conversacional"}

${styleGuide(input.scriptType)}

REGRAS DE NATURALIDADE (OBRIGATÓRIAS):
1. Português brasileiro coloquial. Frases curtas. Use contrações ("tô", "pra", "tava") quando fizer sentido para o tom.
2. NADA de palavras roboticamente publicitárias: "incrível", "revolucionário", "mude sua vida", "produto inovador" — proibidas.
3. Pelo menos UMA pausa/respiração natural (vírgula bem colocada ou reticências sutis).
4. Mencione o produto pelo nome OU por uma referência clara ("esse vestido", "essa peça") — nunca "este produto".
5. Zero emoji. Zero hashtag. Zero marcação. Apenas o texto falado limpo.
6. Não escreva indicações de cena, direção ou parênteses. Só o que sai da boca da pessoa.

TAMANHO ALVO: ${min} a ${max} palavras (≈ ${seconds}s de fala). Não ultrapasse.

SAÍDA: devolva APENAS o roteiro em texto puro, sem aspas, sem cabeçalho, sem rodapé, sem explicação. A primeira linha já é a primeira frase falada.`;
}

function userPrompt(input: GenerateScriptInput): string {
  return `Gere agora UM roteiro ${input.scriptType} único, fresco, que pareça improvisado por uma creator brasileira. Siga TODAS as regras do system prompt. Apenas o texto falado, nada mais.`;
}

// Map de erros do Gemini → códigos da app
function mapGeminiError(status: number, body: string): { code: string; message: string; http: number } {
  if (status === 429) return { code: "RATE_LIMIT", message: "Rate limit do Gemini.", http: 429 };
  if (status === 402 || /quota|billing/i.test(body))
    return { code: "AI_CREDITS_EXHAUSTED", message: "Créditos do Gemini esgotados.", http: 402 };
  if (status === 403)
    return { code: "AI_CREDITS_EXHAUSTED", message: "Acesso negado pelo Gemini (verifique billing).", http: 402 };
  if (status === 503 || status === 502 || status === 504)
    return { code: "MODEL_OVERLOADED", message: "Gemini sobrecarregado.", http: 503 };
  return { code: "GEMINI_ERROR", message: `Gemini error ${status}: ${body.slice(0, 300)}`, http: 500 };
}

async function callGemini(apiKey: string, system: string, user: string): Promise<string> {
  const url = `${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 1.0, // criatividade alta para variar entre gerações
      topP: 0.95,
      maxOutputTokens: 600,
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
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text || "")
      .join("")
      .trim() || "";
  if (!text) {
    const e: any = new Error("Resposta vazia do Gemini.");
    e.code = "EMPTY_RESPONSE";
    e.http = 502;
    throw e;
  }
  return text;
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
      console.warn(`[generate-script] ${label} attempt ${attempt} failed (${e?.code}), retry in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// ============================================================================
// Enriquecer produto a partir do banco se faltar info
// ============================================================================
async function enrichProduct(input: GenerateScriptInput) {
  if (input.productName && input.productDescription) return input;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) return input;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const catalogId = input.catalogProductId;
  const userProductId = input.productId;

  try {
    if (catalogId) {
      const { data } = await admin
        .from("catalog_products")
        .select("product_name, description, image_url")
        .eq("id", catalogId)
        .maybeSingle();
      if (data) {
        return {
          ...input,
          productName: input.productName || data.product_name,
          productDescription: input.productDescription || data.description,
        };
      }
    }
    if (userProductId) {
      const { data } = await admin
        .from("user_products")
        .select("category, catalog_products(product_name, description, image_url)")
        .eq("id", userProductId)
        .maybeSingle();
      if (data) {
        const cp: any = (data as any).catalog_products;
        return {
          ...input,
          productName: input.productName || cp?.product_name,
          productDescription: input.productDescription || cp?.description,
          productCategory: input.productCategory || (data as any).category,
        };
      }
    }
  } catch (e) {
    console.warn("[generate-script] enrich failed:", e);
  }
  return input;
}

// ============================================================================
// Handler
// ============================================================================
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

    const raw = (await req.json()) as GenerateScriptInput;

    // Validação mínima
    const allowed: ScriptType[] = ["promocional", "indicacional", "storytelling"];
    if (!raw?.scriptType || !allowed.includes(raw.scriptType)) {
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: "INVALID_INPUT",
          error: "scriptType deve ser promocional | indicacional | storytelling.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const enriched = await enrichProduct(raw);
    const system = buildSystemPrompt(enriched);
    const user = userPrompt(enriched);

    const script = await retry(() => callGemini(apiKey, system, user), "callGemini", 3);

    // Limpa eventuais aspas/markdown que o modelo possa adicionar
    const cleaned = script
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/^\s*roteiro\s*:?\s*/i, "")
      .trim();

    return new Response(
      JSON.stringify({
        success: true,
        script: cleaned,
        meta: {
          scriptType: raw.scriptType,
          duration: raw.duration,
          wordCount: cleaned.split(/\s+/).filter(Boolean).length,
          model: TEXT_MODEL,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const code = e?.code || "INTERNAL_ERROR";
    const http = e?.http || 500;
    console.error("[generate-script] error:", code, e?.message);
    return new Response(
      JSON.stringify({ success: false, errorCode: code, error: e?.message || "Erro interno" }),
      { status: http, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
