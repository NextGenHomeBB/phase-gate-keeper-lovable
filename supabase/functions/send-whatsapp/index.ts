import { corsHeaders } from '../_shared/cors.ts'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0'

interface WhatsAppRequest {
  to: string
}

interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { to }: WhatsAppRequest = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing "to" field in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN')
    const phoneNumberId = Deno.env.get('PHONE_NUMBER_ID')

    if (!whatsappToken || !phoneNumberId) {
      console.error('Missing required environment variables: WHATSAPP_TOKEN or PHONE_NUMBER_ID')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Kies een optie:" },
        action: {
          buttons: [
            { type: "reply", reply: { id: "JA", title: "Ja" } },
            { type: "reply", reply: { id: "NEE", title: "Nee" } }
          ]
        }
      }
    }

    console.log(`Sending WhatsApp message to: ${to}`)

    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', responseData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send WhatsApp message', 
          details: responseData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('WhatsApp message sent successfully:', responseData)

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-whatsapp function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})