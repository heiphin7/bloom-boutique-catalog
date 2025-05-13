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
          title: 'Ошибка входа',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Вход выполнен',
        description: `Добро пожаловать!`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Ошибка при входе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      console.log('Начало процесса регистрации:', { email, name });
      
      // Validate input
      if (!email || !password || !name) {
        toast({
          title: 'Ошибка валидации',
          description: 'Пожалуйста, заполните все обязательные поля',
          variant: 'destructive',
        });
        return;
      }
      
      if (password.length < 6) {
        toast({
          title: 'Слишком короткий пароль',
          description: 'Пароль должен содержать минимум 6 символов',
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

      console.log('Ответ регистрации:', { 
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        } : null,
        session: data?.session ? 'Сессия существует' : 'Сессия отсутствует',
        error: error || 'Нет ошибок'
      });

      if (error) {
        toast({
          title: 'Ошибка регистрации',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Аккаунт создан',
        description: 'Ваш аккаунт успешно создан.',
      });
      
      // Create a cart for the new user
      if (data.user) {
        try {
          console.log('Creating cart for new user with ID:', data.user.id);
          console.log('User object exists:', !!data.user);
          console.log('User ID exists:', !!data.user.id);
          
          // Validate user ID before inserting
          if (!data.user.id) {
            const errorMsg = "User ID is undefined before cart insert";
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
          
          const insertPayload = { 
            user_id: data.user.id 
          };
          
          console.log('Cart creation payload:', JSON.stringify(insertPayload, null, 2));
          
          // Simplified insert using recommended format
          const { data: cartData, error: cartError, status } = await supabase
            .from('carts')
            .insert(insertPayload)
            .select('id')
            .single();
          
          console.log('Cart creation response status:', status);
          console.log('Cart creation response data:', cartData);
          
          if (cartError) {
            console.error('Error creating cart for new user:', cartError);
            console.error('Error status code:', cartError.code);
            console.error('Error message:', cartError.message);
            console.error('Error details:', cartError.details);
            console.error('Payload that caused error:', insertPayload);
          } else {
            console.log('Successfully created cart for new user:', cartData);
          }
        } catch (cartError) {
          console.error('Exception creating cart:', cartError);
          console.error('Payload that caused exception:', { user_id: data.user?.id });
        }
      } else {
        console.error('Cannot create cart: User object is null or undefined');
      }
      
      // Auto login if email verification is not required
      if (data.session) {
        navigate('/');
      } else {
        toast({
          title: 'Требуется подтверждение',
          description: 'Пожалуйста, проверьте свою почту для подтверждения.',
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
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
          title: 'Ошибка выхода',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Выход выполнен успешно',
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
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
