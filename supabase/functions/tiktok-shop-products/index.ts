import { corsHeaders } from '@supabase/supabase-js/cors'

const TIKTOK_API_BASE = 'https://open-api.tiktokglobalshop.com'

function generateSignature(path: string, params: Record<string, string>, secret: string, body?: string): string {
  const sortedKeys = Object.keys(params).sort()
  let input = ''
  for (const key of sortedKeys) {
    // Exclude 'sign' and 'access_token' from signature
    if (key === 'sign' || key === 'access_token') continue
    input += `${key}${params[key]}`
  }
  input = path + input
  if (body) {
    input += body
  }
  input = secret + input + secret

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(input)

  // Use Web Crypto API for HMAC-SHA256
  const cryptoKey = new Uint8Array(keyData)
  return hmacSha256Hex(cryptoKey, msgData)
}

function hmacSha256Hex(key: Uint8Array, message: Uint8Array): string {
  // Deno has crypto.subtle, but we need sync. Use a manual approach.
  // Actually, we'll use async and await it.
  throw new Error('Use async version')
}

async function generateSignatureAsync(path: string, params: Record<string, string>, secret: string, body?: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  let input = ''
  for (const key of sortedKeys) {
    if (key === 'sign' || key === 'access_token') continue
    input += `${key}${params[key]}`
  }
  input = path + input
  if (body) {
    input += body
  }
  input = secret + input + secret

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(input)

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const APP_KEY = Deno.env.get('TIKTOK_SHOP_APP_KEY')
  const APP_SECRET = Deno.env.get('TIKTOK_SHOP_APP_SECRET')

  if (!APP_KEY || !APP_SECRET) {
    return new Response(JSON.stringify({ error: 'Missing TikTok Shop credentials' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Get access token from DB
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: tokenData, error: tokenError } = await supabase
    .from('tiktok_shop_tokens')
    .select('access_token, access_token_expires_at')
    .eq('app_key', APP_KEY)
    .single()

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ error: 'TikTok Shop not connected. Please authorize first.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Check if token expired
  if (new Date(tokenData.access_token_expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: 'Access token expired. Please re-authorize.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Parse query params from request
    const url = new URL(req.url)
    const pageSize = url.searchParams.get('page_size') || '20'
    const pageNumber = url.searchParams.get('page_number') || '1'
    const searchQuery = url.searchParams.get('search') || ''

    const apiPath = '/product/202309/products/search'
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const requestBody: Record<string, unknown> = {
      page_size: parseInt(pageSize),
      page_number: parseInt(pageNumber),
    }

    if (searchQuery) {
      requestBody.search_keyword = searchQuery
    }

    const bodyStr = JSON.stringify(requestBody)

    const queryParams: Record<string, string> = {
      app_key: APP_KEY,
      timestamp,
      version: '202309',
      access_token: tokenData.access_token,
    }

    const sign = await generateSignatureAsync(apiPath, queryParams, APP_SECRET, bodyStr)

    const queryString = new URLSearchParams({
      ...queryParams,
      sign,
    }).toString()

    const apiUrl = `${TIKTOK_API_BASE}${apiPath}?${queryString}`

    console.log('Calling TikTok API:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
    })

    const data = await response.json()

    if (data.code !== 0) {
      console.error('TikTok API error:', data)
      return new Response(JSON.stringify({ error: data.message || 'TikTok API error', details: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
