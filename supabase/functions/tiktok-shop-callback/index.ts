const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TIKTOK_AUTH_URL = 'https://auth.tiktok-shops.com/api/v2/token/get'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const APP_KEY = Deno.env.get('TIKTOK_SHOP_APP_KEY')
  const APP_SECRET = Deno.env.get('TIKTOK_SHOP_APP_SECRET')

  if (!APP_KEY || !APP_SECRET) {
    console.error('Missing TikTok Shop credentials')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${TIKTOK_AUTH_URL}?app_key=${APP_KEY}&app_secret=${APP_SECRET}&auth_code=${code}&grant_type=authorized_code`, {
      method: 'GET',
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.code !== 0) {
      console.error('TikTok token exchange failed:', tokenData)
      return new Response(JSON.stringify({ error: 'Failed to exchange token', details: tokenData.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { access_token, refresh_token, access_token_expire_in, refresh_token_expire_in, open_id, seller_name, seller_base_region } = tokenData.data

    // Get authorized shops to retrieve shop_cipher
    let shopCipher = null
    try {
      const shopsResponse = await fetch(`https://auth.tiktok-shops.com/api/v2/shops?app_key=${APP_KEY}&app_secret=${APP_SECRET}&access_token=${access_token}`, {
        method: 'GET',
      })
      const shopsData = await shopsResponse.json()
      if (shopsData.code === 0 && shopsData.data?.shops?.length > 0) {
        shopCipher = shopsData.data.shops[0].cipher
        console.log('Got shop_cipher:', shopCipher)
      } else {
        console.log('No shops found or error:', JSON.stringify(shopsData))
      }
    } catch (e) {
      console.error('Error fetching shops:', e)
    }

    // Store tokens in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase
      .from('tiktok_shop_tokens')
      .upsert({
        app_key: APP_KEY,
        access_token,
        refresh_token,
        access_token_expires_at: new Date(Date.now() + access_token_expire_in * 1000).toISOString(),
        refresh_token_expires_at: new Date(Date.now() + refresh_token_expire_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        open_id: open_id || null,
        seller_name: seller_name || null,
        seller_base_region: seller_base_region || null,
        shop_cipher: shopCipher,
      }, { onConflict: 'app_key' })

    if (dbError) {
      console.error('Failed to store tokens:', dbError)
      return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Redirect to success page
    return new Response(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #020105; color: white;">
          <div style="text-align: center;">
            <h1 style="color: #a855f7;">✅ TikTok Shop Conectado!</h1>
            <p>Sua conta foi autorizada com sucesso. Pode fechar esta janela.</p>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
