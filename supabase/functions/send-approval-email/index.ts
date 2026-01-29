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
        from: 'IASPMAL 2026 <registros@clickwebhoover.online>',
        to: [email],
        subject: '✅ Inscripción Aprobada - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #059669; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">¡Inscripción Aprobada!</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #059669;">Bienvenido/a al congreso</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Tu inscripción al XVII Congreso de la IASPM-AL 2026 ha sido <strong>aprobada</strong> y tu pago verificado.</p>
              <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                 <p style="margin: 0;"><strong>📅 Fecha:</strong> 28 sep - 2 oct 2026</p>
                 <p style="margin: 10px 0 0 0;"><strong>📍 Lugar:</strong> San Cristóbal de Las Casas, Chiapas</p>
              </div>
              <p>¡Nos vemos en San Cristóbal!</p>
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
