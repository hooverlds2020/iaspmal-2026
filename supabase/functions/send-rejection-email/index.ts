import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, name } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'IASPMAL 2026 <registros@iaspmal2026.com>',
        reply_to: 'iaspm.al.2026.inscripcion@gmail.com',
        to: [email],
        subject: 'Información sobre tu Inscripción - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc2626; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">XVII Congreso IASPM-AL 2026</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #dc2626;">Información sobre tu inscripción</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Hemos revisado tu inscripción al XVII Congreso de la IASPM-AL 2026.</p>
              <p>Desafortunadamente, no pudimos verificar tu comprobante de pago. Por favor, contacta al comité organizador.</p>
              <p>Saludos,<br><strong>Comité Organizador</strong></p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
