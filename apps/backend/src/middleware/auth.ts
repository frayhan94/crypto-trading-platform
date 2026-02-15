import { Context, Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Supabase JWT configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

// User info extracted from JWT
export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

// Extend Hono's Context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Authentication middleware that verifies Supabase JWT tokens.
 * 
 * The token can be verified in two ways:
 * 1. Using the JWT secret directly (SUPABASE_JWT_SECRET)
 * 2. Using Supabase's JWKS endpoint (requires SUPABASE_URL)
 * 
 * For best security, use the JWT secret approach.
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid Authorization header' 
    }, 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    let payload: { sub?: string; email?: string; role?: string };

    if (supabaseJwtSecret) {
      // Verify using JWT secret (recommended)
      const secret = new TextEncoder().encode(supabaseJwtSecret);
      const { payload: verifiedPayload } = await jwtVerify(token, secret, {
        issuer: supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined,
      });
      payload = verifiedPayload as typeof payload;
    } else if (supabaseUrl) {
      // Fallback: Verify using JWKS (requires network call)
      const JWKS = createRemoteJWKSet(
        new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
      );
      const { payload: verifiedPayload } = await jwtVerify(token, JWKS, {
        issuer: `${supabaseUrl}/auth/v1`,
      });
      payload = verifiedPayload as typeof payload;
    } else {
      console.error('Auth middleware: Neither SUPABASE_JWT_SECRET nor SUPABASE_URL configured');
      return c.json({ 
        error: 'Server Configuration Error', 
        message: 'Authentication not properly configured' 
      }, 500);
    }

    // Extract user info from payload
    if (!payload.sub) {
      return c.json({ 
        error: 'Invalid Token', 
        message: 'Token does not contain user ID' 
      }, 401);
    }

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    // Set user in context for downstream handlers
    c.set('user', user);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return c.json({ 
          error: 'Token Expired', 
          message: 'Your session has expired. Please sign in again.' 
        }, 401);
      }
      if (error.message.includes('signature')) {
        return c.json({ 
          error: 'Invalid Token', 
          message: 'Token signature verification failed' 
        }, 401);
      }
    }

    return c.json({ 
      error: 'Authentication Failed', 
      message: 'Could not verify authentication token' 
    }, 401);
  }
}

/**
 * Optional auth middleware - doesn't fail if no token is provided,
 * but will set the user if a valid token is present.
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user
    await next();
    return;
  }

  // If token is provided, verify it
  return authMiddleware(c, next);
}
