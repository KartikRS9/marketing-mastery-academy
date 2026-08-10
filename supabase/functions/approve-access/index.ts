import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APPROVAL_SECRET = Deno.env.get('APPROVAL_SECRET') || 'secret_token_123';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  // We expect a GET request from the email link
  const url = new URL(req.url)
  
  const grantId = url.searchParams.get('id')
  const days = parseInt(url.searchParams.get('days') || '0', 10)
  const token = url.searchParams.get('token')

  // Basic security check to ensure random internet scanners don't approve requests
  if (token !== APPROVAL_SECRET) {
    return new Response("Unauthorized: Invalid security token.", { status: 401 })
  }

  if (!grantId || days <= 0) {
    return new Response("Invalid request parameters.", { status: 400 })
  }

  // Calculate the expiration date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)

  // Update the database bypassing RLS (since we are using Service Role Key)
  const { data, error } = await supabase
    .from('access_grants')
    .update({ 
      status: 'approved',
      expires_at: expiresAt.toISOString()
    })
    .eq('id', grantId)
    .select('email')
    .single()

  if (error) {
    return new Response(`Error updating database: ${error.message}`, { status: 500 })
  }

  // Return a nice HTML success message to the host
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Granted</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0c10; color: #fff; text-align: center; padding-top: 100px; }
        .card { background: #191c21; padding: 40px; border-radius: 12px; display: inline-block; border: 1px solid #cca04c; box-shadow: 0 0 20px rgba(204, 160, 76, 0.2); }
        h1 { color: #00cec9; margin-bottom: 10px; }
        p { color: #aaa; font-size: 18px; }
        .email { color: #fff; font-weight: bold; }
        .success-icon { font-size: 50px; color: #00cec9; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="success-icon">✓</div>
        <h1>Access Granted Successfully</h1>
        <p>You have approved access for <span class="email">${data.email}</span></p>
        <p>They now have access for the next <strong>${days === 36500 ? 'Lifetime' : days + ' days'}</strong>.</p>
        <p style="font-size: 14px; margin-top: 30px;">You can close this tab.</p>
      </div>
    </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: { "Content-Type": "text/html" },
  })
})
