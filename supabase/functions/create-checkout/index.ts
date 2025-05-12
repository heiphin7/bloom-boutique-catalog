
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get request body
    const { orderId, cartItems, customerInfo } = await req.json();
    
    if (!orderId || !cartItems || !cartItems.length || !customerInfo) {
      throw new Error("Missing required information");
    }

    console.log("Creating checkout session for order:", orderId);

    // Create line items for Stripe checkout
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'kzt', // Change currency to KZT
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          description: `Quantity: ${item.quantity}`,
        },
        unit_amount: Math.round(item.price * 100), // KZT amount in tiyn (smallest currency unit)
      },
      quantity: item.quantity,
    }));

    // Get origin for success and cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/payment/${orderId}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/orders?canceled=true`,
      metadata: {
        orderId: orderId,
      },
      customer_email: customerInfo.email,
      currency: 'kzt', // Set currency to KZT
    });

    // Return the session ID and URL
    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
