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
        subject: 'Confirmación de Inscripción - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">XVII Congreso IASPM-AL 2026</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #0d9488;">¡Hemos recibido tu inscripción!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Gracias por inscribirte al XVII Congreso de la IASPM-AL 2026.</p>
              <p>Hemos recibido tu solicitud y comprobante. Confirmaremos tu estado en máx. 48 horas.</p>
              <div style="background-color: #e0f2f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>📅 Fecha:</strong> 28 sep - 2 oct 2026</p>
                <p style="margin: 10px 0 0 0;"><strong>📍 Lugar:</strong> San Cristóbal de Las Casas, Chiapas</p>
              </div>
              <p>Saludos cordiales,<br><strong>Comité Organizador IASPM-AL 2026</strong></p>
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
