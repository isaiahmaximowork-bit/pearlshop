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

async function fetchAllShops(appKey: string, appSecret: string, accessToken: string): Promise<Array<{ id: string; cipher: string; name: string }>> {
  const apiPath = '/authorization/202309/shops'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const queryParams: Record<string, string> = { app_key: appKey, timestamp }
  const sign = await generateSignature(apiPath, queryParams, appSecret)
  const url = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({ ...queryParams, sign, access_token: accessToken }).toString()}`
  const res = await fetch(url, { method: 'GET', headers: { 'x-tts-access-token': accessToken } })
  const data = await res.json()
  console.log('Authorized shops response:', JSON.stringify(data))
  if (data.code === 0 && data.data?.shops?.length > 0) {
    return data.data.shops.map((s: any) => ({ id: s.id, cipher: s.cipher, name: s.name || s.id }))
  }
  return []
}

async function fetchProductDetail(productId: string, appKey: string, appSecret: string, accessToken: string, shopCipher: string) {
  const apiPath = `/product/202309/products/${productId}`
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const queryParams: Record<string, string> = {
    app_key: appKey,
    timestamp,
    shop_cipher: shopCipher,
  }
  const sign = await generateSignature(apiPath, queryParams, appSecret)
  const url = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({ ...queryParams, sign, access_token: accessToken }).toString()}`
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-tts-access-token': accessToken, 'Content-Type': 'application/json' },
  })
  const data = await res.json()
  if (data.code === 0 && data.data) {
    return data.data
  }
  console.error(`Failed to fetch detail for product ${productId}:`, data.message)
  return null
}

async function searchProductsForShop(appKey: string, appSecret: string, accessToken: string, shopCipher: string): Promise<any[]> {
  const allProducts: any[] = []
  let pageToken: string | undefined = undefined
  const pageSize = '50'

  // Paginate through all products
  for (let page = 0; page < 20; page++) { // safety limit of 20 pages = 1000 products
    const apiPath = '/product/202309/products/search'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const queryParams: Record<string, string> = {
      app_key: appKey,
      timestamp,
      shop_cipher: shopCipher,
      page_size: pageSize,
    }
    
    const bodyObj: Record<string, any> = {}
    if (pageToken) {
      bodyObj.page_token = pageToken
    }
    const bodyStr = JSON.stringify(bodyObj)

    const sign = await generateSignature(apiPath, queryParams, appSecret, bodyStr)
    const apiUrl = `${TIKTOK_API_BASE}${apiPath}?${new URLSearchParams({ ...queryParams, sign, access_token: accessToken }).toString()}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tts-access-token': accessToken },
      body: bodyStr,
    })
    const data = await response.json()
    console.log(`Shop ${shopCipher} page ${page}: code=${data.code}, products=${data.data?.products?.length || 0}`)

    if (data.code !== 0) {
      console.error(`Search error for shop ${shopCipher}:`, data.message)
      break
    }

    const products = data.data?.products || []
    allProducts.push(...products)

    // Check if there are more pages
    const nextPageToken = data.data?.next_page_token
    if (!nextPageToken || products.length === 0) break
    pageToken = nextPageToken
  }

  return allProducts
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

  try {
    // 2. Fetch ALL authorized shops
    const shops = await fetchAllShops(APP_KEY, APP_SECRET, tokenData.access_token)
    console.log(`Found ${shops.length} authorized shops`)

    if (shops.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhuma loja autorizada encontrada no TikTok Shop.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Search products from ALL shops
    const allUpsertRows: any[] = []

    for (const shop of shops) {
      console.log(`Fetching products from shop: ${shop.name} (${shop.cipher})`)
      
      const products = await searchProductsForShop(APP_KEY, APP_SECRET, tokenData.access_token, shop.cipher)
      console.log(`Found ${products.length} products in shop ${shop.name}`)

      // 4. Fetch details for each product
      const detailedProducts = []
      for (const p of products) {
        const detail = await fetchProductDetail(p.id, APP_KEY, APP_SECRET, tokenData.access_token, shop.cipher)
        detailedProducts.push(detail || p)
      }

      // 5. Build upsert rows
      for (const p of detailedProducts) {
        const imageUrl = p.main_images?.[0]?.urls?.[0] 
          || p.main_images?.[0]?.url 
          || p.images?.main_images?.[0]?.urls?.[0]
          || null

        const firstSku = Array.isArray(p.skus) ? p.skus[0] : null
        const skuPrice = firstSku?.price || {}
        const salePrice = parseFloat(skuPrice.sale_price) || null
        const originalPrice = parseFloat(skuPrice.original_price) || null
        const currency = skuPrice.currency || 'BRL'
        const isOnSale = salePrice !== null && originalPrice !== null && salePrice < originalPrice

        allUpsertRows.push({
          product_id: p.id,
          product_name: p.title || 'Sem título',
          image_url: imageUrl,
          source_platform: 'tiktok_shop',
          shop_cipher: shop.cipher,
          status: (p.status === 'ACTIVATE' || p.status === 4) ? 'active' : 'inactive',
          raw_payload: p,
          price: salePrice,
          original_price: originalPrice,
          currency,
          is_on_sale: isOnSale,
        })
      }
    }

    console.log(`Total products to upsert: ${allUpsertRows.length}`)

    // 6. Upsert all products
    if (allUpsertRows.length > 0) {
      const { error: upsertError } = await supabase
        .from('catalog_products')
        .upsert(allUpsertRows, { onConflict: 'source_platform,product_id' })
      if (upsertError) {
        console.error('Upsert error:', upsertError)
      } else {
        console.log(`Upserted ${allUpsertRows.length} products from ${shops.length} shops`)
      }
    }

    // 7. Return catalog
    const { data: catalogData } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('source_platform', 'tiktok_shop')
      .order('created_at', { ascending: false })

    return new Response(JSON.stringify({
      success: true,
      imported: allUpsertRows.length,
      shops: shops.length,
      products: catalogData || [],
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
