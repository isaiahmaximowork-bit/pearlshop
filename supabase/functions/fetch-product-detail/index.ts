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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const APP_KEY = Deno.env.get('TIKTOK_SHOP_APP_KEY')
  const APP_SECRET = Deno.env.get('TIKTOK_SHOP_APP_SECRET')
  if (!APP_KEY || !APP_SECRET) {
    return new Response(JSON.stringify({ error: 'Missing TikTok credentials' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Get product_id from request
  let productId: string
  try {
    const body = await req.json()
    productId = body.product_id
  } catch {
    return new Response(JSON.stringify({ error: 'product_id required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Get token
  const { data: tokenData } = await supabase
    .from('tiktok_shop_tokens')
    .select('access_token, shop_cipher')
    .eq('app_key', APP_KEY)
    .maybeSingle()

  if (!tokenData?.access_token || !tokenData?.shop_cipher) {
    return new Response(JSON.stringify({ error: 'TikTok Shop não conectado' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const apiPath = `/product/202309/products/${productId}`
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const queryParams: Record<string, string> = {
      app_key: APP_KEY,
      timestamp,
      shop_cipher: tokenData.shop_cipher,
    }
    const sign = await generateSignature(apiPath, queryParams, APP_SECRET)
    const url = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({ ...queryParams, sign, access_token: tokenData.access_token }).toString()}`

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-tts-access-token': tokenData.access_token, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    console.log('Product detail response:', JSON.stringify(data).substring(0, 500))

    if (data.code !== 0) {
      return new Response(JSON.stringify({ error: data.message, details: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const p = data.data
    // Extract all images
    const images = (p.main_images || p.images?.main_images || []).map((img: any) => img.urls?.[0] || img.url).filter(Boolean)
    
    // Extract variants/SKUs
    const skus = (p.skus || []).map((sku: any) => ({
      id: sku.id,
      seller_sku: sku.seller_sku,
      price: sku.price,
      inventory: sku.inventory,
      sales_attributes: sku.sales_attributes,
    }))

    // Update catalog_products with full detail
    const imageUrl = images[0] || null
    const firstSku = skus[0]
    const salePrice = parseFloat(firstSku?.price?.sale_price) || null
    const originalPrice = parseFloat(firstSku?.price?.original_price) || null
    const currency = firstSku?.price?.currency || 'BRL'

    const { error: upsertError } = await supabase
      .from('catalog_products')
      .upsert({
        product_id: productId,
        product_name: p.title || 'Sem título',
        image_url: imageUrl,
        source_platform: 'tiktok_shop',
        shop_cipher: tokenData.shop_cipher,
        status: (p.status === 'ACTIVATE' || p.status === 4) ? 'active' : 'inactive',
        raw_payload: {
          ...p,
          product_url: `https://www.tiktok.com/view/product/${productId}`,
          extracted_images: images,
          extracted_skus: skus,
        },
        price: salePrice,
        original_price: originalPrice,
        currency,
        is_on_sale: salePrice !== null && originalPrice !== null && salePrice < originalPrice,
      }, { onConflict: 'source_platform,product_id' })

    if (upsertError) console.error('Upsert error:', upsertError)

    return new Response(JSON.stringify({
      success: true,
      product: {
        title: p.title,
        description: p.description,
        images,
        skus,
        category: p.category_chains,
        status: p.status,
        raw: p,
      },
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
