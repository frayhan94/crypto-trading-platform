export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export class SupabaseAuthAdapter {
  private static instance: SupabaseAuthAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  private listeners: Set<(state: AuthState) => void> = new Set();

  private constructor() {
    // This would be initialized with actual Supabase client
    // For now, we'll create a mock implementation
    this.client = this.createMockClient();
  }

  static getInstance(): SupabaseAuthAdapter {
    if (!SupabaseAuthAdapter.instance) {
      SupabaseAuthAdapter.instance = new SupabaseAuthAdapter();
    }
    return SupabaseAuthAdapter.instance;
  }

  private createMockClient() {
    // Mock implementation - replace with actual Supabase client
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async (email: string, _password: string) => {
          // Mock sign in
          return { data: { user: { id: 'mock-id', email } }, error: null };
        },
        signUp: async (email: string, _password: string) => {
          // Mock sign up
          return { data: { user: { id: 'mock-id', email } }, error: null };
        },
        signInWithOAuth: async (_provider: string) => {
          // Mock OAuth
          return { data: { user: { id: 'mock-id', email: 'mock@example.com' } }, error: null };
        },
        signOut: async () => ({ error: null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onAuthStateChange: (_callback: (event: string, session: any) => void) => {
          // Mock auth state change listener
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      }
    };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await this.client.auth.getUser();
      if (error || !data.user) return null;
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      const user = data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      } : null;
      
      this.notifyListeners({ user, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      this.notifyListeners({ user: null, isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client.auth.signUp(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      const user = data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      } : null;
      
      this.notifyListeners({ user, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      this.notifyListeners({ user: null, isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({ provider: 'google' });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // In real implementation, OAuth would redirect and handle callback
      const user = data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      } : null;
      
      this.notifyListeners({ user, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      this.notifyListeners({ user: null, isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.client.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      this.notifyListeners({ user: null, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      return { success: false, error: errorMessage };
    }
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.listeners.add(callback);
    
    // Set up Supabase auth state change listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = this.client.auth.onAuthStateChange(async (event: string, session: any) => {
      const user = session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
      } : null;
      
      callback({ user, isLoading: false, error: null });
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      data.subscription.unsubscribe();
    };
  }

  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => listener(state));
  }
}
