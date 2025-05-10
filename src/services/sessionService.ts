
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@/types/supabase";

// Get or create session token
export const getOrCreateSessionToken = async (): Promise<string> => {
  // Try to get the session token from localStorage
  let sessionToken = localStorage.getItem('sessionToken');
  
  // If no session token exists, create a new one
  if (!sessionToken) {
    // Create a new session in the database
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({})
      .select('token')
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      // Fallback: Generate a client-side UUID if the database call fails
      sessionToken = crypto.randomUUID();
    } else {
      sessionToken = session.token;
    }
    
    // Store the token in localStorage
    localStorage.setItem('sessionToken', sessionToken);
  }
  
  // Return the session token
  return sessionToken;
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (!sessionToken) {
    return null;
  }
  
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', sessionToken)
    .maybeSingle();
  
  if (error || !session) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return session;
};

// Clear session (logout)
export const clearSession = (): void => {
  localStorage.removeItem('sessionToken');
};

// Refresh session activity
export const refreshSessionActivity = async (): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (sessionToken) {
    const { error } = await supabase
      .from('sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('token', sessionToken);
    
    if (error) {
      console.error('Error refreshing session activity:', error);
    }
  }
};
