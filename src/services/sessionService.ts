
import { supabase } from "@/integrations/supabase/client";

// This file has been refactored to use Supabase Auth
// The previous session token functionality has been removed

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return session;
};

// Clear session (logout)
export const clearSession = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// Refresh session activity - now a no-op as Supabase handles this automatically
export const refreshSessionActivity = async (): Promise<void> => {
  // Supabase automatically refreshes tokens, so no explicit action needed
  return;
};

// For backward compatibility - methods below should not be called anymore
export const getOrCreateSessionToken = async (): Promise<string> => {
  const session = await getCurrentSession();
  if (session) {
    return session.access_token;
  }
  throw new Error('Not authenticated');
};
