import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, name, category } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const TELEGRAM_BOT_TOKEN = '8651018116:AAF1rPBZg0v5o_3RznqSJnFDtVAjbnMxOWU'
    const TELEGRAM_CHAT_ID = '1608294578'

    // 1. Correo de confirmaci√≥n al usuario
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'IASPMAL 2026 <registros@iaspmal2026.com>',
        reply_to: 'iaspm.al.2026.inscripcion@gmail.com',
        to: [email],
        subject: 'Confirmaci√≥n de Inscripci√≥n - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">XVII Congreso IASPM-AL 2026</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #0d9488;">¬°Hemos recibido tu inscripci√≥n!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Gracias por inscribirte al XVII Congreso de la IASPM-AL 2026.</p>
              <p>Hemos recibido tu solicitud y comprobante. Confirmaremos tu estado en m√°x. 48 horas.</p>
              <div style="background-color: #e0f2f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Ì≥Ö Fecha:</strong> 28 sep - 2 oct 2026</p>
                <p style="margin: 10px 0 0 0;"><strong>Ì≥ç Lugar:</strong> San Crist√≥bal de Las Casas, Chiapas</p>
              </div>
              <p>Saludos cordiales,<br><strong>Comit√© Organizador IASPM-AL 2026</strong></p>
            </div>
          </div>
        `,
      }),
    })

    // 2. Correo de notificaci√≥n al comit√©
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'IASPMAL 2026 <registros@iaspmal2026.com>',
        to: ['iaspm.al.2026.inscripcion@gmail.com'],
        subject: 'Ì∂ï Nuevo registro - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Nuevo Registro Recibido</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Categor√≠a:</strong> ${category || 'No especificada'}</p>
              <p style="color: #6b7280; font-size: 12px;">Revisa el panel de administraci√≥n para aprobar o rechazar.</p>
            </div>
          </div>
        `,
      }),
    })

    // 3. Notificaci√≥n a Telegram
    const categoryLabel = category ? category.replace(/_/g, ' ').toUpperCase() : 'NO ESPECIFICADA'
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `Ì∂ï *Nuevo registro - IASPM-AL 2026*\n\nÌ±§ *Nombre:* ${name}\nÌ≥ß *Email:* ${email}\nÌæüÔ∏è *Categor√≠a:* ${categoryLabel}`,
        parse_mode: 'Markdown',
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
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
