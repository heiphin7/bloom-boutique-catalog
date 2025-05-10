
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    setIsLoading(true);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
    
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
    
          // ✅ Создаём корзину, если надо
          import('@/services/cartService').then(({ getOrCreateCart }) => {
            console.log('Triggering getOrCreateCart from onAuthStateChange...');
            getOrCreateCart()
              .then((id) => console.log('Cart ID (onAuthStateChange):', id))
              .catch((err) => console.error('Failed to create/fetch cart:', err));
          });
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Signed in successfully',
        description: `Welcome back!`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      console.log('Starting sign up process with:', { email, name });
      
      // Validate input
      if (!email || !password || !name) {
        toast({
          title: 'Validation error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      if (password.length < 6) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 6 characters',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Account created',
        description: 'Your account has been created successfully.',
      });
      
      // Create a cart for the new user
      if (data.user) {
        try {
          console.log('Creating cart for new user with ID:', data.user.id);
          
          const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .upsert({ 
              user_id: data.user.id 
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            })
            .select('id');
          
          if (cartError) {
            console.error('Error creating cart for new user:', cartError);
          } else {
            console.log('Successfully created cart for new user:', cartData);
          }
        } catch (cartError) {
          console.error('Exception creating cart:', cartError);
        }
      }
      
      // Auto login if email verification is not required
      if (data.session) {
        navigate('/');
      } else {
        toast({
          title: 'Verification required',
          description: 'Please check your email for verification instructions.',
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Signed out successfully',
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
