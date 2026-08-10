import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const PROJECT_REF = Deno.env.get('SUPABASE_PROJECT_REF') || 'YOUR_PROJECT_REF';
const APPROVAL_SECRET = Deno.env.get('APPROVAL_SECRET') || 'secret_token_123';

serve(async (req) => {
  // Parse the webhook payload
  const payload = await req.json()
  
  // We only care about INSERT events to the access_grants table where status is pending
  if (payload.type === 'INSERT' && payload.table === 'access_grants' && payload.record.status === 'pending') {
    const userEmail = payload.record.email;
    const recordId = payload.record.id; // UUID of the grant
    
    // Construct Approval Links
    const baseUrl = `https://${PROJECT_REF}.supabase.co/functions/v1/approve-access?id=${recordId}&token=${APPROVAL_SECRET}`;
    
    const link15 = `${baseUrl}&days=15`;
    const link30 = `${baseUrl}&days=30`;
    const link90 = `${baseUrl}&days=90`;
    const link180 = `${baseUrl}&days=180`;
    const link365 = `${baseUrl}&days=365`;
    const linkLifetime = `${baseUrl}&days=36500`; // 100 years

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Marketing Academy <admin@resend.dev>', // Resend test email
        to: 'try.kartik9@gmail.com', // Host email
        subject: `[Access Request] ${userEmail} wants to join`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #6C5CE7;">New Access Request</h2>
            <p><strong>User Email:</strong> ${userEmail}</p>
            <p>This user is waiting for your approval to access the Marketing Mastery.</p>
            <p>Click one of the buttons below to instantly grant them access:</p>
            
            <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px;">
              <a href="${link15}" style="padding: 10px 15px; background: #00cec9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant 15 Days</a>
              <a href="${link30}" style="padding: 10px 15px; background: #0984e3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant 30 Days</a>
              <a href="${link90}" style="padding: 10px 15px; background: #6c5ce7; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant 90 Days</a>
              <a href="${link180}" style="padding: 10px 15px; background: #fdcb6e; color: black; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant 180 Days</a>
              <a href="${link365}" style="padding: 10px 15px; background: #e17055; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant 1 Year</a>
              <a href="${linkLifetime}" style="padding: 10px 15px; background: #d63031; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Grant Lifetime</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              If you don't want to grant access, simply ignore this email.
            </p>
          </div>
        `,
      }),
    })

    if (res.ok) {
      return new Response(JSON.stringify({ message: "Email sent" }), { headers: { "Content-Type": "application/json" } })
    } else {
      const error = await res.text()
      return new Response(JSON.stringify({ error }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
  }

  return new Response("Webhook received, but ignored.", { status: 200 })
})
