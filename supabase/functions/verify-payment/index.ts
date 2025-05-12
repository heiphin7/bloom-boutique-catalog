
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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Verifying payment for session:", sessionId);

    // Retrieve the session to check payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Get the order ID from metadata
    const orderId = session.metadata?.orderId;
    
    if (!orderId) {
      throw new Error("Order ID not found in session metadata");
    }

    // Check if payment was successful
    const isPaymentSuccessful = session.payment_status === 'paid';
    
    if (isPaymentSuccessful) {
      // Connect to Supabase to update order status
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Update the order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          stripe_session_id: sessionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        console.error("Error updating order:", updateError);
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }
      
      console.log(`Order ${orderId} marked as paid`);
    }

    // Return payment status
    return new Response(JSON.stringify({
      paid: isPaymentSuccessful,
      orderId: orderId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
