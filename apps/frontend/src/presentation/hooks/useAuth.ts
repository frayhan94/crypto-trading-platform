import { useState, useEffect, useCallback } from 'react';
import { AuthState } from '../../infrastructure/auth/SupabaseAuthAdapter';
import { SupabaseAuthAdapter } from '../../infrastructure/auth/SupabaseAuthAdapter';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const authAdapter = SupabaseAuthAdapter.getInstance();

  useEffect(() => {
    // Get initial user state
    const initializeAuth = async () => {
      try {
        const user = await authAdapter.getCurrentUser();
        setState({ user, isLoading: false, error: null });
      } catch (error) {
        setState({ 
          user: null, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Auth initialization failed' 
        });
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const unsubscribe = authAdapter.onAuthStateChange((authState) => {
      setState(authState);
    });

    return unsubscribe;
  }, [authAdapter]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await authAdapter.signIn(email, password);
    
    if (!result.success) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'Sign in failed' 
      }));
    }
    
    return result;
  }, [authAdapter]);

  const signUp = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await authAdapter.signUp(email, password);
    
    if (!result.success) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'Sign up failed' 
      }));
    }
    
    return result;
  }, [authAdapter]);

  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await authAdapter.signInWithGoogle();
    
    if (!result.success) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'Google sign in failed' 
      }));
    }
    
    return result;
  }, [authAdapter]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await authAdapter.signOut();
    
    if (!result.success) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'Sign out failed' 
      }));
    }
    
    return result;
  }, [authAdapter]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };
};
