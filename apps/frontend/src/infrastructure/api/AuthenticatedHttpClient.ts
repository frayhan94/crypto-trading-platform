import { createClient } from '@/lib/supabase/client';
import { HttpClient, ApiResponse } from './HttpClient';

/**
 * An HTTP client that automatically includes the Supabase access token
 * in the Authorization header for authenticated API requests.
 */
export class AuthenticatedHttpClient extends HttpClient {
  private supabase = createClient();

  private async ensureToken(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.access_token) {
      this.setAccessToken(session.access_token);
    } else {
      this.setAccessToken(null);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    await this.ensureToken();
    return super.get<T>(endpoint);
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    await this.ensureToken();
    return super.post<T>(endpoint, body);
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    await this.ensureToken();
    return super.patch<T>(endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    await this.ensureToken();
    return super.delete<T>(endpoint);
  }
}

// Singleton instance for use across the app
let authenticatedClientInstance: AuthenticatedHttpClient | null = null;

export function getAuthenticatedClient(): AuthenticatedHttpClient {
  if (!authenticatedClientInstance) {
    authenticatedClientInstance = new AuthenticatedHttpClient();
  }
  return authenticatedClientInstance;
}
