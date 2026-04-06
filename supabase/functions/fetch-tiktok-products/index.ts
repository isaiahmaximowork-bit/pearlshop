import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIKTOK_API_BASE = 'https://open-api.tiktokglobalshop.com'

async function generateSignature(path: string, params: Record<string, string>, secret: string, body?: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  let input = ''
  for (const key of sortedKeys) {
    if (key === 'sign' || key === 'access_token') continue
    input += `${key}${params[key]}`
  }
  input = path + input
  if (body) input += body
  input = secret + input + secret

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(input)
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function fetchShopCipher(appKey: string, appSecret: string, accessToken: string): Promise<string | null> {
  const apiPath = '/authorization/202309/shops'
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const queryParams: Record<string, string> = {
    app_key: appKey,
    timestamp,
  }

  const sign = await generateSignature(apiPath, queryParams, appSecret)

  const url = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({ ...queryParams, sign, access_token: accessToken }).toString()}`
  console.log('Fetching authorized shops:', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-tts-access-token': accessToken },
  })
  const data = await res.json()
  console.log('Authorized shops response:', JSON.stringify(data))

  if (data.code === 0 && data.data?.shops?.length > 0) {
    return data.data.shops[0].cipher
  }
  return null
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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Get token
  const { data: tokenData, error: tokenError } = await supabase
    .from('tiktok_shop_tokens')
    .select('access_token, access_token_expires_at, shop_cipher, app_key')
    .eq('app_key', APP_KEY)
    .maybeSingle()

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ error: 'TikTok Shop não conectado. Autorize primeiro.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (new Date(tokenData.access_token_expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: 'Token expirado. Re-autorize o TikTok Shop.', expired: true }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2. Get or fetch shop_cipher
  let shopCipher = tokenData.shop_cipher
  if (!shopCipher) {
    console.log('shop_cipher is null, fetching from TikTok API...')
    shopCipher = await fetchShopCipher(APP_KEY, APP_SECRET, tokenData.access_token)
    if (shopCipher) {
      await supabase
        .from('tiktok_shop_tokens')
        .update({ shop_cipher: shopCipher })
        .eq('app_key', APP_KEY)
      console.log('Saved shop_cipher:', shopCipher)
    } else {
      return new Response(JSON.stringify({ error: 'Nenhuma loja autorizada encontrada no TikTok Shop.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  try {
    // 3. Fetch products from TikTok API
    const apiPath = '/product/202309/products/search'
    const timestamp = Math.floor(Date.now() / 1000).toString()

    // page_size goes as query param, NOT in body (per TikTok API v202309 spec)
    const queryParams: Record<string, string> = {
      app_key: APP_KEY,
      timestamp,
      shop_cipher: shopCipher,
      page_size: '50',
    }

    // Body is empty object for search without filters
    const bodyStr = JSON.stringify({})

    const sign = await generateSignature(apiPath, queryParams, APP_SECRET, bodyStr)

    const apiUrl = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({
      ...queryParams,
      sign,
      access_token: tokenData.access_token,
    }).toString()}`

    console.log('Calling TikTok products API:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tts-access-token': tokenData.access_token,
      },
      body: bodyStr,
    })

    const data = await response.json()
    console.log('TikTok products response code:', data.code, 'message:', data.message)

    if (data.code !== 0) {
      return new Response(JSON.stringify({ error: data.message || 'TikTok API error', details: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const products = data.data?.products || []
    console.log(`Found ${products.length} products from TikTok`)

    // 4. Upsert into catalog_products
    const upsertRows = products.map((p: any) => ({
      product_id: p.id,
      product_name: p.title || 'Sem título',
      image_url: p.main_images?.[0]?.urls?.[0] || p.main_images?.[0]?.url || null,
      source_platform: 'tiktok_shop',
      shop_cipher: shopCipher,
      status: (p.status === 'ACTIVATE' || p.status === 4) ? 'active' : 'inactive',
      raw_payload: p,
    }))

    if (upsertRows.length > 0) {
      const { error: upsertError } = await supabase
        .from('catalog_products')
        .upsert(upsertRows, { onConflict: 'source_platform,product_id' })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
      } else {
        console.log(`Upserted ${upsertRows.length} products into catalog_products`)
      }
    }

    // 5. Return catalog data
    const { data: catalogData, error: catalogError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('source_platform', 'tiktok_shop')
      .order('created_at', { ascending: false })

    return new Response(JSON.stringify({
      success: true,
      imported: upsertRows.length,
      products: catalogData || [],
      tiktok_raw: data,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
