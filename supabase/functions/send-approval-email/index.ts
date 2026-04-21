import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. RECIBIMOS LOS DATOS NUEVOS (attendanceCode y category)
    const { email, name, attendanceCode, category } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // 2. GENERAMOS LA URL Y LA IMAGEN DEL QR
    // Esta es la URL a la que llevará el QR (con autorrelleno)
    const attendanceUrl = `https://iaspmal2026.com/asistencia?code=${attendanceCode || ''}`
    
    // Usamos QuickChart para generar la imagen del QR incrustable en el email
    // Nota: encodeURIComponent es vital para que la URL pase bien
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(attendanceUrl)}&size=300&margin=1&dark=000000&light=ffffff`

    // Formatear categoría para que se vea bonita (ej: 'estudiante' -> 'ESTUDIANTE')
    const categoryLabel = category ? category.replace(/_/g, ' ').toUpperCase() : 'ASISTENTE';

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
        subject: '✅ Inscripción Aprobada y Gafete Digital - XVII Congreso IASPM-AL 2026',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            
            <div style="background-color: #059669; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">¡Inscripción Aprobada!</h1>
            </div>

            <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              <p style="font-size: 16px; color: #4b5563;">
                Nos complace informarte que tu inscripción al <strong>XVII Congreso de la IASPM-AL 2026</strong> ha sido confirmada y tu pago verificado.
              </p>

              <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                 <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> 28 sep - 2 oct 2026</p>
                 <p style="margin: 5px 0;"><strong>📍 Lugar:</strong> San Cristóbal de Las Casas, Chiapas</p>
              </div>

              <p style="text-align: center; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">👇 TU GAFETE DE ACCESO DIGITAL 👇</p>

              <div style="border: 2px dashed #059669; border-radius: 12px; padding: 25px; text-align: center; background-color: #fafafa; margin-bottom: 30px;">
                
                <h2 style="margin: 0; color: #111827; font-size: 20px;">${name}</h2>
                <div style="margin-top: 5px; margin-bottom: 15px;">
                   <span style="background-color: #059669; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
                      ${categoryLabel}
                   </span>
                </div>

                <img src="${qrImageUrl}" alt="Código QR de Asistencia" width="200" height="200" style="display: block; margin: 0 auto; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                
                <p style="margin-top: 15px; margin-bottom: 5px; font-size: 12px; color: #6b7280;">Código de Asistencia:</p>
                <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #374151; letter-spacing: 2px; background: #fff; display: inline-block; padding: 5px 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                    ${attendanceCode || 'PENDIENTE'}
                </div>
                <p style="font-size: 11px; color: #9ca3af; margin-top: 10px;">Muestra este código en la mesa de registro</p>
              </div>
              <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <p style="margin: 0; color: #4b5563;">¡Nos vemos pronto en San Cristóbal!</p>
                <p style="margin-top: 5px; color: #9ca3af; font-size: 12px;">Comité Organizador IASPM-AL 2026</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 11px;">
              <p>© 2026 IASPM-AL. Todos los derechos reservados.</p>
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
