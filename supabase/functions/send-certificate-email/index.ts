import { serve } from "https://deno.land/std@0.168.0/http/server.ts"


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, folio, pdfUrl } = await req.json()
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
        subject: '✅ Tu Constancia del XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">¡Tu constancia está lista!</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #0d9488;">Hola ${name},</h2>
              
              <p>Tu constancia del XVII Congreso IASPM-AL 2026 ha sido generada exitosamente.</p>
              
              <div style="background-color: #e0f2f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Folio:</strong> ${folio}</p>
              </div>
              
              <p>Puedes descargar tu constancia haciendo clic en el siguiente botón:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${pdfUrl}" 
                   style="background-color: #0d9488; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  📄 Descargar Constancia
                </a>
              </div>
              
              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                Gracias por tu participación en el XVII Congreso IASPM-AL 2026.<br>
                San Cristóbal de Las Casas, Chiapas, México<br>
                28 de septiembre al 2 de octubre de 2026
              </p>
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
